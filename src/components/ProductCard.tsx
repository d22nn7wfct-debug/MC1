import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart, selectIsInCart } from '../store/slices/cartSlice';
import { usePriceFormatter } from '../lib/format';
import { isUntranslatedForLang } from '../lib/textLang';
import type { Brand, Category, Product } from '../types';

interface ProductCardProps {
  product: Product;
  categories?: Category[] | undefined;
  brands?: Brand[] | undefined;
  isAdmin?: boolean | undefined;
  onEdit?: ((product: Product) => void) | undefined;
  onDelete?: ((product: Product) => void) | undefined;
}

/**
 * Карточка товара. Отображает основную информацию и кнопки действий.
 * Действия редактирования/удаления опциональны — передаются из родителя.
 */
function ProductCardComponent({
  product,
  categories,
  brands,
  isAdmin = false,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const { t, i18n } = useTranslation();
  const formatPrice = usePriceFormatter();
  const dispatch = useAppDispatch();
  const isInCart = useAppSelector(selectIsInCart(product.id));
  const [imgError, setImgError] = useState(false);

  // Демо-режим: данные из mock-API на русском. Если UI переключён на EN,
  // а описание осталось кириллическим — показываем плашку вместо текста,
  // сохраняя те же 2 строки высоты, чтобы не ломать выравнивание сетки.
  const showDescriptionBanner = isUntranslatedForLang(
    product.description ?? '',
    i18n.language,
  );

  const categoryName =
    categories?.find((c) => c.id === product.category)?.name ?? product.category;
  const brandName =
    brands?.find((b) => b.id === product.brand)?.name ?? product.brand;

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      }),
    );
  };

  const formattedPrice = formatPrice(product.price);

  const isOutOfStock = product.stock <= 0;

  const hasActions = isAdmin && Boolean(onEdit || onDelete);

  return (
    <article className="card-container flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Изображение — фиксированный аспект */}
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100">
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-fluid-sm text-slate-400"
            role="img"
            aria-label={t('product.noImage')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10 opacity-60"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span>{t('product.noImage')}</span>
          </div>
        )}

        {isOutOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-fluid-xs font-medium text-white shadow-sm">
            {t('product.outOfStock')}
          </span>
        )}
      </div>

      {/* Контент карточки — паддинги адаптивные */}
      <div className="flex flex-1 flex-col p-[clamp(0.75rem,2.5cqi,1rem)]">
        {/* Метаданные: категория + бренд — всегда 1 строка */}
        <div className="mb-2 flex min-w-0 items-center gap-1.5 text-fluid-xs text-slate-500">
          <span
            className="max-w-[60%] truncate rounded-full bg-slate-100 px-2 py-0.5"
            title={categoryName}
          >
            {categoryName}
          </span>
          <span className="text-slate-300">·</span>
          <span className="truncate" title={brandName}>
            {brandName}
          </span>
        </div>

        {/* Название — всегда зарезервировано под 2 строки */}
        <h3
          className="line-clamp-2 min-h-[2.75em] text-fluid-base font-semibold leading-snug text-slate-900"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Описание — всегда зарезервировано под 2 строки */}
        {showDescriptionBanner ? (
          <div
            className="mt-1 flex min-h-[2.75em] items-start gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-fluid-xs leading-snug text-amber-800"
            role="note"
            title={product.description}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mt-0.5 h-3.5 w-3.5 flex-shrink-0"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
                clipRule="evenodd"
              />
            </svg>
            <span className="line-clamp-2">
              {t('product.descriptionDemoBanner')}
            </span>
          </div>
        ) : (
          <p
            className="mt-1 line-clamp-2 min-h-[2.75em] text-fluid-sm leading-snug text-slate-500"
            title={product.description || undefined}
          >
            {product.description || '\u00A0'}
          </p>
        )}

        {/* Цена и склад — прижаты к низу контентной зоны */}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="text-fluid-xl font-bold leading-none text-slate-900">
            {formattedPrice}
          </span>
          <span
            className={`shrink-0 text-fluid-xs font-medium ${
              isOutOfStock ? 'text-red-500' : 'text-slate-500'
            }`}
          >
            {isOutOfStock
              ? t('product.outOfStockShort')
              : t('product.inStockCount', { count: product.stock })}
          </span>
        </div>

        {/* Кнопка "В корзину" — всегда на одной высоте между карточками */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          title={isAdmin ? t('product.addToCartAdminTitle') : undefined}
          className={`mt-3 w-full truncate rounded-lg px-2 py-2 text-fluid-sm font-medium transition ${
            isOutOfStock
              ? 'cursor-not-allowed bg-slate-200 text-slate-400'
              : isInCart
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : isAdmin
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isOutOfStock
            ? t('product.unavailable')
            : isInCart
              ? t('product.inCart')
              : isAdmin
                ? t('product.addToCartAdmin')
                : t('product.addToCart')}
        </button>

        {/* Действия — всегда в ряд, иконка + текст, текст всегда виден */}
        {hasActions && (
          <div className="mt-2 flex flex-row gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(product)}
                title={t('common.edit')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-fluid-xs font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                </svg>
                <span>{t('common.edit')}</span>
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(product)}
                title={t('common.delete')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-2 py-1.5 text-fluid-xs font-medium text-red-600 transition hover:bg-red-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                >
                <path
                    fillRule="evenodd"
                    d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{t('common.delete')}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export const ProductCard = memo(ProductCardComponent);
export default ProductCard;
