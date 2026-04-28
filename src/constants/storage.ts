/**
 * Ключи для localStorage.
 *
 * Все ключи живут с префиксом `catalog:` — это защищает от коллизий
 * с другими приложениями на том же origin (например, при деплое нескольких
 * SPA на один домен через path-based routing).
 *
 * Важно: при изменении ключа существующие пользователи потеряют сохранённое
 * состояние. Если нужна миграция — используйте версионирование (`catalog:cart:v2`).
 */
export const STORAGE_KEYS = {
  /** Корзина пользователя (CartState) */
  CART: 'catalog:cart',
  /** Активные фильтры каталога (Filters) */
  FILTERS: 'catalog:filters',
  /** Текущая роль (AuthState) */
  AUTH: 'catalog:auth',
  /** Список заказов (in-memory mock backend) */
  ORDERS: 'catalog:orders',
  /** Выбранный язык интерфейса (i18next detector) */
  LANGUAGE: 'catalog:lang',
} as const;

/** Тип-объединение всех значений `STORAGE_KEYS` */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
