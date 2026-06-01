"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

type UseVirtualListOptions = {
  itemCount: number;
  rowHeight: number;
  overscan?: number;
};

type UseVirtualListResult<TElement extends HTMLElement> = {
  containerRef: React.RefObject<TElement | null>;
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  offsetY: number;
};

/**
 * Lightweight windowing for fixed-height rows. Returns the indices and
 * translate offset of the rows that should render given the current scroll.
 */
export function useVirtualList<TElement extends HTMLElement>(
  options: UseVirtualListOptions
): UseVirtualListResult<TElement> {
  const { itemCount, rowHeight, overscan = 4 } = options;
  const containerRef = useRef<TElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const measure = () => setViewportHeight(node.clientHeight);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const onScroll = () => setScrollTop(node.scrollTop);
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => node.removeEventListener("scroll", onScroll);
  }, []);

  return useMemo(() => {
    const totalHeight = itemCount * rowHeight;
    if (viewportHeight === 0 || itemCount === 0) {
      return {
        containerRef,
        totalHeight,
        startIndex: 0,
        endIndex: Math.min(itemCount, overscan * 2),
        offsetY: 0,
      };
    }
    const visibleStart = Math.floor(scrollTop / rowHeight);
    const visibleCount = Math.ceil(viewportHeight / rowHeight);
    const startIndex = Math.max(0, visibleStart - overscan);
    const endIndex = Math.min(itemCount, visibleStart + visibleCount + overscan);
    const offsetY = startIndex * rowHeight;
    return { containerRef, totalHeight, startIndex, endIndex, offsetY };
  }, [itemCount, rowHeight, overscan, scrollTop, viewportHeight]);
}
