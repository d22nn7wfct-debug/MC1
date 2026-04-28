import productsData from '../mocks/products.json';
import categoriesData from '../mocks/categories.json';
import brandsData from '../mocks/brands.json';
import type {
  Product,
  Category,
  Brand,
  ProductsQueryParams,
  ProductsApiResponse,
  ProductFormData,
  Order,
  OrderStatus,
  CreateOrderPayload,
  SortField,
  SortOrder,
} from '../types';

import { STORAGE_KEYS } from '../constants/storage';

// Ключ для in-memory заказов в localStorage
const ORDERS_STORAGE_KEY = STORAGE_KEYS.ORDERS;

function loadOrdersFromStorage(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Order[];
  } catch {
    return [];
  }
}

function saveOrdersToStorage(list: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

let orders: Order[] = loadOrdersFromStorage();

function generateOrderId(): string {
  const maxIdNum = orders.reduce((max, o) => {
    const m = /^o-(\d+)$/.exec(o.id);
    if (!m) return max;
    const n = Number(m[1]);
    return n > max ? n : max;
  }, 0);
  return `o-${maxIdNum + 1}`;
}

// In-memory хранилище (копия моков, чтобы изменения сохранялись в рамках сессии)
let products: Product[] = JSON.parse(JSON.stringify(productsData));
const categories: Category[] = JSON.parse(JSON.stringify(categoriesData));
const brands: Brand[] = JSON.parse(JSON.stringify(brandsData));

// Имитация сетевой задержки
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Имитация случайных ошибок (выключено по умолчанию, можно включить для теста)
const FAIL_RATE = 0;
const maybeFail = () => {
  if (FAIL_RATE > 0 && Math.random() < FAIL_RATE) {
    throw { status: 500, code: 'SERVER_ERROR', message: 'Сервер недоступен' };
  }
};

/**
 * GET /products — получение списка товаров с пагинацией, фильтрами и сортировкой
 */
export async function fetchProducts(
  params: ProductsQueryParams
): Promise<ProductsApiResponse> {
  await delay();
  maybeFail();

  const {
    page = 1,
    limit = 12,
    search = '',
    category = null,
    priceMin = null,
    priceMax = null,
    sort,
    sortField: sortFieldRaw,
    sortOrder: sortOrderRaw,
  } = params;

  // Приоритет у объекта `sort` (из Redux-слайса фильтров),
  // плоские `sortField`/`sortOrder` — fallback для прямых вызовов.
  const sortField: SortField = sort?.field ?? sortFieldRaw ?? 'none';
  const sortOrder: SortOrder = sort?.order ?? sortOrderRaw ?? 'none';

  let result = [...products];

  // Поиск по названию
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(q));
  }

  // Фильтр по категории
  if (category) {
    result = result.filter((p) => p.category === category);
  }

  // Фильтр по цене
  if (priceMin !== null && priceMin !== undefined) {
    result = result.filter((p) => p.price >= priceMin);
  }
  if (priceMax !== null && priceMax !== undefined) {
    result = result.filter((p) => p.price <= priceMax);
  }

  // Сортировка
  if (sortField !== 'none' && sortOrder !== 'none') {
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'price') {
        cmp = a.price - b.price;
      } else if (sortField === 'name') {
        cmp = a.name.localeCompare(b.name);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }

  const total = result.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const items = result.slice(start, end);
  const hasMore = end < total;

  return { items, total, page, limit, hasMore };
}

/**
 * GET /categories — список категорий
 */
export async function fetchCategories(): Promise<Category[]> {
  await delay(150);
  maybeFail();
  return [...categories];
}

/**
 * GET /brands — список брендов
 */
export async function fetchBrands(): Promise<Brand[]> {
  await delay(150);
  maybeFail();
  return [...brands];
}

/**
 * GET /products/:id — получение одного товара
 */
export async function fetchProductById(id: string): Promise<Product> {
  await delay(200);
  maybeFail();
  const product = products.find((p) => p.id === id);
  if (!product) {
    throw { status: 404, code: 'PRODUCT_NOT_FOUND', message: 'Товар не найден' };
  }
  return { ...product };
}

/**
 * PUT /products/:id — обновление товара
 */
export async function updateProduct(
  id: string,
  data: ProductFormData
): Promise<Product> {
  await delay(400);
  maybeFail();

  const index = products.findIndex((p) => p.id === id);
  const existing = index === -1 ? undefined : products[index];
  if (!existing) {
    throw { status: 404, code: 'PRODUCT_NOT_FOUND', message: 'Товар не найден' };
  }

  // Валидация
  if (!data.name?.trim()) {
    throw { status: 400, code: 'NAME_REQUIRED', message: 'Название обязательно' };
  }
  if (data.price <= 0) {
    throw { status: 400, code: 'PRICE_POSITIVE', message: 'Цена должна быть положительной' };
  }
  if (data.stock < 0) {
    throw { status: 400, code: 'STOCK_NON_NEGATIVE', message: 'Количество не может быть отрицательным' };
  }

  const updated: Product = {
    ...existing,
    name: data.name.trim(),
    price: data.price,
    category: data.category,
    brand: data.brand,
    stock: data.stock,
  };

  products[index] = updated;
  return { ...updated };
}

