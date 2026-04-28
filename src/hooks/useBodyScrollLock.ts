import { useEffect } from 'react';

/**
 * Глобальный счётчик активных блокировок скролла.
 * Лежит на module-level — один на всё приложение.
 */
let lockCount = 0;

/**
 * Сохранённое исходное состояние body (фиксируется при первом локе).
 * Восстанавливается только когда счётчик возвращается в 0.
 */
let originalOverflow = '';
let originalPaddingRight = '';

/**
 * Вычисляет ширину вертикального скроллбара (для компенсации сдвига layout).
 * Если скроллбар отсутствует (например, на macOS с overlay-скроллбарами) — вернёт 0.
 */
function getScrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth;
}

/**
 * Блокирует скролл `<body>` пока `locked === true`.
 *
 * Особенности:
 * - **Счётчик локов**: несколько компонентов могут блокировать скролл одновременно
 *   (например, EditProductModal + ConfirmDialog поверх него). Скролл разблокируется
 *   только когда последний компонент снимает свой лок.
 * - **Компенсация скроллбара**: при блокировке добавляется `padding-right` равный
 *   ширине исчезающего скроллбара — layout не «прыгает».
 * - **SSR-safe**: на сервере (без `window`) hook просто ничего не делает.
 *
 * @example
 * function Modal({ open }: { open: boolean }) {
 *   useBodyScrollLock(open);
 *   // ...
 * }
 */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    if (typeof document === 'undefined') return;

    // Первый лок — сохраняем исходное состояние и применяем блокировку
    if (lockCount === 0) {
      const scrollbarWidth = getScrollbarWidth();
      originalOverflow = document.body.style.overflow;
      originalPaddingRight = document.body.style.paddingRight;

      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        // Компенсируем исчезновение скроллбара, чтобы layout не сдвигался
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    lockCount += 1;

    return () => {
      lockCount -= 1;
      // Защита от ухода в минус (не должно случаться, но на всякий случай)
      if (lockCount < 0) lockCount = 0;

      // Последний unlock — восстанавливаем исходное состояние
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      }
    };
  }, [locked]);
}

export default useBodyScrollLock;
