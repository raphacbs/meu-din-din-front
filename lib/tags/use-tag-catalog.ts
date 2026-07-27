"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { tagsApi } from "@/lib/api/tags";
import { queryKeys } from "@/lib/query/keys";
import { DEFAULT_TAG_COLOR } from "@/lib/tags/constants";
import type { TagSummary } from "@/lib/types/api";

export function useTagCatalog() {
  const query = useQuery({
    queryKey: queryKeys.tags,
    queryFn: () => tagsApi.list(),
    staleTime: 30_000,
  });

  const colorByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const tag of query.data ?? []) {
      map.set(tag.name, tag.color);
    }
    return map;
  }, [query.data]);

  function getTagColor(name: string): string {
    return colorByName.get(name) ?? DEFAULT_TAG_COLOR;
  }

  return {
    tags: (query.data ?? []) as TagSummary[],
    colorByName,
    getTagColor,
    isLoading: query.isLoading,
  };
}

/** @deprecated Use useTagCatalog().tags.map((tag) => tag.name) */
export function useTagOptions(): string[] {
  const { tags } = useTagCatalog();
  return tags.map((tag) => tag.name);
}
