import { describe, it, expect, beforeEach } from 'vitest';
import filtersReducer, {
  setSearch,
  setCategory,
  setPriceMin,
  setPriceMax,
  setPriceRange,
  setSort,
  resetFilters,
  selectActiveFiltersCount,
} from './filtersSlice';
import type { Filters } from '../../types';

const defaultFilters: Filters = {
  search: '',
  category: null,
  priceMin: null,
  priceMax: null,
  sort: { field: 'none', order: 'none' },
};

describe('filtersSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('reducers', () => {
    it('setSearch обновляет search', () => {
      const next = filtersReducer(defaultFilters, setSearch('phone'));
      expect(next.search).toBe('phone');
    });

    it('setCategory обновляет category', () => {
      const next = filtersReducer(defaultFilters, setCategory('cat-1'));
      expect(next.category).toBe('cat-1');
    });

    it('setCategory может сбросить в null', () => {
      const state: Filters = { ...defaultFilters, category: 'cat-1' };
      const next = filtersReducer(state, setCategory(null));
      expect(next.category).toBeNull();
    });

    it('setPriceMin / setPriceMax', () => {
      let state = filtersReducer(defaultFilters, setPriceMin(100));
      expect(state.priceMin).toBe(100);
      state = filtersReducer(state, setPriceMax(500));
      expect(state.priceMax).toBe(500);
    });

    it('setPriceRange задаёт обе границы сразу', () => {
      const next = filtersReducer(
        defaultFilters,
        setPriceRange({ min: 10, max: 20 }),
      );
      expect(next.priceMin).toBe(10);
      expect(next.priceMax).toBe(20);
    });

    it('setSort обновляет сортировку', () => {
      const next = filtersReducer(
        defaultFilters,
        setSort({ field: 'price', order: 'asc' }),
      );
      expect(next.sort).toEqual({ field: 'price', order: 'asc' });
    });

    it('resetFilters возвращает к дефолту', () => {
      const dirty: Filters = {
        search: 'foo',
        category: 'cat-1',
        priceMin: 10,
        priceMax: 100,
        sort: { field: 'price', order: 'desc' },
      };
      const next = filtersReducer(dirty, resetFilters());
      expect(next).toEqual(defaultFilters);
    });
  });

  describe('selectActiveFiltersCount', () => {
    it('возвращает 0 при дефолтных фильтрах', () => {
      expect(selectActiveFiltersCount({ filters: defaultFilters })).toBe(0);
    });

    it('считает search', () => {
      expect(
        selectActiveFiltersCount({
          filters: { ...defaultFilters, search: 'foo' },
        }),
      ).toBe(1);
    });

    it('считает category', () => {
      expect(
        selectActiveFiltersCount({
          filters: { ...defaultFilters, category: 'cat-1' },
        }),
      ).toBe(1);
    });

    it('считает priceMin и priceMax независимо', () => {
      expect(
        selectActiveFiltersCount({
          filters: { ...defaultFilters, priceMin: 10 },
        }),
      ).toBe(1);
      expect(
        selectActiveFiltersCount({
          filters: { ...defaultFilters, priceMin: 10, priceMax: 100 },
        }),
      ).toBe(2);
    });

    it('считает sort, если field !== none', () => {
      expect(
        selectActiveFiltersCount({
          filters: {
            ...defaultFilters,
            sort: { field: 'price', order: 'asc' },
          },
        }),
      ).toBe(1);
    });

    it('суммирует все активные фильтры', () => {
      expect(
        selectActiveFiltersCount({
          filters: {
            search: 'foo',
            category: 'cat-1',
            priceMin: 10,
            priceMax: 100,
            sort: { field: 'name', order: 'asc' },
          },
        }),
      ).toBe(5);
    });
  });
});
