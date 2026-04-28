import { memo, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  clearCart,
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
  selectCartItems,
  selectCartTotalPrice,
  selectCartTotalQuantity,
  setQuantity,
} from '../store/slices/cartSlice'
import { selectIsAdmin } from '../store/slices/authSlice'
import { useCreateOrderMutation } from '../store/api/ordersApi'
import { usePriceFormatter } from '../lib/format'
import { getErrorMessage } from '../lib/errors'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
export interface CartModalProps {
  open: boolean
  onClose: () => void
}

function CartModalComponent({ open, onClose }: CartModalProps) {
  const { t } = useTranslation()
  const formatPrice = usePriceFormatter()
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectCartItems)
  const totalPrice = useAppSelector(selectCartTotalPrice)
  const totalQuantity = useAppSelector(selectCartTotalQuantity)
  const isAdmin = useAppSelector(selectIsAdmin)

  const [createOrder, { isLoading: isPlacingOrder }] = useCreateOrderMutation()
  const [orderError, setOrderError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Сбрасываем сообщения при каждом открытии модалки
  useEffect(() => {
    if (open) {
      setOrderError(null)
      setSuccessMessage(null)
    }
  }, [open])

  const handlePlaceOrder = useCallback(async () => {
    if (items.length === 0) return
    if (isAdmin) return // защита: админ не оформляет заказ
    setOrderError(null)
    try {
      const order = await createOrder({
        items: items.map((it) => ({ ...it })),
        createdBy: 'user',
      }).unwrap()
      dispatch(clearCart())
      setSuccessMessage(`${t('cart.orderPlaced')} (${order.id})`)
    } catch (e) {
      setOrderError(getErrorMessage(e, t, 'cart.orderFailed'))
    }
  }, [items, createOrder, isAdmin, dispatch, t])

  // Закрытие по Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Блокировка скролла body
  // Блокировка скролла body на время открытия (через глобальный hook со счётчиком)
  useBodyScrollLock(open);

  const handleQuantityInput = useCallback(
    (productId: string, raw: string) => {
      const num = Number.parseInt(raw, 10)
      if (Number.isNaN(num)) {
        dispatch(setQuantity({ productId, quantity: 1 }))
        return
      }
      dispatch(setQuantity({ productId, quantity: num }))
    },
    [dispatch]
  )

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-modal-title"
    >
      {/* Overlay */}
      <button
        type="button"
        aria-label={t('common.close')}
        className="absolute inset-0 bg-black/50 transition"
        onClick={onClose}
      />

      {/* Содержимое */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-xl bg-white shadow-xl sm:rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2
            id="cart-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            {isAdmin ? t('cart.titleAdmin') : t('cart.title')}
            {totalQuantity > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({t('cart.itemCount', { count: totalQuantity })})
              </span>
            )}
          </h2>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isAdmin && (
            <div
              className="mb-4 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800"
              role="note"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="mt-0.5 h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="space-y-1">
                <div>{t('cart.adminHelpText')}</div>
                <div>
                  <strong className="font-semibold">
                    {t('cart.adminCannotOrder')}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div
              className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
              role="status"
            >
              {successMessage}
            </div>
          )}

          {orderError && (
            <div
              className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {orderError}
            </div>
          )}
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-12 w-12 text-gray-300"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272"
                />
              </svg>
              <p className="text-base font-medium text-gray-700">
                {t('cart.empty')}
              </p>
              <p className="text-sm text-gray-500">
                {t('cart.emptyHint')}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {items.map((item) => {
                const lineTotal = item.price * item.quantity
                return (
                  <li
                    key={item.productId}
                    className="flex gap-4 py-4"
                  >
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          {t('product.noImage')}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(removeFromCart(item.productId))
                          }
                          className="flex-shrink-0 rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                          aria-label={t('cart.removeAriaLabel', { name: item.name })}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="mt-1 text-sm text-gray-500">
                        {t('cart.pricePerUnit', { price: formatPrice(item.price) })}
                      </div>

                      <div className="mt-auto flex items-end justify-between pt-2">
                        <div className="inline-flex items-center rounded-md border border-gray-300">
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(decrementQuantity(item.productId))
                            }
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={t('cart.decreaseAriaLabel')}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityInput(
                                item.productId,
                                e.target.value
                              )
                            }
                            className="w-12 border-x border-gray-300 bg-white py-1 text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            aria-label={t('cart.quantityAriaLabel', { name: item.name })}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(incrementQuantity(item.productId))
                            }
                            className="px-2 py-1 text-gray-600 transition hover:bg-gray-50"
                            aria-label={t('cart.increaseAriaLabel')}
                          >
                            +
                          </button>
                        </div>

                        <div className="text-sm font-semibold text-gray-900">
                          {formatPrice(lineTotal)}
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">{t('cart.total')}:</span>
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(totalPrice)}
              </span>
            </div>
            {isAdmin && (
              <p className="mb-3 text-xs text-gray-500">
                {t('cart.adminCannotOrder')}
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => dispatch(clearCart())}
                disabled={isPlacingOrder}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t('cart.clearCart')}
              </button>
              {!isAdmin && (
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || items.length === 0}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPlacingOrder ? t('cart.placingOrder') : t('cart.placeOrder')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const CartModal = memo(CartModalComponent)
export default CartModal
export { CartModal }
