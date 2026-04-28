import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LANGUAGE_FLAGS,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '../i18n';

function LanguageSwitcherComponent() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang: SupportedLanguage =
    (i18n.language?.split('-')[0] as SupportedLanguage) ?? 'ru';
  const safeCurrentLang: SupportedLanguage = SUPPORTED_LANGUAGES.includes(currentLang)
    ? currentLang
    : 'ru';

  // Закрытие при клике вне
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Закрытие по Esc
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleSelect = useCallback(
    (lang: SupportedLanguage) => {
      void i18n.changeLanguage(lang);
      setOpen(false);
    },
    [i18n],
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        aria-label={t('language.label')}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span aria-hidden="true">{LANGUAGE_FLAGS[safeCurrentLang]}</span>
        <span className="hidden sm:inline">
          {safeCurrentLang.toUpperCase()}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 text-gray-400"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 14a.75.75 0 0 1-.53-.22l-4-4a.75.75 0 1 1 1.06-1.06L10 12.19l3.47-3.47a.75.75 0 1 1 1.06 1.06l-4 4A.75.75 0 0 1 10 14Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('language.label')}
          className="absolute right-0 z-50 mt-1 min-w-[160px] overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = lang === safeCurrentLang;
            return (
              <li key={lang} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => handleSelect(lang)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition ${
                    isActive
                      ? 'bg-blue-50 font-semibold text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span aria-hidden="true">{LANGUAGE_FLAGS[lang]}</span>
                  <span>{LANGUAGE_LABELS[lang]}</span>
                  {isActive && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="ml-auto h-4 w-4 text-blue-600"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a.75.75 0 0 1 .006 1.06l-7.5 7.55a.75.75 0 0 1-1.067 0l-3.5-3.525a.75.75 0 1 1 1.067-1.054l2.967 2.988 6.967-7.013a.75.75 0 0 1 1.06-.006Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const LanguageSwitcher = memo(LanguageSwitcherComponent);
export default LanguageSwitcher;
export { LanguageSwitcher };
