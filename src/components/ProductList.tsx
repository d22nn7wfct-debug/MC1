import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../store/hooks';
import type { RootState } from '../store';
import { useGetProductsQuery } from '../store/api/productsApi';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { getErrorMessage } from '../lib/errors';
import type { Brand, Category, Product } from '../types';
import { ProductCard } from './ProductCard';
import { Spinner } from './Spinner';

export interface ProductListProps {
  categories?: Category[];
  brands?: Brand[];
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 12;

/**
 * Список товаров с бесконечной прокруткой.
 *
 * - Подписывается на фильтры/сортировку из Redux.
 * - При смене фильтров сбрасывает страницу на 1 — RTK Query сам подменит
 *   данные в кэше через `merge` (page=1 заменяет всё, page>1 добавляет).
 * - При попадании sentinel в зону видимости запрашивает следующую страницу.
 *
 * Источник истины для отображаемых товаров — `data.items` из RTK Query
 * (НЕ локальный аккумулятор), это устраняет гонку между сбросом
 * локального состояния и приходом новых данных.
 */
export function ProductList({
  categories,
  brands,
  isAdmin = false,
  onEdit,
  onDelete,
  pageSize = DEFAULT_PAGE_SIZE,
}: ProductListProps) {
  const { t } = useTranslation();
  const filters = useAppSelector((state: RootState) => state.filters);

  // Ключ фильтров — для сброса пагинации при их изменении
  const filtersKey = useMemo(
    () =>
      JSON.stringify({
        search: filters.search,
        category: filters.category,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        sort: filters.sort,
        pageSize,
      }),
    [filters, pageSize],
  );

  const [page, setPage] = useState(1);

  // При смене фильтров — сбрасываем страницу на 1.
  // RTK Query при page=1 в `merge` заменит весь кэш свежими данными.
  useEffect(() => {
    setPage(1);
  }, [filtersKey]);

  const queryArg = useMemo(() => {
    const arg: import('../types').ProductsQueryParams = {
      page,
      limit: pageSize,
      sort: filters.sort,
    };
    if (filters.search) arg.search = filters.search;
    if (filters.category != null) arg.category = filters.category;
    if (filters.priceMin != null) arg.priceMin = filters.priceMin;
    if (filters.priceMax != null) arg.priceMax = filters.priceMax;
    return arg;
  }, [page, pageSize, filters]);

  const { data, isFetching, isLoading, isError, error, refetch } =
    useGetProductsQuery(queryArg);

  // Источник истины для UI — items из RTK Query (он сам мержит страницы).
  const items = data?.items ?? [];
  const hasMore = Boolean(data?.hasMore);

  const handleLoadMore = () => {
    if (!isFetching && hasMore) {
      setPage((p) => p + 1);
    }
  };

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: isFetching,
    onLoadMore: handleLoadMore,
  });

  // === Состояния ===

  // Первичная загрузка (нет ещё данных)
  if (isLoading && items.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" label={t('catalog.loadingProducts')} />
      </div>
    );
  }

  // Ошибка при первичной загрузке
  if (isError && items.length === 0) {
    const message = getErrorMessage(error, t, 'errors.networkError');
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-base font-medium text-red-700">{t('catalog.loadFailed')}</p>
        <p className="text-sm text-red-600">{message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  // Пусто (загрузка завершена, ничего не нашли)
  if (!isLoading && !isFetching && items.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center">
        <p className="text-base font-medium text-gray-700">{t('catalog.noResults')}</p>
        <p className="text-sm text-gray-500">{t('catalog.noResultsHint')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            categories={categories}
            brands={brands}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Подгрузка следующей страницы / sentinel */}
      <div
        ref={sentinelRef}
        className="flex min-h-[60px] items-center justify-center py-4"
        aria-hidden={!hasMore}
      >
        {isFetching && items.length > 0 ? (
          <Spinner size="md" label={t('catalog.loadingMore')} />
        ) : !hasMore ? (
          <span className="text-sm text-gray-500">{t('catalog.endOfList')}</span>
        ) : null}
      </div>

      {/* Ошибка при подгрузке следующей страницы (когда уже что-то показано) */}
      {isError && items.length > 0 && (
        <div className="flex flex-col items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-center">
          <p className="text-sm text-red-700">{t('catalog.loadMoreFailed')}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700"
          >
            {t('common.retry')}
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductList;
