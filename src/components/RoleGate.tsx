import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../store/hooks';
import { setRole } from '../store/slices/authSlice';
import LanguageSwitcher from './LanguageSwitcher';

/**
 * Экран выбора роли при входе. Никакой регистрации — только выбор:
 * «Пользователь» или «Администратор». Выбранная роль сохраняется в Redux + localStorage.
 */
function RoleGateComponent() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 p-4">
      {/* Переключатель языка в правом верхнем углу */}
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-3xl">
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {t('role.title')}
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            {t('role.subtitle')}
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Пользователь */}
          <button
            type="button"
            onClick={() => dispatch(setRole('user'))}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('header.roleUser')}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {t('role.customerDescription')}
              </p>
            </div>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:text-blue-700">
              {t('role.customer')} →
            </span>
          </button>

          {/* Администратор */}
          <button
            type="button"
            onClick={() => dispatch(setRole('admin'))}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {t('header.roleAdmin')}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {t('role.adminDescription')}
              </p>
            </div>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 group-hover:text-emerald-700">
              {t('role.admin')} →
            </span>
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          {t('role.demoNotice')}
        </p>
      </div>
    </div>
  );
}

const RoleGate = memo(RoleGateComponent);
export default RoleGate;
export { RoleGate };
