import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Filters, Sort, SortField, SortOrder } from '../../types';
import { STORAGE_KEYS } from '../../constants/storage';
const STORAGE_KEY = STORAGE_KEYS.FILTERS;

const defaultFilters: Filters = {
  search: '',
  category: null,
  priceMin: null,
  priceMax: null,
  sort: {
    field: 'none',
    order: 'none',
  },
};

// Загрузка фильтров из localStorage
function loadFromStorage(): Filters {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultFilters;
    const parsed = JSON.parse(raw) as Partial<Filters>;
    return {
      search: typeof parsed.search === 'string' ? parsed.search : '',
      category:
        typeof parsed.category === 'string' || parsed.category === null
          ? parsed.category
          : null,
      priceMin:
        typeof parsed.priceMin === 'number' ? parsed.priceMin : null,
      priceMax:
        typeof parsed.priceMax === 'number' ? parsed.priceMax : null,
      sort: {
        field: (parsed.sort?.field as SortField) ?? 'none',
        order: (parsed.sort?.order as SortOrder) ?? 'none',
      },
    };
  } catch {
    return defaultFilters;
  }
}

// Сохранение фильтров в localStorage
function saveToStorage(state: Filters): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Игнорируем ошибки записи (например, если localStorage недоступен)
  }
}

const initialState: Filters = loadFromStorage();

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      saveToStorage(state);
    },
    setCategory(state, action: PayloadAction<string | null>) {
      state.category = action.payload;
      saveToStorage(state);
    },
    setPriceMin(state, action: PayloadAction<number | null>) {
      state.priceMin = action.payload;
      saveToStorage(state);
    },
    setPriceMax(state, action: PayloadAction<number | null>) {
      state.priceMax = action.payload;
      saveToStorage(state);
    },
    setPriceRange(
      state,
      action: PayloadAction<{ min: number | null; max: number | null }>
    ) {
      state.priceMin = action.payload.min;
      state.priceMax = action.payload.max;
      saveToStorage(state);
    },
    setSort(state, action: PayloadAction<Sort>) {
      state.sort = action.payload;
      saveToStorage(state);
    },
    resetFilters(state) {
      state.search = defaultFilters.search;
      state.category = defaultFilters.category;
      state.priceMin = defaultFilters.priceMin;
      state.priceMax = defaultFilters.priceMax;
      state.sort = { ...defaultFilters.sort };
      saveToStorage(state);
    },
  },
});

export const {
  setSearch,
  setCategory,
  setPriceMin,
  setPriceMax,
  setPriceRange,
  setSort,
  resetFilters,
} = filtersSlice.actions;

// Селектор количества активных фильтров (для бейджа на кнопке)
export const selectActiveFiltersCount = (state: { filters: Filters }): number => {
  const f = state.filters;
  return (
    (f.search ? 1 : 0) +
    (f.category ? 1 : 0) +
    (f.priceMin !== null ? 1 : 0) +
    (f.priceMax !== null ? 1 : 0) +
    (f.sort.field !== 'none' ? 1 : 0)
  );
};

export default filtersSlice.reducer;
