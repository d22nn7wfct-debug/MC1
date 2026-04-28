import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
} from '../store/api/productsApi';
import type { Brand, Category, Product, ProductFormData } from '../types';
import { getErrorMessage } from '../lib/errors';

import ConfirmDialog from './ConfirmDialog';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import {
  createProductFormSchema,
  type ProductFormValues,
} from './EditProductModal.schema';

// === HELPERS ===

/**
 * Дефолтные значения формы для режима создания товара.
 */
const emptyValues: ProductFormValues = {
  name: '',
  price: 0,
  category: '',
  brand: '',
  stock: 0,
};

/**
 * Маппинг Product → значения формы (для режима редактирования).
 */
function productToValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    price: product.price,
    category: product.category,
    brand: product.brand,
    stock: product.stock,
  };
}

// === COMPONENT TYPES ===

export interface EditProductModalProps {
  open: boolean;
  /** В режиме 'edit' обязателен; в режиме 'create' — null */
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  /** Режим работы модалки. По умолчанию 'edit'. */
  mode?: 'edit' | 'create';
  onClose: () => void;
}

// === COMPONENT ===

/**
 * Модалка редактирования/создания карточки товара.
 *
 * Использует React Hook Form + Zod:
 * - Схема валидации в `EditProductModal.schema.ts` (источник истины для типов).
 * - Первая валидация на submit, далее onChange (классическое UX-поведение RHF).
 * - При смене режима/товара форма ресетится через `reset()`.
 *
 * Side effects:
 * - Esc закрывает модалку (если не идёт сетевой запрос и не открыт ConfirmDialog).
 * - Body scroll блокируется на время открытия.
 */
