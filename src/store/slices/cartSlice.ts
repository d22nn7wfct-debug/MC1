import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../../types';
import { STORAGE_KEYS } from '../../constants/storage';

const STORAGE_KEY = STORAGE_KEYS.CART;

interface CartState {
  items: CartItem[];
}

// Загрузка корзины из localStorage
function loadFromStorage(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as { items?: unknown };
    if (!Array.isArray(parsed.items)) return { items: [] };
    // Базовая валидация
    const items = parsed.items.filter(
      (it): it is CartItem =>
        typeof it === 'object' &&
        it !== null &&
        typeof (it as CartItem).productId === 'string' &&
        typeof (it as CartItem).quantity === 'number'
    );
    return { items };
  } catch {
    return { items: [] };
  }
}

// Сохранение в localStorage
function saveToStorage(state: CartState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Игнорируем
  }
}

const initialState: CartState = loadFromStorage();

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Добавление товара в корзину.
     * Если товар уже есть — увеличиваем quantity (но не больше stock).
     */
    addToCart(state, action: PayloadAction<Omit<CartItem, 'quantity'>>) {
      const payload = action.payload;
      const existing = state.items.find((i) => i.productId === payload.productId);

      if (existing) {
        if (existing.quantity < existing.stock) {
          existing.quantity += 1;
        }
      } else {
        state.items.push({
          productId: payload.productId,
          name: payload.name,
          price: payload.price,
          image: payload.image,
          stock: payload.stock,
          quantity: 1,
        });
      }
      saveToStorage(state);
    },

    /**
     * Удаление товара из корзины
     */
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      saveToStorage(state);
    },

    /**
     * Изменение количества с валидацией: 1 <= quantity <= stock
     */
    updateQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.productId === productId);
      if (!item) return;

      // Валидация
      let next = Math.floor(quantity);
      if (Number.isNaN(next) || next < 1) next = 1;
      if (next > item.stock) next = item.stock;

      item.quantity = next;
      saveToStorage(state);
    },

    /**
     * Увеличить количество на 1 (не больше stock)
     */
    incrementQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.productId === action.payload);
      if (!item) return;
      if (item.quantity < item.stock) {
        item.quantity += 1;
        saveToStorage(state);
      }
    },

    /**
     * Уменьшить количество на 1 (не меньше 1)
     */
    decrementQuantity(state, action: PayloadAction<string>) {
      const item = state.items.find((i) => i.productId === action.payload);
      if (!item) return;
      if (item.quantity > 1) {
        item.quantity -= 1;
        saveToStorage(state);
      }
    },

    /**
     * Полная очистка корзины
     */
    clearCart(state) {
      state.items = [];
      saveToStorage(state);
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
} = cartSlice.actions;

// Алиас для совместимости с CartModal
export const setQuantity = updateQuantity;

// Селекторы
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;

export const selectCartTotalQuantity = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartTotalPrice = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);

export const selectIsInCart =
  (productId: string) => (state: { cart: CartState }) =>
    state.cart.items.some((i) => i.productId === productId);

export default cartSlice.reducer;
