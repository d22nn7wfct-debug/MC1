import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../store/slices/cartSlice';
import { ProductCard } from './ProductCard';
import type { Product, Category, Brand } from '../types';

// Мокаем react-i18next: t возвращает ключ, language='ru' (чтобы не сработал баннер isUntranslatedForLang).
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts && 'count' in opts ? `${key}:${opts['count']}` : key,
    i18n: { language: 'ru' },
  }),
}));

const product: Product = {
  id: 'p-1',
  name: 'iPhone 15',
  description: 'Описание товара',
  price: 99990,
  category: 'cat-1',
  categoryName: 'Смартфоны',
  brand: 'br-1',
  brandName: 'Apple',
  stock: 5,
  image: 'https://example.com/iphone.jpg',
  rating: 4.5,
  createdAt: '2024-01-01T00:00:00.000Z',
};

const categories: Category[] = [{ id: 'cat-1', name: 'Смартфоны' }];
const brands: Brand[] = [{ id: 'br-1', name: 'Apple' }];

function makeStore() {
  return configureStore({
    reducer: { cart: cartReducer },
  });
}

function renderCard(
  overrides: Partial<React.ComponentProps<typeof ProductCard>> = {},
) {
  const store = makeStore();
  const utils = render(
    <Provider store={store}>
      <ProductCard
        product={product}
        categories={categories}
        brands={brands}
        {...overrides}
      />
    </Provider>,
  );
  return { ...utils, store };
}

describe('ProductCard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('рендерит название, категорию и бренд', () => {
    renderCard();
    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    expect(screen.getByText('Смартфоны')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('показывает картинку с правильным src и alt', () => {
    renderCard();
    const img = screen.getByRole('img', { name: 'iPhone 15' }) as HTMLImageElement;
    expect(img.src).toBe(product.image);
  });

  it('по клику "В корзину" диспатчит addToCart', async () => {
    const user = userEvent.setup();
    const { store } = renderCard();

    const button = screen.getByRole('button', { name: /product\.addToCart$/ });
    await user.click(button);

    const items = store.getState().cart.items;
    expect(items).toHaveLength(1);
    expect(items[0]!).toMatchObject({
      productId: 'p-1',
      name: 'iPhone 15',
      price: 99990,
      quantity: 1,
    });
  });

  it('после добавления показывает состояние "в корзине"', async () => {
    const user = userEvent.setup();
    renderCard();
    const button = screen.getByRole('button', { name: /product\.addToCart$/ });
    await user.click(button);

    expect(
      screen.getByRole('button', { name: 'product.inCart' }),
    ).toBeInTheDocument();
  });

  it('при stock=0 показывает бейдж и блокирует кнопку', () => {
    renderCard({ product: { ...product, stock: 0 } });

    expect(screen.getByText('product.outOfStock')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: 'product.unavailable' });
    expect(button).toBeDisabled();
  });

  it('в режиме admin показывает кнопки Edit и Delete', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    renderCard({ isAdmin: true, onEdit, onDelete });

    const editBtn = screen.getByRole('button', { name: 'common.edit' });
    const deleteBtn = screen.getByRole('button', { name: 'common.delete' });

    await user.click(editBtn);
    await user.click(deleteBtn);

    expect(onEdit).toHaveBeenCalledWith(product);
    expect(onDelete).toHaveBeenCalledWith(product);
  });

  it('в обычном режиме не показывает кнопки Edit/Delete', () => {
    renderCard({ isAdmin: false });
    expect(
      screen.queryByRole('button', { name: 'common.edit' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'common.delete' }),
    ).not.toBeInTheDocument();
  });
});
