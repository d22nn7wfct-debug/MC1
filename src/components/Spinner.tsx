import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeMap: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

/**
 * Простой круговой спиннер на Tailwind.
 * Используется для индикации загрузки в списках, кнопках и модалках.
 */
function SpinnerComponent({ size = 'md', label, className = '' }: SpinnerProps) {
  const { t } = useTranslation();
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
    >
      <span
        className={`inline-block animate-spin rounded-full border-gray-300 border-t-blue-600 ${sizeMap[size]}`}
        aria-hidden="true"
      />
      {label ? (
        <span className="text-sm text-gray-600">{label}</span>
      ) : (
        <span className="sr-only">{t('common.loading')}</span>
      )}
    </div>
  );
}

export const Spinner = memo(SpinnerComponent);

export default Spinner;
