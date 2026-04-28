import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  /** Стиль кнопки подтверждения (danger — красная) */
  variant?: 'default' | 'danger'
  /** Идёт ли асинхронная операция — блокирует кнопки */
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Простой диалог подтверждения действия.
 * Используется для подтверждения удаления товара/очистки корзины и т.п.
 *
 * Дефолтные значения title/confirmLabel/cancelLabel НЕ задаются в сигнатуре пропсов,
 * иначе они "замораживаются" на момент вызова и не реагируют на смену языка.
 * Вместо этого подставляем перевод через `??` внутри тела компонента.
 */
function ConfirmDialogComponent({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  const resolvedTitle = title ?? t('confirm.defaultTitle')
  const resolvedConfirmLabel = confirmLabel ?? t('confirm.defaultConfirm')
  const resolvedCancelLabel = cancelLabel ?? t('confirm.defaultCancel')
  // Закрытие по Esc
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, loading, onCancel])

  const handleOverlayClick = useCallback(() => {
    if (!loading) onCancel()
  }, [loading, onCancel])

  if (!open) return null

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2
            id="confirm-dialog-title"
            className="text-base font-semibold text-gray-900"
          >
            {resolvedTitle}
          </h2>
        </div>
        <div className="px-5 py-4 text-sm text-gray-700">{message}</div>
        <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 disabled:opacity-60"
          >
            {resolvedCancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 ${confirmBtnClass}`}
          >
            {loading ? t('common.loading') : resolvedConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

const ConfirmDialog = ConfirmDialogComponent
export default ConfirmDialog
