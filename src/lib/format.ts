import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { getIntlLocale } from '../i18n';

/**
 * Хук для форматирования цены в RUB с учётом текущей локали.
 * - ru: «12 500 ₽»
 * - en: «RUB 12,500»
 */
export function usePriceFormatter(): (value: number) => string {
  const { i18n } = useTranslation();

  return useMemo(() => {
    const locale = i18n.language?.startsWith('en') ? 'en-US' : 'ru-RU';
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    });
    return (value: number) => formatter.format(value);
    // i18n.language важен — пересоздаём форматер при смене языка
  }, [i18n.language]);
}

/**
 * Хук для форматирования даты-времени по локали.
 * - ru: «15.03.2024, 14:30»
 * - en: «Mar 15, 2024, 2:30 PM»
 */
export function useDateFormatter(): (iso: string) => string {
  const { i18n } = useTranslation();

  return useMemo(() => {
    const locale = i18n.language?.startsWith('en') ? 'en-US' : 'ru-RU';
    const formatter = new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return (iso: string) => formatter.format(new Date(iso));
  }, [i18n.language]);
}

/**
 * Императивные версии (без хуков) — для использования в обычных функциях.
 */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat(getIntlLocale(), {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(getIntlLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}