function EditProductModalComponent({
  open,
  product,
  categories,
  brands,
  mode = 'edit',
  onClose,
}: EditProductModalProps) {
  const { t } = useTranslation();
  const isCreateMode = mode === 'create';

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [updateProduct, { isLoading: isSaving }] = useUpdateProductMutation();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // Схема пересоздаётся при смене языка — сообщения об ошибках локализуются.
  const schema = useMemo(() => createProductFormSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  // Сброс/инициализация формы при открытии модалки или смене режима/товара.
  useEffect(() => {
    if (!open) return;
    if (isCreateMode) {
      reset(emptyValues);
    } else if (product) {
      reset(productToValues(product));
    }
    setSubmitError(null);
  }, [open, product, isCreateMode, reset]);

  // Закрытие по Esc — блокируется во время сетевых операций и при открытом ConfirmDialog.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === 'Escape' &&
        !isSaving &&
        !isCreating &&
        !isDeleting &&
        !confirmDeleteOpen
      ) {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose, isSaving, isCreating, isDeleting, confirmDeleteOpen]);

  // Блокируем скролл body на время открытия модалки (через глобальный хук со счётчиком).
  useBodyScrollLock(open);

  /**
   * Обработчик submit — вызывается RHF только если валидация прошла.
   */
  const onSubmit = useCallback(
    async (values: ProductFormValues) => {
      if (!isCreateMode && !product) return;
      setSubmitError(null);

      const payload: ProductFormData = {
        name: values.name.trim(),
        price: values.price,
        category: values.category,
        brand: values.brand,
        stock: values.stock,
      };

      try {
        if (isCreateMode) {
          await createProduct(payload).unwrap();
        } else if (product) {
          await updateProduct({ id: product.id, data: payload }).unwrap();
        }
        onClose();
      } catch (err) {
        setSubmitError(
          getErrorMessage(err, t, 'productForm.errors.submitFailed'),
        );
      }
    },
    [product, updateProduct, createProduct, isCreateMode, onClose, t],
  );

  const handleDelete = useCallback(async () => {
    if (!product) return;
    try {
      await deleteProduct(product.id).unwrap();
      setConfirmDeleteOpen(false);
      onClose();
    } catch (err) {
      setSubmitError(
        getErrorMessage(err, t, 'productForm.errors.deleteFailed'),
      );
      setConfirmDeleteOpen(false);
    }
  }, [product, deleteProduct, onClose, t]);

  if (!open) return null;
  if (!isCreateMode && !product) return null;

  // === STYLES ===
  const inputBase =
    'w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:opacity-60';
  const inputOk = 'border-gray-300';
  const inputErr = 'border-red-400';

  const isBusy = isSaving || isCreating || isDeleting || isSubmitting;
  // В режиме редактирования блокируем сабмит, если форма не была изменена.
  const isSubmitDisabled = isBusy || (!isCreateMode && !isDirty);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-product-title"
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => !isBusy && onClose()}
          aria-hidden="true"
        />
        <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
            <h2
              id="edit-product-title"
              className="text-lg font-semibold text-gray-900"
            >
              {isCreateMode
                ? t('productForm.titleCreate')
                : t('productForm.titleEdit')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              aria-label={t('common.close')}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-y-auto"
            noValidate
          >
            <div className="space-y-4 px-5 py-4">
              {/* Название */}
              <div>
                <label
                  htmlFor="ep-name"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {t('productForm.nameLabel')}
                </label>
                <input
                  id="ep-name"
                  type="text"
                  autoComplete="off"
                  {...register('name')}
                  className={`${inputBase} ${errors.name ? inputErr : inputOk}`}
                  disabled={isBusy}
                  placeholder={t('productForm.namePlaceholder')}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'ep-name-error' : undefined}
                />
                {errors.name && (
                  <p
                    id="ep-name-error"
                    className="mt-1 text-xs text-red-600"
                    role="alert"
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Цена и количество */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="ep-price"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {t('productForm.priceLabel')}
                  </label>
                  <input
                    id="ep-price"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    {...register('price', { valueAsNumber: true })}
                    className={`${inputBase} ${errors.price ? inputErr : inputOk}`}
                    disabled={isBusy}
                    placeholder={t('productForm.pricePlaceholder')}
                    aria-invalid={Boolean(errors.price)}
                    aria-describedby={
                      errors.price ? 'ep-price-error' : undefined
                    }
                  />
                  {errors.price && (
                    <p
                      id="ep-price-error"
                      className="mt-1 text-xs text-red-600"
                      role="alert"
                    >
                      {errors.price.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="ep-stock"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {t('productForm.stockLabel')}
                  </label>
                  <input
                    id="ep-stock"
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step="1"
                    {...register('stock', { valueAsNumber: true })}
                    className={`${inputBase} ${errors.stock ? inputErr : inputOk}`}
                    disabled={isBusy}
                    placeholder={t('productForm.stockPlaceholder')}
                    aria-invalid={Boolean(errors.stock)}
                    aria-describedby={
                      errors.stock ? 'ep-stock-error' : undefined
                    }
                  />
                  {errors.stock && (
                    <p
                      id="ep-stock-error"
                      className="mt-1 text-xs text-red-600"
                      role="alert"
                    >
                      {errors.stock.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Категория */}
              <div>
                <label
                  htmlFor="ep-category"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {t('productForm.categoryLabel')}
                </label>
                <select
                  id="ep-category"
                  {...register('category')}
                  className={`${inputBase} ${errors.category ? inputErr : inputOk}`}
                  disabled={isBusy}
                  aria-invalid={Boolean(errors.category)}
                  aria-describedby={
                    errors.category ? 'ep-category-error' : undefined
                  }
                >
                  <option value="">
                    {t('productForm.categoryPlaceholder')}
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p
                    id="ep-category-error"
                    className="mt-1 text-xs text-red-600"
                    role="alert"
                  >
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Бренд */}
              <div>
                <label
                  htmlFor="ep-brand"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  {t('productForm.brandLabel')}
                </label>
                <select
                  id="ep-brand"
                  {...register('brand')}
                  className={`${inputBase} ${errors.brand ? inputErr : inputOk}`}
                  disabled={isBusy}
                  aria-invalid={Boolean(errors.brand)}
                  aria-describedby={
                    errors.brand ? 'ep-brand-error' : undefined
                  }
                >
                  <option value="">
                    {t('productForm.brandPlaceholder')}
                  </option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {errors.brand && (
                  <p
                    id="ep-brand-error"
                    className="mt-1 text-xs text-red-600"
                    role="alert"
                  >
                    {errors.brand.message}
                  </p>
                )}
              </div>

              {/* Общая ошибка submit */}
              {submitError && (
                <div
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  role="alert"
                >
                  {submitError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3">
              {!isCreateMode ? (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={isBusy}
                  className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60"
                >
                  {t('productForm.deleteButton')}
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isBusy}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-60"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreateMode
                    ? isCreating || isSubmitting
                      ? t('productForm.submittingCreate')
                      : t('productForm.submitCreate')
                    : isSaving || isSubmitting
                      ? t('productForm.submittingEdit')
                      : t('productForm.submitEdit')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Подтверждение удаления */}
      {!isCreateMode && product && (
        <ConfirmDialog
          open={confirmDeleteOpen}
          title={t('productForm.deleteConfirmTitle')}
          message={t('productForm.deleteConfirmMessage', { name: product.name })}
          confirmLabel={t('common.delete')}
          cancelLabel={t('common.cancel')}
          variant="danger"
          loading={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => !isDeleting && setConfirmDeleteOpen(false)}
        />
      )}
    </>
  );
}

const EditProductModal = memo(EditProductModalComponent);
export default EditProductModal;