/**
 * DELETE /products/:id — удаление товара
 */
export async function deleteProduct(id: string): Promise<{ id: string }> {
  await delay(300);
  maybeFail();

  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    throw { status: 404, code: 'PRODUCT_NOT_FOUND', message: 'Товар не найден' };
  }

  products.splice(index, 1);
  return { id };
}
/**
 * POST /products — создание нового товара
 */
export async function createProduct(
  data: ProductFormData
): Promise<Product> {
  await delay(400);
  maybeFail();

  // Валидация
  if (!data.name?.trim()) {
    throw { status: 400, code: 'NAME_REQUIRED', message: 'Название обязательно' };
  }
  if (data.price <= 0) {
    throw { status: 400, code: 'PRICE_POSITIVE', message: 'Цена должна быть положительной' };
  }
  if (data.stock < 0) {
    throw { status: 400, code: 'STOCK_NON_NEGATIVE', message: 'Количество не может быть отрицательным' };
  }
  if (!data.category) {
    throw { status: 400, code: 'CATEGORY_REQUIRED', message: 'Выберите категорию' };
  }
  if (!data.brand) {
    throw { status: 400, code: 'BRAND_REQUIRED', message: 'Выберите бренд' };
  }

  // Генерация id: max существующий + 1
  const maxIdNum = products.reduce((max, p) => {
    const m = /^p-(\d+)$/.exec(p.id);
    if (!m) return max;
    const n = Number(m[1]);
    return n > max ? n : max;
  }, 0);
  const id = `p-${maxIdNum + 1}`;

  const categoryName =
    categories.find((c) => c.id === data.category)?.name ?? '';
  const brandName = brands.find((b) => b.id === data.brand)?.name ?? '';

  const newProduct: Product = {
    id,
    name: data.name.trim(),
    description: data.description?.trim() ?? '',
    price: data.price,
    category: data.category,
    categoryName,
    brand: data.brand,
    brandName,
    stock: data.stock,
    image: data.image?.trim() || '',
    rating: 0,
    createdAt: new Date().toISOString(),
  };

  products.unshift(newProduct);
  return { ...newProduct };
}
/**
 * GET /orders — список заказов (опционально с фильтром по статусу)
 */
export async function fetchOrders(
  params: { status?: OrderStatus | 'all'; createdBy?: 'user' | 'admin' } = {}
): Promise<Order[]> {
  await delay(250);
  maybeFail();
  const { status = 'all', createdBy } = params;
  let result = [...orders];
  if (status !== 'all') {
    result = result.filter((o) => o.status === status);
  }
  if (createdBy) {
    result = result.filter((o) => o.createdBy === createdBy);
  }
  // По убыванию даты создания
  result.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return result;
}

/**
 * POST /orders — создание нового заказа из позиций корзины
 */
export async function createOrder(
  payload: CreateOrderPayload
): Promise<Order> {
  await delay(400);
  maybeFail();

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    throw { status: 400, code: 'CART_EMPTY', message: 'Корзина пуста' };
  }

  const total = payload.items.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );

  const newOrder: Order = {
    id: generateOrderId(),
    items: payload.items.map((it) => ({ ...it })),
    total,
    createdAt: new Date().toISOString(),
    status: 'new',
    createdBy: payload.createdBy,
  };

  orders.unshift(newOrder);
  saveOrdersToStorage(orders);
  return { ...newOrder };
}

/**
 * PATCH /orders/:id/status — смена статуса заказа
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order> {
  await delay(250);
  maybeFail();
  const idx = orders.findIndex((o) => o.id === id);
  const existingOrder = idx === -1 ? undefined : orders[idx];
  if (!existingOrder) {
    throw { status: 404, code: 'ORDER_NOT_FOUND', message: 'Заказ не найден' };
  }
  const updated: Order = { ...existingOrder, status };
  orders[idx] = updated;
  saveOrdersToStorage(orders);
  return { ...updated };
}

/**
 * DELETE /orders/:id — удаление заказа
 */
export async function deleteOrder(id: string): Promise<{ id: string }> {
  await delay(250);
  maybeFail();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) {
    throw { status: 404, code: 'ORDER_NOT_FOUND', message: 'Заказ не найден' };
  }
  orders.splice(idx, 1);
  saveOrdersToStorage(orders);
  return { id };
}
/**
 * Сброс данных к исходным мокам (полезно для тестов).
 *
 * Сбрасывает:
 * - products → исходные моки
 * - orders → пустой массив (in-memory)
 * - localStorage[ORDERS_STORAGE_KEY] → удаляется
 */
export function resetMockData(): void {
  products = JSON.parse(JSON.stringify(productsData));
  orders = [];
  try {
    localStorage.removeItem(ORDERS_STORAGE_KEY);
  } catch {
    // ignore
  }
}
