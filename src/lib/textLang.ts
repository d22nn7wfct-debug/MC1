/**
 * Простая эвристика: содержит ли строка хотя бы один кириллический символ.
 * Используется для детекции "не переведённого" контента из mock-источника
 * данных, когда UI переключён на английский.
 *
 * Для production-сценариев следует использовать полноценную детекцию языка
 * (cld3, franc, и т.п.) — здесь хватает простой регулярки, потому что
 * других не-латинских скриптов в данных не предполагается.
 */
export function containsCyrillic(text: string): boolean {
  if (!text) return false;
  return /[\u0400-\u04FF]/.test(text);
}

/**
 * Возвращает true, если описание считается "не переведённым" для целей UI:
 * текущий язык интерфейса — английский, а текст содержит кириллицу.
 *
 * @param text — описание (или любая строка из API).
 * @param uiLang — текущий язык UI (например, 'en' / 'ru' / 'en-US').
 */
export function isUntranslatedForLang(text: string, uiLang: string): boolean {
  const lang = uiLang?.split('-')[0] ?? '';
  if (lang !== 'en') return false;
  return containsCyrillic(text);
}
