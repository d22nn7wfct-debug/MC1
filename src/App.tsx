import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import Filters from './components/Filters';
import { ProductList } from './components/ProductList';
import CartModal from './components/CartModal';
import EditProductModal from './components/EditProductModal';
import OrdersModal from './components/OrdersModal';
import ConfirmDialog from './components/ConfirmDialog';
import Spinner from './components/Spinner';
import RoleGate from './components/RoleGate';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';
import {
  logout,
  selectIsAdmin,
  selectIsAuthenticated,
} from './store/slices/authSlice';
import {
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useDeleteProductMutation,
} from './store/api/productsApi';
import type { Product } from './types';

/**
 * Главный компонент приложения.
 *
 * Связывает Header, Filters, ProductList и модалки (корзина, редактирование,
 * подтверждение удаления). Загружает справочники категорий и брендов один раз
 * на верхнем уровне и прокидывает в дочерние компоненты.
 */
function App() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Если роль не выбрана — показываем экран выбора роли,
  // не загружая каталог и не инициализируя остальное состояние.
  if (!isAuthenticated) {
    return <RoleGate />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isAdmin = useAppSelector(selectIsAdmin);

  // Состояние модалок
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const handleLogout = useCallback(() => {
    // Закрываем все модалки и сбрасываем роль → попадаем на RoleGate
    setIsCartOpen(false);
    setIsFiltersOpen(false);
    setIsCreateOpen(false);
    setIsOrdersOpen(false);
    setIsMyOrdersOpen(false);
    setEditingProduct(null);
    setDeletingProduct(null);
    dispatch(logout());
  }, [dispatch]);

  const handleOpenCreate = useCallback(() => {
    if (!isAdmin) return;
    setIsCreateOpen(true);
  }, [isAdmin]);

  const handleCloseCreate = useCallback(() => setIsCreateOpen(false), []);
  const handleOpenOrders = useCallback(() => {
    if (!isAdmin) return;
    setIsOrdersOpen(true);
  }, [isAdmin]);

  const handleCloseOrders = useCallback(() => setIsOrdersOpen(false), []);
  const handleOpenMyOrders = useCallback(() => {
    if (isAdmin) return;
    setIsMyOrdersOpen(true);
  }, [isAdmin]);

  const handleCloseMyOrders = useCallback(() => setIsMyOrdersOpen(false), []);
  // Справочники
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useGetCategoriesQuery();

  const {
    data: brands,
    isLoading: isBrandsLoading,
    isError: isBrandsError,
    refetch: refetchBrands,
  } = useGetBrandsQuery();

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleOpenCart = useCallback(() => setIsCartOpen(true), []);
  const handleCloseCart = useCallback(() => setIsCartOpen(false), []);
  const handleOpenFilters = useCallback(() => setIsFiltersOpen(true), []);
  const handleCloseFilters = useCallback(() => setIsFiltersOpen(false), []);

  // Блокировка скролла body для drawer фильтров (через глобальный hook со счётчиком)
  useBodyScrollLock(isFiltersOpen);

  // Закрытие drawer фильтров по ESC
  useEffect(() => {
    if (!isFiltersOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFiltersOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [isFiltersOpen]);
  const handleEdit = useCallback(
    (product: Product) => {
      if (!isAdmin) return;
      setEditingProduct(product);
    },
    [isAdmin],
  );

  const handleCloseEdit = useCallback(() => {
    setEditingProduct(null);
  }, []);

  const handleAskDelete = useCallback(
    (product: Product) => {
      if (!isAdmin) return;
      setDeletingProduct(product);
      setDeleteError(null);
    },
    [isAdmin],
  );

  const handleCancelDelete = useCallback(() => {
    if (isDeleting) return;
    setDeletingProduct(null);
    setDeleteError(null);
  }, [isDeleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingProduct) return;
    try {
      await deleteProduct(deletingProduct.id).unwrap();
      setDeletingProduct(null);
      setDeleteError(null);
    } catch (e) {
      const message =
        (e as { message?: string } | undefined)?.message ??
        'Не удалось удалить товар. Попробуйте ещё раз.';
      setDeleteError(message);
    }
  }, [deletingProduct, deleteProduct]);

  // Первичная загрузка справочников
  const isDictionariesLoading = isCategoriesLoading || isBrandsLoading;
  const isDictionariesError = isCategoriesError || isBrandsError;

  if (isDictionariesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" label={t('catalog.loadingDictionaries')} />
      </div>
    );
  }

  if (isDictionariesError || !categories || !brands) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="flex max-w-md flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-lg font-semibold text-red-700">
            {t('catalog.loadFailedDictionaries')}
          </h1>
          <p className="text-sm text-red-600">
            {t('catalog.loadFailedDictionariesHint')}
          </p>
          <button
            type="button"
            onClick={() => {
              refetchCategories();
              refetchBrands();
            }}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        onOpenCart={handleOpenCart}
        onOpenFilters={handleOpenFilters}
        onOpenCreate={handleOpenCreate}
        onOpenOrders={handleOpenOrders}
        onOpenMyOrders={handleOpenMyOrders}
        onLogout={handleLogout}
        isAdmin={isAdmin}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">
          {t('catalog.title')}
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr]">
          {/* Сайдбар с фильтрами — только на десктопе (lg+) */}
          <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <Filters />
          </aside>

          {/* Контент: список товаров */}
          <section className="min-w-0">
            <ProductList
              categories={categories}
              brands={brands}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleAskDelete}
            />
          </section>
        </div>

        {/* Drawer фильтров — только на мобильных (< lg) */}
        <div
          className={`fixed inset-0 z-40 lg:hidden ${
            isFiltersOpen ? '' : 'pointer-events-none'
          }`}
          aria-hidden={!isFiltersOpen}
        >
          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
              isFiltersOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleCloseFilters}
          />
          {/* Панель */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={t('filters.title')}
            className={`absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col overflow-y-auto bg-slate-50 shadow-xl transition-transform duration-200 ease-out ${
              isFiltersOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-4">
              <Filters onClose={handleCloseFilters} />
            </div>
          </aside>
        </div>
      </main>

      <footer className="mx-auto max-w-7xl px-4 py-6 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} {t('common.appName')}. {t('common.appTagline')}.
      </footer>

      {/* Корзина */}
      <CartModal open={isCartOpen} onClose={handleCloseCart} />
      {/* Заказы (admin) */}
      {isAdmin && (
        <OrdersModal open={isOrdersOpen} onClose={handleCloseOrders} />
      )}
      {/* Мои заказы (user) */}
      {!isAdmin && (
        <OrdersModal
          open={isMyOrdersOpen}
          onClose={handleCloseMyOrders}
          mode="user"
        />
      )}
      {/* Создание товара (admin) */}
      {isAdmin && (
        <EditProductModal
          open={isCreateOpen}
          product={null}
          categories={categories}
          brands={brands}
          mode="create"
          onClose={handleCloseCreate}
        />
      )}

      {/* Редактирование товара */}
      <EditProductModal
        open={Boolean(editingProduct)}
        product={editingProduct}
        categories={categories}
        brands={brands}
        mode="edit"
        onClose={handleCloseEdit}
      />

      {/* Подтверждение удаления товара из каталога */}
      <ConfirmDialog
        open={Boolean(deletingProduct)}
        title={t('productForm.deleteConfirmTitle')}
        message={
          deletingProduct
            ? `${t('productForm.deleteConfirmMessage', { name: deletingProduct.name })}${
                deleteError ? `\n\n${deleteError}` : ''
              }`
            : ''
        }
        confirmLabel={isDeleting ? t('common.loading') : t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default App;
