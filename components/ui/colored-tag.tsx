"use client";

import { Tag } from "antd";

import { useTagCatalog } from "@/lib/tags/use-tag-catalog";

interface ColoredTagProps {
  name: string;
}

export function ColoredTag({ name }: ColoredTagProps) {
  const { getTagColor } = useTagCatalog();

  return <Tag color={getTagColor(name)}>{name}</Tag>;
}
