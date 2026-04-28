import { z } from 'zod';
import type { TFunction } from 'i18next';

/**
 * Фабрика Zod-схемы для формы редактирования/создания товара.
 *
 * Принимает `t` (TFunction из i18next) — чтобы сообщения об ошибках
 * локализовались в момент построения схемы. Схема пересоздаётся
 * при смене языка (через зависимость от t в useMemo на стороне компонента).
 *
 * Использование:
 *   const schema = useMemo(() => createProductFormSchema(t), [t]);
 *   const form = useForm({ resolver: zodResolver(schema) });
 *
 * Поля price/stock приходят из <input type="number"> как string,
 * поэтому используем z.coerce.number() — он автоматически приводит.
 */
export function createProductFormSchema(t: TFunction) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, { message: t('productForm.errors.nameRequired') })
      .min(2, { message: t('productForm.errors.nameTooShort') }),

    price: z.coerce
      .number({
        invalid_type_error: t('productForm.errors.priceRequired'),
      })
      .positive({ message: t('productForm.errors.priceInvalid') }),

    category: z
      .string()
      .min(1, { message: t('productForm.errors.categoryRequired') }),

    brand: z
      .string()
      .min(1, { message: t('productForm.errors.brandRequired') }),

    stock: z.coerce
      .number({
        invalid_type_error: t('productForm.errors.stockRequired'),
      })
      .int()
      .nonnegative({ message: t('productForm.errors.stockInvalid') }),
  });
}

/**
 * Тип значений формы — выводится из схемы.
 * Используется как единая точка правды для типов RHF.
 */
export type ProductFormValues = z.infer<ReturnType<typeof createProductFormSchema>>;
