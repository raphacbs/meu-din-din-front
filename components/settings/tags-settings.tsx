"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  ColorPicker,
  Empty,
  Input,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import type { AggregationColor } from "antd/es/color-picker/color";
import type { ColumnsType } from "antd/es/table";

import { TagColorModal } from "@/components/ui/tag-color-modal";
import { ApiError } from "@/lib/api/client";
import { tagsApi } from "@/lib/api/tags";
import { queryKeys } from "@/lib/query/keys";
import { DEFAULT_TAG_COLOR, TAG_COLOR_PRESETS, normalizeTagColor, normalizeTagName } from "@/lib/tags/constants";
import type { TagSummary } from "@/lib/types/api";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  return fallback;
}

async function invalidateTagRelatedQueries(queryClient: ReturnType<typeof useQueryClient>) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.tags }),
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
    queryClient.invalidateQueries({ queryKey: queryKeys.projection }),
    queryClient.invalidateQueries({ queryKey: ["analytics"] }),
  ]);
}

export function TagsSettings() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTag, setEditingTag] = useState<TagSummary | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState(DEFAULT_TAG_COLOR);

  const tagsQuery = useQuery({
    queryKey: queryKeys.tags,
    queryFn: () => tagsApi.list(),
  });

  const normalizedSearchQuery = searchQuery.trim().toUpperCase();
  const filteredTags = useMemo(() => {
    const tags = tagsQuery.data ?? [];
    if (!normalizedSearchQuery) {
      return tags;
    }

    return tags.filter((tag) => normalizeTagName(tag.name).includes(normalizedSearchQuery));
  }, [normalizedSearchQuery, tagsQuery.data]);

  const upsertMutation = useMutation({
    mutationFn: tagsApi.upsert,
    onSuccess: async () => {
      await invalidateTagRelatedQueries(queryClient);
      message.success("Cor da tag atualizada");
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Não foi possível salvar a cor da tag."));
    },
  });

  const renameMutation = useMutation({
    mutationFn: tagsApi.rename,
    onSuccess: async () => {
      await invalidateTagRelatedQueries(queryClient);
      message.success("Tag atualizada");
      setEditingTag(null);
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Não foi possível atualizar a tag."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (tagName: string) => tagsApi.delete(tagName),
    onSuccess: async () => {
      await invalidateTagRelatedQueries(queryClient);
      message.success("Tag excluída");
    },
    onError: (error) => {
      message.error(getErrorMessage(error, "Não foi possível excluir a tag."));
    },
  });

  async function handleColorChange(record: TagSummary, color: AggregationColor) {
    const nextColor = normalizeTagColor(color.toHexString());
    if (nextColor === record.color) {
      return;
    }

    await upsertMutation.mutateAsync({ name: normalizeTagName(record.name), color: nextColor });
  }

  function openEditModal(record: TagSummary) {
    setEditingTag(record);
    setEditName(record.name);
    setEditColor(record.color);
  }

  async function handleEditSubmit() {
    if (!editingTag) {
      return;
    }

    const trimmedName = normalizeTagName(editName);
    if (!trimmedName) {
      message.error("Informe um nome válido.");
      return;
    }

    try {
      if (trimmedName !== editingTag.name) {
        await renameMutation.mutateAsync({ from: editingTag.name, to: trimmedName });
      }

      if (editColor !== editingTag.color || trimmedName !== editingTag.name) {
        await upsertMutation.mutateAsync({ name: trimmedName, color: editColor });
      }

      setEditingTag(null);
    } catch (error) {
      message.error(getErrorMessage(error, "Não foi possível atualizar a tag."));
    }
  }

  const columns: ColumnsType<TagSummary> = [
    {
      title: "Tag",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => <Tag color={record.color}>{name}</Tag>,
    },
    {
      title: "Cor",
      dataIndex: "color",
      key: "color",
      width: 160,
      render: (color: string, record) => (
        <ColorPicker
          value={color}
          disabled={upsertMutation.isPending}
          presets={[{ label: "Sugestões", colors: [...TAG_COLOR_PRESETS] }]}
          onChangeComplete={(nextColor) => void handleColorChange(record, nextColor)}
        />
      ),
    },
    {
      title: "Usos",
      dataIndex: "usageCount",
      key: "usageCount",
      width: 100,
    },
    {
      title: "Ações",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => openEditModal(record)}>
            Editar
          </Button>
          <Popconfirm
            title="Excluir tag?"
            description={`Remove "${record.name}" de todas as transações.`}
            okText="Excluir"
            cancelText="Cancelar"
            okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
            onConfirm={() => deleteMutation.mutate(record.name)}
          >
            <Button type="link" size="small" danger loading={deleteMutation.isPending}>
              Excluir
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const hasTags = (tagsQuery.data?.length ?? 0) > 0;
  const emptyDescription =
    hasTags && normalizedSearchQuery
      ? "Nenhuma tag encontrada para essa busca."
      : "Nenhuma tag cadastrada ainda.";

  return (
    <>
      <Input.Search
        allowClear
        aria-label="Pesquisar tags"
        placeholder="Pesquisar tags"
        value={searchQuery}
        style={{ marginBottom: 16, maxWidth: 320 }}
        onChange={(event) => setSearchQuery(event.target.value)}
      />

      <Table<TagSummary>
        rowKey="name"
        size="middle"
        loading={tagsQuery.isLoading}
        columns={columns}
        dataSource={filteredTags}
        pagination={false}
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyDescription} />
          ),
        }}
      />

      <TagColorModal
        open={editingTag != null}
        title="Editar tag"
        tagName={editName}
        color={editColor}
        nameEditable
        confirmLoading={renameMutation.isPending || upsertMutation.isPending}
        onTagNameChange={setEditName}
        onColorChange={setEditColor}
        onCancel={() => setEditingTag(null)}
        onConfirm={() => void handleEditSubmit()}
      />
    </>
  );
}
