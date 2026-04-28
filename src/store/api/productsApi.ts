import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import i18n from 'i18next';
import {
  fetchProducts,
  fetchCategories,
  fetchBrands,
  fetchProductById,
  updateProduct,
  deleteProduct,
  createProduct,
} from '../../api/mockApi';
import type {
  Product,
  Category,
  Brand,
  ProductsQueryParams,
  ProductsApiResponse,
  ProductFormData,
  ApiError,
} from '../../types';

/**
 * Runtime-guard: проверяем роль из auth-стейта перед мутацией.
 * Защита от обхода UI (например, прямого вызова mutation из консоли).
 * Если не admin — возвращаем ApiError 403.
 */
function ensureAdmin(getState: () => unknown): ApiError | null {
  const state = getState() as { auth?: { role?: string } };
  if (state?.auth?.role !== 'admin') {
    return { status: 403, message: 'Доступ запрещён: только администратор может изменять каталог' };
  }
  return null;
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: ['Product', 'Products', 'Category', 'Brand'],
  endpoints: (builder) => ({
    /**
     * Получение списка товаров.
     * Поддерживает infinite scroll: при изменении страницы (page > 1)
     * результаты мержатся с уже загруженными в кэше.
     * Кэш-ключ зависит от ВСЕХ параметров КРОМЕ page —
     * так все страницы одного фильтра попадают в один кэш.
     */
    getProducts: builder.query<ProductsApiResponse, ProductsQueryParams>({
      queryFn: async (params) => {
        try {
          // Принимаем как плоские sortField/sortOrder, так и объект sort —
          // нормализуем к формату, ожидаемому mockApi (плоские поля).
          const { sort, sortField, sortOrder, ...rest } = params;
          const normalized: ProductsQueryParams = {
            ...rest,
            sortField: sortField ?? sort?.field ?? 'none',
            sortOrder: sortOrder ?? sort?.order ?? 'none',
          };
          const data = await fetchProducts(normalized);
          return { data };
        } catch (error) {
          return { error: error as ApiError };
        }
      },
      // Все страницы одного набора фильтров → один кэш-ключ
      serializeQueryArgs: ({ queryArgs }) => {
        // Исключаем page из ключа кэша — все страницы одного фильтра в одном кэше
        const rest = { ...queryArgs };
        delete (rest as { page?: number }).page;
        return JSON.stringify(rest);
      },
      // Мерж страниц для infinite scroll
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          // Первая страница — заменяем весь кэш (например, при смене фильтров)
          return newItems;
        }
        return {
          ...newItems,
          items: [...currentCache.items, ...newItems.items],
        };
      },
      // Перезапрашиваем при изменении любого аргумента запроса.
      // sort/sortField/sortOrder поддерживаются обоими способами.
      forceRefetch: ({ currentArg, previousArg }) => {
        if (!previousArg || !currentArg) return true;
        const curSortField = currentArg.sortField ?? currentArg.sort?.field;
        const prevSortField = previousArg.sortField ?? previousArg.sort?.field;
        const curSortOrder = currentArg.sortOrder ?? currentArg.sort?.order;
        const prevSortOrder = previousArg.sortOrder ?? previousArg.sort?.order;
        return (
          currentArg.page !== previousArg.page ||
          currentArg.limit !== previousArg.limit ||
          currentArg.search !== previousArg.search ||
          currentArg.category !== previousArg.category ||
          currentArg.priceMin !== previousArg.priceMin ||
          currentArg.priceMax !== previousArg.priceMax ||
          curSortField !== prevSortField ||
          curSortOrder !== prevSortOrder
        );
      },
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((p) => ({ type: 'Product' as const, id: p.id })),
              { type: 'Products' as const, id: 'LIST' },
            ]
          : [{ type: 'Products' as const, id: 'LIST' }],
    }),

    /**
     * Получение одного товара по ID
     */
    getProductById: builder.query<Product, string>({
      queryFn: async (id) => {
        try {
          const data = await fetchProductById(id);
          return { data };
        } catch (error) {
          return { error: error as ApiError };
        }
      },
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),

    /**
     * Получение списка категорий.
     * Поле name локализуется в зависимости от текущего языка i18next:
     * - en → category.nameEn (с фоллбэком на name)
     * - ru → category.name
     */
    getCategories: builder.query<Category[], void>({
      queryFn: async () => {
        try {
          const data = await fetchCategories();
          const lang = (i18n.language || 'ru').split('-')[0] ?? 'ru';
          const localized: Category[] = data.map((c) => ({
            ...c,
            name: lang === 'en' && c.nameEn ? c.nameEn : c.name,
          }));
          return { data: localized };
        } catch (error) {
          return { error: error as ApiError };
        }
      },
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    /**
     * Получение списка брендов
     */
    getBrands: builder.query<Brand[], void>({
      queryFn: async () => {
        try {
          const data = await fetchBrands();
          return { data };
        } catch (error) {
          return { error: error as ApiError };
        }
      },
      providesTags: [{ type: 'Brand', id: 'LIST' }],
    }),

    /**
     * Обновление товара (только admin)
     */
    updateProduct: builder.mutation<
      Product,
      { id: string; data: ProductFormData }
    >({
      queryFn: async ({ id, data }, { getState }) => {
        const forbidden = ensureAdmin(getState);
        if (forbidden) return { error: forbidden };
        try {
          const result = await updateProduct(id, data);
          return { data: result };
        } catch (error) {
          return { error: error as ApiError };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Products', id: 'LIST' },
      ],
    }),

    /**
     * Удаление товара (только admin)
     */
    deleteProduct: builder.mutation<{ id: string }, string>({
      queryFn: async (id, { getState }) => {
        const forbidden = ensureAdmin(getState);
        if (forbidden) return { error: forbidden };
        try {
          const result = await deleteProduct(id);
          return { data: result };
        } catch (error) {
          return { error: error as ApiError };
        }
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product', id },
        { type: 'Products', id: 'LIST' },
      ],
    }),

    /**
     * Создание товара (только admin)
     */
    createProduct: builder.mutation<Product, ProductFormData>({
      queryFn: async (data, { getState }) => {
        const forbidden = ensureAdmin(getState);
        if (forbidden) return { error: forbidden };
        try {
          const result = await createProduct(data);
          return { data: result };
        } catch (error) {
          return { error: error as ApiError };
        }
      },
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateProductMutation,
} = productsApi;

// Подписка на смену языка: инвалидируем кэш категорий,
// чтобы автоматически перезапросить локализованные имена.
//
// ВАЖНО: cleanup (i18n.off) здесь намеренно не вызывается.
// productsApi — модульный singleton, импортируется один раз за всё время
// жизни SPA. Подписка регистрируется на уровне модуля (а не в компоненте),
// поэтому утечки в React-lifecycle нет: при выгрузке страницы и i18next
// instance, и этот listener будут уничтожены вместе с JS-контекстом.
i18n.on('languageChanged', () => {
  // Динамический import store, чтобы избежать циклической зависимости
  // (store импортирует productsApi, productsApi импортирует store).
  import('../index').then(({ store }) => {
    store.dispatch(productsApi.util.invalidateTags([{ type: 'Category', id: 'LIST' }]));
  });
});
