import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useDeleteOrderMutation,
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
} from '../store/api/ordersApi'
import type { Order, OrderStatus } from '../types'
import ConfirmDialog from './ConfirmDialog'
import Spinner from './Spinner'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import { useDateFormatter, usePriceFormatter } from '../lib/format'

export interface OrdersModalProps {
  open: boolean
  onClose: () => void
  /**
   * Режим модалки:
   * - 'admin' — полное управление заказами (по умолчанию)
   * - 'user' — read-only список собственных заказов (createdBy: 'user')
   */
  mode?: 'admin' | 'user'
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-amber-100 text-amber-800 border-amber-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-gray-200 text-gray-700 border-gray-300',
}

const ALL_STATUSES: OrderStatus[] = ['new', 'processing', 'completed', 'cancelled']

function OrdersModalComponent({
  open,
  onClose,
  mode = 'admin',
}: OrdersModalProps) {
  const { t } = useTranslation()
  const formatPrice = usePriceFormatter()
  const formatDate = useDateFormatter()
  const isUserMode = mode === 'user'
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const { data: orders, isLoading, isError, refetch } = useGetOrdersQuery(
    {
      status: statusFilter,
      ...(mode === 'user' ? { createdBy: 'user' as const } : {}),
    },
    { skip: !open },
  )

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateOrderStatusMutation()
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation()

  // Закрытие по Esc
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deletingOrder) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose, deletingOrder])

  // Блокировка скролла body
  // Блокировка скролла body на время открытия (через глобальный hook со счётчиком)
  useBodyScrollLock(open);

  const handleStatusChange = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      setActionError(null)
      try {
        await updateStatus({ id: orderId, status: newStatus }).unwrap()
      } catch (e) {
        const message =
          (e as { message?: string } | undefined)?.message ??
          t('orders.updateStatusFailed')
        setActionError(message)
      }
    },
    [updateStatus, t],
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingOrder) return
    setActionError(null)
    try {
      await deleteOrder(deletingOrder.id).unwrap()
      setDeletingOrder(null)
    } catch (e) {
      const message =
        (e as { message?: string } | undefined)?.message ??
        t('orders.deleteFailed')
      setActionError(message)
    }
  }, [deletingOrder, deleteOrder, t])

  const totalSummary = useMemo(() => {
    if (!orders || orders.length === 0) return null
    const sum = orders.reduce((acc, o) => acc + o.total, 0)
    return { count: orders.length, sum }
  }, [orders])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="orders-modal-title"
      >
        <button
          type="button"
          aria-label={t('common.close')}
          className="absolute inset-0 bg-black/50 transition"
          onClick={() => !deletingOrder && onClose()}
        />

        <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-xl bg-white shadow-xl sm:rounded-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <h2
                id="orders-modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                {isUserMode ? t('orders.titleUser') : t('orders.titleAdmin')}
              </h2>
              {totalSummary && (
                <span className="text-sm text-gray-500">
                  {t('orders.summaryCount', { count: totalSummary.count })}{' '}
                  {t('orders.summaryTotal', { amount: formatPrice(totalSummary.sum) })}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={t('common.close')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Фильтр по статусу */}
          <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 bg-gray-50 px-5 py-3">
            <span className="text-sm text-gray-600">{t('orders.statusLabel')}:</span>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                statusFilter === 'all'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t('orders.statusFilterAll')}
            </button>
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  statusFilter === s
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t(`orderStatus.${s}`)}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {actionError && (
              <div
                className="mb-3 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {actionError}
              </div>
            )}

            {isLoading && (
              <div className="flex min-h-[240px] items-center justify-center">
                <Spinner size="md" label={t('orders.loading')} />
              </div>
            )}

            {isError && !isLoading && (
              <div className="flex flex-col items-center gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-center">
                <p className="text-sm text-red-700">{t('orders.loadFailed')}</p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700"
                >
                  {t('common.retry')}
                </button>
              </div>
            )}

            {!isLoading && !isError && orders && orders.length === 0 && (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
                <p className="text-base font-medium text-gray-700">
                  {isUserMode ? t('orders.emptyUser') : t('orders.emptyAdmin')}
                </p>
                <p className="text-sm text-gray-500">
                  {isUserMode
                    ? statusFilter === 'all'
                      ? t('orders.emptyUserHint')
                      : t('orders.emptyFilteredUser')
                    : statusFilter === 'all'
                      ? t('orders.emptyAdminHint')
                      : t('orders.emptyFilteredAdmin')}
                </p>
              </div>
            )}

            {!isLoading && orders && orders.length > 0 && (
              <ul className="space-y-3">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    {/* Шапка заказа */}
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {t('orders.orderNumber', { id: order.id })}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status]}`}
                          >
                            {t(`orderStatus.${order.status}`)}
                          </span>
                          {!isUserMode && (
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                                order.createdBy === 'admin'
                                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                                  : 'border-blue-200 bg-blue-50 text-blue-800'
                              }`}
                              title={
                                order.createdBy === 'admin'
                                  ? t('orders.createdByAdminTitle')
                                  : t('orders.createdByUserTitle')
                              }
                            >
                              {order.createdBy === 'admin'
                                ? t('orders.createdByAdmin')
                                : t('orders.createdByUser')}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{t('orders.total')}</div>
                        <div className="text-base font-bold text-gray-900">
                          {formatPrice(order.total)}
                        </div>
                      </div>
                    </div>

                    {/* Позиции */}
                    <ul className="mb-3 divide-y divide-gray-100 rounded-md border border-gray-100">
                      {order.items.map((it) => (
                        <li
                          key={it.productId}
                          className="flex items-center gap-3 px-3 py-2"
                        >
                          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                            {it.image ? (
                              <img
                                src={it.image}
                                alt={it.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm text-gray-900">
                              {it.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {it.quantity} × {formatPrice(it.price)}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(it.price * it.quantity)}
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Действия: смена статуса + удаление */}
                    {isUserMode ? (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span>{t('orders.statusLabel')}:</span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[order.status]}`}
                        >
                          {t(`orderStatus.${order.status}`)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <span>{t('orders.statusLabel')}:</span>
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(
                                order.id,
                                e.target.value as OrderStatus,
                              )
                            }
                            disabled={isUpdatingStatus}
                            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          >
                            {ALL_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {t(`orderStatus.${s}`)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          onClick={() => setDeletingOrder(order)}
                          className="rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {t('orders.deleteOrder')}
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deletingOrder)}
        title={t('orders.deleteOrderConfirmTitle')}
        message={
          deletingOrder
            ? t('orders.deleteOrderConfirmMessage', {
                id: deletingOrder.id,
                amount: formatPrice(deletingOrder.total),
              })
            : ''
        }
        confirmLabel={isDeleting ? t('common.loading') : t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => !isDeleting && setDeletingOrder(null)}
      />
    </>
  )
}

const OrdersModal = memo(OrdersModalComponent)
export default OrdersModal
export { OrdersModal }
