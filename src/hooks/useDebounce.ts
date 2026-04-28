import { useEffect, useState } from 'react';

/**
 * Возвращает значение, обновляющееся не чаще, чем раз в `delay` миллисекунд
 * после последнего изменения исходного значения.
 *
 * @param value входное значение
 * @param delay задержка в мс (по умолчанию 400)
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debounced;
}

export default useDebounce;
