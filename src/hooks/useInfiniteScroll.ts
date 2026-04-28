import { useCallback, useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  /** Есть ли ещё данные для подгрузки */
  hasMore: boolean;
  /** Идёт ли сейчас загрузка (чтобы не дёргать onLoadMore повторно) */
  isLoading: boolean;
  /** Колбэк подгрузки следующей страницы */
  onLoadMore: () => void;
  /** Отступ для предзагрузки (rootMargin IntersectionObserver) */
  rootMargin?: string;
  /** Порог видимости */
  threshold?: number;
}

/**
 * Хук бесконечной прокрутки на IntersectionObserver.
 *
 * Использование:
 *   const sentinelRef = useInfiniteScroll({ hasMore, isLoading, onLoadMore });
 *   ...
 *   <div ref={sentinelRef} />
 */
export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = '200px',
  threshold = 0,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Сохраняем актуальный onLoadMore в ref, чтобы не пересоздавать observer
  const onLoadMoreRef = useRef(onLoadMore);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  // Очистка observer при размонтировании
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      // Отключаем предыдущий observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node) return;
      if (!hasMore) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry?.isIntersecting && hasMore && !isLoading) {
            onLoadMoreRef.current();
          }
        },
        { rootMargin, threshold },
      );

      observerRef.current.observe(node);
    },
    [hasMore, isLoading, rootMargin, threshold],
  );

  return sentinelRef;
}

export default useInfiniteScroll;
