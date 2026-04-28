import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  /** Контент, который защищаем */
  children: ReactNode;
  /**
   * Кастомный fallback UI. Если не задан — показывается дефолтный.
   * Получает ошибку и колбэк сброса.
   */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /**
   * При смене значения resetKey состояние ошибки сбрасывается автоматически.
   * Удобно для сброса при смене роута/фильтров.
   */
  resetKey?: unknown;
  /** Колбэк для внешнего логирования (Sentry, DataDog и т.п.) */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Error Boundary — ловит ошибки рендера в дочерних компонентах
 * и показывает fallback UI вместо белого экрана.
 *
 * ВАЖНО: НЕ ловит ошибки в:
 *  - event handlers (там нужен try/catch)
 *  - асинхронном коде (промисы)
 *  - SSR
 *  - самом ErrorBoundary
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Автосброс ошибки при смене resetKey
    if (
      this.state.error &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.reset();
    }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // В production здесь должна быть отправка в Sentry/DataDog
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
    this.props.onError?.(error, info);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  override render(): ReactNode {
    const { error } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (fallback) {
        return fallback(error, this.reset);
      }
      return <DefaultFallback error={error} onReset={this.reset} />;
    }

    return children;
  }
}

interface DefaultFallbackProps {
  error: Error;
  onReset: () => void;
}

/**
 * Дефолтный fallback UI.
 * Намеренно НЕ использует i18n/Tailwind plugins — должен работать,
 * даже если упало где-то на старте приложения.
 */
function DefaultFallback({ error, onReset }: DefaultFallbackProps) {
  const isDev = import.meta.env.DEV;

  return (
    <div
      role="alert"
      className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-6 text-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-12 w-12 text-red-500"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>

      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-red-800">
          Что-то пошло не так
        </h2>
        <p className="text-sm text-red-700">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу.
        </p>
      </div>

      {isDev && (
        <details className="w-full max-w-md text-left">
          <summary className="cursor-pointer text-xs font-medium text-red-700 hover:text-red-900">
            Детали ошибки (только в dev)
          </summary>
          <pre className="mt-2 overflow-auto rounded bg-red-100 p-2 text-xs text-red-900">
            {error.name}: {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onReset}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Попробовать снова
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Перезагрузить страницу
        </button>
      </div>
    </div>
  );
}

export default ErrorBoundary;
