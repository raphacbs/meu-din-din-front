"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, Tag } from "antd";
import type { CustomTagProps } from "rc-select/lib/BaseSelect";
import { useState } from "react";

import { TagColorModal } from "@/components/ui/tag-color-modal";
import { ApiError } from "@/lib/api/client";
import { tagsApi } from "@/lib/api/tags";
import { queryKeys } from "@/lib/query/keys";
import { DEFAULT_TAG_COLOR, normalizeTagName, normalizeTagNames } from "@/lib/tags/constants";
import { useTagCatalog } from "@/lib/tags/use-tag-catalog";

interface TagSelectProps {
  id?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  disabled?: boolean;
}

type ColorModalState = {
  name: string;
  color: string;
  mode: "create" | "edit";
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  return fallback;
}

export function TagSelect({ id, value, onChange, disabled }: TagSelectProps) {
  const queryClient = useQueryClient();
  const { tags, getTagColor } = useTagCatalog();
  const [colorModal, setColorModal] = useState<ColorModalState | null>(null);
  const [pendingTags, setPendingTags] = useState<string[] | null>(null);

  const upsertMutation = useMutation({
    mutationFn: tagsApi.upsert,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tags });
    },
  });

  function handleChange(nextTags: string[]) {
    const normalizedNextTags = normalizeTagNames(nextTags);
    const current = normalizeTagNames(value ?? []);
    const added = normalizedNextTags.filter((tag) => !current.includes(tag));

    if (added.length > 0) {
      const newTag = added[0];
      const existsInCatalog = tags.some((tag) => tag.name === newTag);
      if (!existsInCatalog) {
        setPendingTags(normalizedNextTags);
        setColorModal({
          name: newTag,
          color: DEFAULT_TAG_COLOR,
          mode: "create",
        });
        return;
      }
    }

    onChange?.(normalizedNextTags);
  }

  function openEditColorModal(tagName: string) {
    if (disabled) {
      return;
    }

    setColorModal({
      name: tagName,
      color: getTagColor(tagName),
      mode: "edit",
    });
  }

  async function handleColorConfirm() {
    if (!colorModal) {
      return;
    }

    const trimmedName = normalizeTagName(colorModal.name);
    if (!trimmedName) {
      return;
    }

    try {
      await upsertMutation.mutateAsync({
        name: trimmedName,
        color: colorModal.color,
      });

      if (colorModal.mode === "create" && pendingTags) {
        onChange?.(normalizeTagNames(pendingTags));
        setPendingTags(null);
      }

      setColorModal(null);
    } catch (error) {
      console.error(getErrorMessage(error, "Não foi possível salvar a cor da tag."));
    }
  }

  function handleColorCancel() {
    setColorModal(null);
    setPendingTags(null);
  }

  function renderTag(props: CustomTagProps) {
    const { label, value: tagValue, closable, onClose } = props;
    const tagName = String(tagValue ?? label ?? "");
    const color = getTagColor(tagName);

    return (
      <Tag
        color={color}
        closable={closable}
        onClose={onClose}
        style={{ cursor: disabled ? "default" : "pointer", marginInlineEnd: 4 }}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openEditColorModal(tagName);
        }}
        title={disabled ? undefined : "Clique duplo para editar a cor"}
      >
        {label}
      </Tag>
    );
  }

  return (
    <>
      <Select
        id={id}
        mode="tags"
        style={{ width: "100%" }}
        placeholder="mercado, fixo, trabalho"
        value={value}
        disabled={disabled}
        tagRender={renderTag}
        options={tags.map((tag) => ({
          value: tag.name,
          label: tag.name,
        }))}
        optionRender={(option) => (
          <Tag color={getTagColor(String(option.value ?? option.label ?? ""))} style={{ margin: 0 }}>
            {option.label}
          </Tag>
        )}
        onChange={handleChange}
      />

      <TagColorModal
        open={colorModal != null}
        title={colorModal?.mode === "create" ? "Nova tag" : "Editar tag"}
        tagName={colorModal?.name ?? ""}
        color={colorModal?.color ?? DEFAULT_TAG_COLOR}
        confirmLoading={upsertMutation.isPending}
        onColorChange={(color) =>
          setColorModal((current) => (current ? { ...current, color } : current))
        }
        onCancel={handleColorCancel}
        onConfirm={() => void handleColorConfirm()}
      />
    </>
  );
}
