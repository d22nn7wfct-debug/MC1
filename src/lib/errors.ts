import type { TFunction } from 'i18next';
import type { ApiError } from '../types';

/**
 * Карта соответствия кодов ошибок API ключам i18n.
 * Расширять синхронно с кодами в `src/api/mockApi.ts` и `src/store/api/*`.
 */
const ERROR_CODE_TO_I18N_KEY: Record<string, string> = {
  SERVER_ERROR: 'errors.serverError',
  PRODUCT_NOT_FOUND: 'errors.productNotFound',
  ORDER_NOT_FOUND: 'errors.orderNotFound',
  CART_EMPTY: 'errors.cartEmpty',
  NAME_REQUIRED: 'errors.nameRequired',
  PRICE_POSITIVE: 'errors.pricePositive',
  STOCK_NON_NEGATIVE: 'errors.stockNonNegative',
  CATEGORY_REQUIRED: 'errors.categoryRequired',
  BRAND_REQUIRED: 'errors.brandRequired',
  FORBIDDEN_ADMIN_ONLY: 'errors.onlyAdminCanManage',
  FORBIDDEN_USER_ONLY: 'errors.onlyUserCanOrder',
};

/**
 * Аккуратно извлекаем `ApiError` из произвольного значения, которое
 * может прилететь из RTK Query / fetch / try-catch.
 */
function asApiError(error: unknown): Partial<ApiError> | null {
  if (typeof error !== 'object' || error === null) return null;
  return error as Partial<ApiError>;
}

/**
 * Возвращает локализованное сообщение об ошибке.
 *
 * Приоритет:
 *  1. Перевод по `error.code` (если код есть в карте и в словаре)
 *  2. `error.message` (текст с бэкенда — для mock-API он на русском, ок)
 *  3. Перевод по `fallbackKey` (по умолчанию `errors.generic`)
 *
 * @example
 * try { await mutation().unwrap() }
 * catch (e) { setError(getErrorMessage(e, t, 'cart.orderFailed')) }
 */
export function getErrorMessage(
  error: unknown,
  t: TFunction,
  fallbackKey: string = 'errors.generic',
): string {
  const apiError = asApiError(error);

  if (apiError?.code) {
    const i18nKey = ERROR_CODE_TO_I18N_KEY[apiError.code];
    if (i18nKey) {
      return t(i18nKey);
    }
  }

  if (apiError?.message && typeof apiError.message === 'string') {
    return apiError.message;
  }

  return t(fallbackKey);
}
