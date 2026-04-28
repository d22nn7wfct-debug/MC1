import { describe, it, expect, beforeEach } from 'vitest';
import cartReducer, {
  addToCart,
  removeFromCart,
  updateQuantity,
  setQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  selectCartItems,
  selectCartTotalQuantity,
  selectCartTotalPrice,
  selectIsInCart,
} from './cartSlice';

const baseItem = {
  productId: 'p-1',
  name: 'Test Product',
  price: 100,
  image: 'https://example.com/img.jpg',
  stock: 5,
};

function makeInitialState(items: ReturnType<typeof selectCartItems> = []) {
  return { items };
}

describe('cartSlice', () => {
  beforeEach(() => {
    // изолируем localStorage между тестами
    localStorage.clear();
  });

  describe('addToCart', () => {
    it('добавляет новый товар с quantity=1', () => {
      const state = makeInitialState();
      const next = cartReducer(state, addToCart(baseItem));

      expect(next.items).toHaveLength(1);
      expect(next.items[0]!).toMatchObject({ ...baseItem, quantity: 1 });
    });

    it('инкрементирует quantity, если товар уже в корзине', () => {
      const state = makeInitialState([{ ...baseItem, quantity: 2 }]);
      const next = cartReducer(state, addToCart(baseItem));

      expect(next.items).toHaveLength(1);
      expect(next.items[0]!.quantity).toBe(3);
    });

    it('не увеличивает quantity выше stock', () => {
      const state = makeInitialState([{ ...baseItem, quantity: 5 }]);
      const next = cartReducer(state, addToCart(baseItem));

      expect(next.items[0]!.quantity).toBe(5);
    });
  });

  describe('removeFromCart', () => {
    it('удаляет товар по productId', () => {
      const state = makeInitialState([
        { ...baseItem, quantity: 1 },
        { ...baseItem, productId: 'p-2', quantity: 2 },
      ]);
      const next = cartReducer(state, removeFromCart('p-1'));

      expect(next.items).toHaveLength(1);
      expect(next.items[0]!.productId).toBe('p-2');
    });

    it('не падает при удалении несуществующего товара', () => {
      const state = makeInitialState([{ ...baseItem, quantity: 1 }]);
      const next = cartReducer(state, removeFromCart('p-999'));

      expect(next.items).toHaveLength(1);
    });
  });

  describe('updateQuantity / setQuantity (alias)', () => {
    it('изменяет quantity', () => {
      const state = makeInitialState([{ ...baseItem, quantity: 1 }]);
      const next = cartReducer(
        state,
        updateQuantity({ productId: 'p-1', quantity: 3 }),
      );
      expect(next.items[0]!.quantity).toBe(3);
    });

    it('зажимает quantity снизу до 1', () => {
      const state = makeInitialState([{ ...baseItem, quantity: 3 }]);
      const next = cartReducer(
        state,
        updateQuantity({ productId: 'p-1', quantity: 0 }),
      );
      expect(next.items[0]!.quantity).toBe(1);
    });

    it('зажимает quantity сверху до stock', () => {
      const state = makeInitialState([{ ...baseItem, quantity: 1 }]);
      const next = cartReducer(
        state,
        updateQuantity({ productId: 'p-1', quantity: 999 }),
      );
      expect(next.items[0]!.quantity).toBe(baseItem.stock);
    });

    it('обрабатывает NaN как 1', () => {
      const state = makeInitialState([{ ...baseItem, quantity: 2 }]);
      const next = cartReducer(
        state,
        updateQuantity({ productId: 'p-1', quantity: Number.NaN }),
      );
      expect(next.items[0]!.quantity).toBe(1);
    });

    it('setQuantity — это алиас updateQuantity', () => {
      expect(setQuantity).toBe(updateQuantity);
    });
  });

  describe('increment/decrement', () => {
    it('increment не превышает stock', () => {
      const state = makeInitialState([{ ...baseItem, quantity: 5 }]);
      const next = cartReducer(state, incrementQuantity('p-1'));
      expect(next.items[0]!.quantity).toBe(5);
    });

    it('decrement не опускается ниже 1', () => {
      const state = makeInitialState([{ ...baseItem, quantity: 1 }]);
      const next = cartReducer(state, decrementQuantity('p-1'));
      expect(next.items[0]!.quantity).toBe(1);
    });

    it('decrement уменьшает на 1 в нормальном случае', () => {
      const state = makeInitialState([{ ...baseItem, quantity: 3 }]);
      const next = cartReducer(state, decrementQuantity('p-1'));
      expect(next.items[0]!.quantity).toBe(2);
    });
  });

  describe('clearCart', () => {
    it('очищает все позиции', () => {
      const state = makeInitialState([
        { ...baseItem, quantity: 1 },
        { ...baseItem, productId: 'p-2', quantity: 2 },
      ]);
      const next = cartReducer(state, clearCart());
      expect(next.items).toHaveLength(0);
    });
  });

  describe('селекторы', () => {
    const rootState = {
      cart: {
        items: [
          { ...baseItem, quantity: 2 }, // 100 * 2 = 200
          { ...baseItem, productId: 'p-2', price: 50, quantity: 3 }, // 50 * 3 = 150
        ],
      },
    };

    it('selectCartItems возвращает массив', () => {
      expect(selectCartItems(rootState)).toHaveLength(2);
    });

    it('selectCartTotalQuantity суммирует quantity', () => {
      expect(selectCartTotalQuantity(rootState)).toBe(5);
    });

    it('selectCartTotalPrice суммирует price * quantity', () => {
      expect(selectCartTotalPrice(rootState)).toBe(350);
    });

    it('selectIsInCart возвращает true/false', () => {
      expect(selectIsInCart('p-1')(rootState)).toBe(true);
      expect(selectIsInCart('p-999')(rootState)).toBe(false);
    });
  });
});
