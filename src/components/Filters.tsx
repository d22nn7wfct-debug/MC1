import { useEffect, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  resetFilters,
  selectActiveFiltersCount,
  setCategory,
  setPriceRange,
  setSearch,
  setSort,
} from '../store/slices/filtersSlice';
import type { RootState } from '../store';
import type { Sort, SortField, SortOrder } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { useGetCategoriesQuery } from '../store/api/productsApi';

// Значение для select сортировки кодируем как `${field}:${order}`
type SortKey = 'none' | 'price:asc' | 'price:desc' | 'name:asc' | 'name:desc';

function sortToKey(sort: Sort): SortKey {
  if (sort.field === 'none' || sort.order === 'none') return 'none';
  return `${sort.field}:${sort.order}` as SortKey;
}

function keyToSort(key: SortKey): Sort {
  if (key === 'none') return { field: 'none', order: 'none' };
  const parts = key.split(':');
  const field = (parts[0] ?? 'none') as SortField;
  const order = (parts[1] ?? 'none') as SortOrder;
  return { field, order };
}

export interface FiltersProps {
  /** Колбэк закрытия (для drawer на мобильных). Если не задан — крестик не показывается. */
  onClose?: () => void;
}

function Filters({ onClose }: FiltersProps = {}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state: RootState) => state.filters);
  const activeCount = useAppSelector(selectActiveFiltersCount);

  // Локальное состояние для полей с debounce (поиск и цены)
  const [searchInput, setSearchInput] = useState(filters.search);
  const [priceMinInput, setPriceMinInput] = useState<string>(
    filters.priceMin === null ? '' : String(filters.priceMin)
  );
  const [priceMaxInput, setPriceMaxInput] = useState<string>(
    filters.priceMax === null ? '' : String(filters.priceMax)
  );

  const debouncedSearch = useDebounce(searchInput, 400);
  const debouncedMin = useDebounce(priceMinInput, 500);
  const debouncedMax = useDebounce(priceMaxInput, 500);

  // Справочники
  const { data: categories = [], isLoading: catsLoading } =
    useGetCategoriesQuery();

  // Применяем поиск с debounce
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      dispatch(setSearch(debouncedSearch));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Применяем диапазон цен с debounce
  useEffect(() => {
    const min = debouncedMin === '' ? null : Number(debouncedMin);
    const max = debouncedMax === '' ? null : Number(debouncedMax);

    const minValid = min === null || (Number.isFinite(min) && min >= 0);
    const maxValid = max === null || (Number.isFinite(max) && max >= 0);
    if (!minValid || !maxValid) return;

    if (min !== filters.priceMin || max !== filters.priceMax) {
      dispatch(setPriceRange({ min, max }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMin, debouncedMax]);

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    dispatch(setCategory(value === '' ? null : value));
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value as SortKey;
    dispatch(setSort(keyToSort(key)));
  };

  const handleReset = () => {
    dispatch(resetFilters());
    setSearchInput('');
    setPriceMinInput('');
    setPriceMaxInput('');
  };

  const inputBase =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm ' +
    'focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ' +
    'disabled:bg-gray-100';

  return (
    <div
      className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200"
      aria-label={t('filters.title')}
    >
      {/* Шапка фильтров */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <span>{t('filters.title')}</span>
          {activeCount > 0 && (
            <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-xs font-semibold text-white">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded text-sm font-medium text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('common.reset')}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
              aria-label={t('filters.closeAriaLabel')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div id="filters-content" className="space-y-4">
        {/* Поиск */}
        <div>
          <label
            htmlFor="filter-search"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {t('filters.searchLabel')}
          </label>
          <input
            id="filter-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('filters.searchPlaceholder')}
            className={inputBase}
          />
        </div>

        {/* Категория */}
        <div>
          <label
            htmlFor="filter-category"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {t('filters.categoryLabel')}
          </label>
          <select
            id="filter-category"
            value={filters.category ?? ''}
            onChange={handleCategoryChange}
            disabled={catsLoading}
            className={inputBase}
          >
            <option value="">{t('filters.categoryAll')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>


        {/* Цена */}
        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">
            {t('filters.priceLabel')}
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={priceMinInput}
              onChange={(e) => setPriceMinInput(e.target.value)}
              placeholder={t('filters.priceMinPlaceholder')}
              className={inputBase}
              aria-label={t('filters.priceMinAriaLabel')}
            />
            <span className="text-gray-400">—</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={priceMaxInput}
              onChange={(e) => setPriceMaxInput(e.target.value)}
              placeholder={t('filters.priceMaxPlaceholder')}
              className={inputBase}
              aria-label={t('filters.priceMaxAriaLabel')}
            />
          </div>
        </div>

        {/* Сортировка */}
        <div>
          <label
            htmlFor="filter-sort"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            {t('filters.sortLabel')}
          </label>
          <select
            id="filter-sort"
            value={sortToKey(filters.sort)}
            onChange={handleSortChange}
            className={inputBase}
          >
            <option value="none">{t('filters.sortNone')}</option>
            <option value="price:asc">{t('filters.sortPriceAsc')}</option>
            <option value="price:desc">{t('filters.sortPriceDesc')}</option>
            <option value="name:asc">{t('filters.sortNameAsc')}</option>
            <option value="name:desc">{t('filters.sortNameDesc')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Filters;
export { Filters };
