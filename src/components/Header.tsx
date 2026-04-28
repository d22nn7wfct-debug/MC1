import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../store/hooks'
import { selectCartTotalQuantity } from '../store/slices/cartSlice'
import { selectActiveFiltersCount } from '../store/slices/filtersSlice'
import LanguageSwitcher from './LanguageSwitcher'

export interface HeaderProps {
  onOpenCart: () => void
  onOpenFilters: () => void
  onOpenCreate?: () => void
  onOpenOrders?: () => void
  /** Открыть «Мои заказы» — для пользователя (роль 'user') */
  onOpenMyOrders?: () => void
  onLogout: () => void
  isAdmin: boolean
}

function HeaderComponent({
  onOpenCart,
  onOpenFilters,
  onOpenCreate,
  onOpenOrders,
  onOpenMyOrders,
  onLogout,
  isAdmin,
}: HeaderProps) {
  const { t } = useTranslation()
  const totalQuantity = useAppSelector(selectCartTotalQuantity)
  const activeFiltersCount = useAppSelector(selectActiveFiltersCount)

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white shadow-sm"
            aria-hidden="true"
          >
            {/* Иконка молнии */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
            </svg>
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold text-gray-900 sm:text-lg">
              {t('common.appName')}
            </span>
            <span className="hidden text-xs text-gray-500 sm:block">
              {t('common.appTagline')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && onOpenOrders && (
            <button
              type="button"
              onClick={onOpenOrders}
              className="inline-flex items-center gap-2 rounded-md border border-indigo-600 bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              aria-label={t('header.ordersAriaLabel')}
              title={t('header.orders')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v12a2 2 0 0 1-2 2z"
                />
              </svg>
              <span className="hidden sm:inline">{t('header.orders')}</span>
            </button>
          )}
          {isAdmin && onOpenCreate && (
            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex items-center gap-2 rounded-md border border-emerald-600 bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
              aria-label={t('header.addProductAriaLabel')}
              title={t('header.addProduct')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1Z" />
              </svg>
              <span className="hidden sm:inline">{t('header.addProduct')}</span>
            </button>
          )}
          {!isAdmin && onOpenMyOrders && (
            <button
              type="button"
              onClick={onOpenMyOrders}
              className="inline-flex items-center gap-2 rounded-md border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              aria-label={t('header.myOrdersAriaLabel')}
              title={t('header.myOrders')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v12a2 2 0 0 1-2 2z"
                />
              </svg>
              <span className="hidden sm:inline">{t('header.myOrders')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenFilters}
            className="relative inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 lg:hidden"
            aria-label={
              activeFiltersCount > 0
                ? `${t('header.filtersAriaLabel')}, ${t('header.activeFilters', { count: activeFiltersCount })}`
                : t('header.filtersAriaLabel')
            }
          >
            {/* Иконка фильтров */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
              />
            </svg>
            <span className="hidden sm:inline">{t('header.filters')}</span>
            {activeFiltersCount > 0 && (
              <span
                className="absolute -right-1.5 -top-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white shadow"
                aria-hidden="true"
              >
                {activeFiltersCount > 99 ? '99+' : activeFiltersCount}
              </span>
            )}
          </button>
        <button
          type="button"
          onClick={onOpenCart}
          className={`relative inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            isAdmin
              ? 'border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100 focus:ring-amber-500'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
          }`}
          aria-label={`${
            isAdmin ? t('header.cartUserAriaLabel') : t('header.cartAriaLabel')
          }${totalQuantity > 0 ? `, ${t('header.itemsInCart', { count: totalQuantity })}` : ''}`}
          title={isAdmin ? t('header.cartUserView') : t('header.cart')}
        >
          {/* Иконка корзины */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
          <span className="hidden sm:inline">
            {isAdmin ? t('header.cartUserView') : t('header.cart')}
          </span>
          {totalQuantity > 0 && (
            <span
              className="absolute -right-1.5 -top-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white shadow"
              aria-hidden="true"
            >
              {totalQuantity > 99 ? '99+' : totalQuantity}
            </span>
          )}
        </button>

          {/* Переключатель языка */}
          <div className="ml-1 border-l border-gray-200 pl-2">
            <LanguageSwitcher />
          </div>

          {/* Индикатор роли + кнопка выхода */}
          <div className="flex items-center gap-1.5 border-l border-gray-200 pl-2">
            <span
              className={`hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline-flex ${
                isAdmin
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
              title={isAdmin ? t('header.roleAdmin') : t('header.roleUser')}
            >
              {isAdmin ? t('header.roleAdmin') : t('header.roleUser')}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              aria-label={t('header.switchAccount')}
              title={t('header.switchAccount')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
                />
              </svg>
              <span className="sr-only">{t('header.switchAccount')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

const Header = memo(HeaderComponent)
export default Header
export { Header }
