



// Товар
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // id категории
  categoryName: string; // имя категории (для удобного отображения)
  brand: string; // id бренда
  brandName: string;
  stock: number; // количество на складе
  image: string;
  rating?: number;
  createdAt: string;
}
// Категория товара
export interface Category {
  id: string;
  name: string;        // Русское имя (legacy, fallback)
  nameEn?: string;     // Английское имя (для i18n)
}

// Бренд товара (бренды НЕ переводим — это собственные имена)
export interface Brand {
  id: string;
  name: string;
}
// Элемент корзины
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number; // ограничение по количеству
}

// Направление сортировки
export type SortOrder = 'asc' | 'desc' | 'none';

// Поле сортировки
export type SortField = 'price' | 'name' | 'none';

// Сортировка
export interface Sort {
  field: SortField;
  order: SortOrder;
}

// Фильтры каталога
export interface Filters {
  search: string;
  category: string | null; // id категории или null = все
  priceMin: number | null;
  priceMax: number | null;
  sort: Sort;
}

// Параметры запроса к API товаров
export interface ProductsQueryParams {
  page: number;
  limit: number;
  search?: string;
  category?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  /**
   * Плоские поля сортировки (используются на уровне mockApi).
   */
  sortField?: SortField;
  sortOrder?: SortOrder;
  /**
   * Объект сортировки (удобно передавать целиком из Redux-слайса фильтров).
   * Нормализуется в `sortField`/`sortOrder` внутри `productsApi`.
   */
  sort?: Sort;
}

// Ответ API со списком товаров (постраничный)
export interface ProductsApiResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Универсальный ответ API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Статус загрузки
export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

// Данные формы редактирования товара
export interface ProductFormData {
  name: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  description?: string;
  image?: string;
}

// Ошибка API
export interface ApiError {
  status: number;
  message: string;
  /**
   * Машинно-читаемый код ошибки для локализации.
   * UI мапит его в ключ перевода `errors.<code>` через `getErrorMessage`.
   * Поле опциональное — для обратной совместимости со старыми ошибками.
   */
  code?: string;
}
// Статус заказа
export type OrderStatus = 'new' | 'processing' | 'completed' | 'cancelled';

// Заказ
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  status: OrderStatus;
  createdBy: 'user' | 'admin';
}

// Параметры запроса списка заказов
export interface OrdersQueryParams {
  status?: OrderStatus | 'all';
  createdBy?: 'user' | 'admin';
}

// Полезная нагрузка для создания заказа
export interface CreateOrderPayload {
  items: CartItem[];
  createdBy: 'user' | 'admin';
}
