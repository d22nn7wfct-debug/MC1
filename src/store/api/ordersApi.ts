import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  fetchOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from '../../api/mockApi';
import type {
  Order,
  OrderStatus,
  CreateOrderPayload,
  ApiError,
} from '../../types';

/**
 * Runtime-guard: проверяем роль из auth-стейта перед мутацией.
 * Защита от обхода UI (например, прямого вызова mutation из консоли).
 */
function ensureAdmin(getState: () => unknown): ApiError | null {
  const state = getState() as { auth?: { role?: string } };
  if (state?.auth?.role !== 'admin') {
    return {
      status: 403,
      code: 'FORBIDDEN_ADMIN_ONLY',
      message: 'Доступ запрещён: только администратор может управлять заказами',
    };
  }
  return null;
}

export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: fakeBaseQuery<ApiError>(),
  tagTypes: ['Order', 'Orders'],
  endpoints: (builder) => ({
    /**
     * Получение списка заказов.
     * Доступно всем залогиненным; на UI-уровне используется только админом.
     */
    getOrders: builder.query<
      Order[],
      { status?: OrderStatus | 'all'; createdBy?: 'user' | 'admin' } | void
    >({
      queryFn: async (params) => {
        try {
          const data = await fetchOrders(params ?? {});
          return { data };
        } catch (error) {
          return { error: error as ApiError };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((o) => ({ type: 'Order' as const, id: o.id })),
              { type: 'Orders' as const, id: 'LIST' },
            ]
          : [{ type: 'Orders' as const, id: 'LIST' }],
    }),

    /**
     * Создание заказа — только роль 'user'.
     * Админ может редактировать корзину, но не оформлять заказ.
     */
    createOrder: builder.mutation<Order, CreateOrderPayload>({
      queryFn: async (payload, { getState }) => {
        const state = getState() as { auth?: { role?: string } };
        if (state?.auth?.role !== 'user') {
          return {
            error: {
              status: 403,
              code: 'FORBIDDEN_USER_ONLY',
              message: 'Только пользователь может оформлять заказы',
            },
          };
        }
        try {
          const data = await createOrder(payload);
          return { data };
        } catch (error) {
          return { error: error as ApiError };
        }
      },
      invalidatesTags: [{ type: 'Orders', id: 'LIST' }],
    }),

    /**
     * Смена статуса заказа — только admin.
     */
    updateOrderStatus: builder.mutation<
      Order,
      { id: string; status: OrderStatus }
    >({
      queryFn: async ({ id, status }, { getState }) => {
        const forbidden = ensureAdmin(getState);
        if (forbidden) return { error: forbidden };
        try {
          const data = await updateOrderStatus(id, status);
          return { data };
        } catch (error) {
          return { error: error as ApiError };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Order', id },
        { type: 'Orders', id: 'LIST' },
      ],
    }),

    /**
     * Удаление заказа — только admin.
     */
    deleteOrder: builder.mutation<{ id: string }, string>({
      queryFn: async (id, { getState }) => {
        const forbidden = ensureAdmin(getState);
        if (forbidden) return { error: forbidden };
        try {
          const data = await deleteOrder(id);
          return { data };
        } catch (error) {
          return { error: error as ApiError };
        }
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'Order', id },
        { type: 'Orders', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = ordersApi;
