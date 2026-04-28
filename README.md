# ElectroShop
## 📑 Содержание

- [Демо-возможности](#-демо-возможности)
- [Технологический стек](#-технологический-стек)
- [Архитектура](#-архитектура)
- [Структура проекта](#-структура-проекта)
- [Поток данных](#-поток-данных)
- [Ролевая модель](#-ролевая-модель)
- [Ключевые фичи и реализация](#-ключевые-фичи-и-реализация)
- [API-слой (mock)](#-api-слой-mock)
- [State Management](#-state-management)
- [Производительность](#-производительность)
- [Запуск проекта](#-запуск-проекта)
- [Скрипты](#-скрипты)
- [Известные ограничения](#-известные-ограничения)
- [Дальнейшее развитие](#-дальнейшее-развитие)

---

## 🎯 Демо-возможности

### Для всех ролей
- 📦 Просмотр каталога с **бесконечной прокруткой** (IntersectionObserver)
- 🔍 Поиск по названию (с debounce 400 мс)
- 🎚️ Фильтрация по категории, диапазону цен
- ↕️ Сортировка по цене / названию (asc/desc)
- 🛍️ Корзина с управлением количеством, ограничением по `stock`
- 💾 Персистентность фильтров и корзины в `localStorage`
- 🔄 Переключение между ролями (logout / role gate)

### Для роли `user`
- 🛒 Оформление заказа из корзины
- 📋 Просмотр **«Мои заказы»** (только собственные, read-only)
- ⏱️ История заказов с датой, статусом, позициями

### Для роли `admin`
- ➕ Создание новых товаров
- ✏️ Редактирование существующих товаров
- 🗑️ Удаление товаров с подтверждением
- 📊 Управление **всеми заказами**: смена статуса, удаление
- 🏷️ Видны бейджи `Админ` / `Пользователь` у каждого заказа
- 🚫 Не может оформлять заказы (только смотреть/управлять)

---

## 🛠 Технологический стек

| Категория | Технология | Назначение |
|---|---|---|
| **Build tool** | Vite 5 | Быстрый dev-сервер, HMR, оптимизированная сборка |
| **Framework** | React 18 | Functional components, hooks, Concurrent features |
| **Язык** | TypeScript 5 (strict) | Полная типизация, никаких `any` |
| **State (client)** | Redux Toolkit | Слайсы для auth, cart, filters |
| **State (server)** | RTK Query | Кэширование API-запросов, теги, мерж страниц |
| **Стилизация** | Tailwind CSS 3 | Utility-first, responsive, без кастомного CSS |
| **Линтинг** | ESLint + Prettier | Code quality, единый стиль |
| **Persist** | localStorage | Корзина, фильтры, заказы, роль |

### Почему именно такой стек?

- **Vite вместо CRA** — на порядок быстрее, нативная поддержка ESM, лучший DX.
- **RTK Query вместо TanStack Query** — единая экосистема с Redux, нет дублирования store-а, теги для инвалидации.
- **Tailwind вместо CSS-in-JS** — нулевой runtime-cost, отличный tree-shaking, единые design tokens.
- **Mock API вместо реального backend** — изолирует фронт, позволяет демонстрировать всю функциональность offline.

---

## 🏛 Архитектура

### Слои приложения


Одностраничное веб-приложение для управления каталогом товаров интернет-магазина электроники. Реализованы просмотр, фильтрация, сортировка, поиск, бесконечная прокрутка, корзина и редактирование/удаление товаров.

Тестовое задание: фокус на логике, управлении состоянием и работе с API.

---

## 🚀 Быстрый старт

Требования: **Node.js >= 18**, **npm >= 9**.

```bash
# 1. Установить зависимости
npm install

# 2. Запустить dev-сервер (Vite)
npm run dev

# 3. Открыть в браузере
# http://localhost:5173
Новый код:
```md

---

## 📦 Импорты и alias `@/*`

В проекте настроен alias `@/*` → `src/*`. Он работает и на уровне TypeScript (`tsconfig.json` → `compilerOptions.paths`), и на уровне сборщика (`vite.config.ts` → `resolve.alias`).

Используйте абсолютные импорты вместо длинных относительных путей:

```ts
// ❌ Плохо — хрупко при перемещении файлов
import { useAppSelector } from '../../../store/hooks';
import type { Product } from '../../types';

// ✅ Хорошо — стабильно и читаемо
import { useAppSelector } from '@/store/hooks';
import type { Product } from '@/types';

```
````
Замени:
````md
# 🛒 ElectroShop — Каталог электроники

Production-grade React-приложение каталога электроники с ролевой моделью (`admin` / `user`), бесконечной прокруткой, корзиной, оформлением заказов, админ-панелью управления товарами и заказами и поддержкой мультиязычности (RU/EN).

> **Демо** на современном стеке: **React 18 + TypeScript 5 (strict) + Redux Toolkit + RTK Query + Tailwind CSS 3 + i18next**. Backend имитируется через mock-API с задержками, имитацией ошибок, in-memory хранилищем и персистентностью в `localStorage`.

---

## 📑 Содержание

- [Демо-возможности](#-демо-возможности)
- [Технологический стек](#-технологический-стек)
- [Архитектура](#-архитектура)
- [Структура проекта](#-структура-проекта)
- [Поток данных](#-поток-данных)
- [Ролевая модель](#-ролевая-модель)
- [Ключевые фичи и реализация](#-ключевые-фичи-и-реализация)
- [API-слой (mock)](#-api-слой-mock)
- [State Management](#-state-management)
- [Интернационализация (i18n)](#-интернационализация-i18n)
- [Производительность](#-производительность)
- [Тестирование](#-тестирование)
- [Импорты и alias `@/*`](#-импорты-и-alias-)
- [Запуск проекта](#-запуск-проекта)
- [Скрипты](#-скрипты)
- [Известные ограничения](#-известные-ограничения)
- [Дальнейшее развитие](#-дальнейшее-развитие)

---

## 🎯 Демо-возможности

### Для всех ролей
- 📦 Просмотр каталога с **бесконечной прокруткой** (IntersectionObserver)
- 🔍 Поиск по названию (debounce 400 мс)
- 🎚️ Фильтрация по категории и диапазону цен
- ↕️ Сортировка по цене / названию (asc/desc)
- 🛍️ Корзина с управлением количеством и ограничением по `stock`
- 🌐 Переключение языка интерфейса (RU/EN) на лету
- 💾 Персистентность фильтров, корзины, заказов и языка в `localStorage`
- 🔄 Переключение между ролями (`logout` / `RoleGate`)

### Для роли `user`
- 🛒 Оформление заказа из корзины
- 📋 Просмотр **«Мои заказы»** (только собственные, read-only)
- ⏱️ История заказов с датой, статусом, позициями

### Для роли `admin`
- ➕ Создание новых товаров (RHF + Zod валидация)
- ✏️ Редактирование существующих товаров
- 🗑️ Удаление товаров с подтверждением
- 📊 Управление **всеми заказами**: смена статуса, удаление
- 🏷️ Бейджи `Админ` / `Пользователь` у каждого заказа
- 🚫 Не может оформлять заказы (read-only по корзине)

---

## 🛠 Технологический стек

| Категория | Технология | Назначение |
|---|---|---|
| **Build tool** | Vite 5 | Быстрый dev-сервер, HMR, оптимизированная сборка |
| **Framework** | React 18 | Functional components, hooks, Concurrent features |
| **Язык** | TypeScript 5 (strict) | Полная типизация, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` |
| **State (client)** | Redux Toolkit | Слайсы `auth`, `cart`, `filters` |
| **State (server)** | RTK Query | Кэширование, теги, мерж страниц для infinite scroll |
| **Формы** | React Hook Form + Zod | Типобезопасная валидация на стороне клиента |
| **i18n** | i18next + react-i18next | Локализация RU/EN, language detector |
| **Стилизация** | Tailwind CSS 3 | Utility-first, responsive, без кастомного CSS |
| **Тесты** | Vitest + RTL + jsdom | Unit + integration; MSW в зависимостях для будущего E2E мокинга |
| **Линтинг** | ESLint + Prettier + jsx-a11y | Code quality, accessibility, единый стиль |
| **Bundle analysis** | rollup-plugin-visualizer | Анализ размера чанков (`npm run build:analyze`) |
| **Persist** | localStorage | Корзина, фильтры, заказы, роль, язык |

### Почему именно такой стек?

- **Vite вместо CRA** — на порядок быстрее, нативная поддержка ESM, лучший DX, простая настройка manual chunks.
- **RTK Query вместо TanStack Query** — единая экосистема с Redux, нет дублирования store-а, теги для инвалидации, нативная интеграция с slices.
- **Tailwind вместо CSS-in-JS** — нулевой runtime-cost, отличный tree-shaking, единые design tokens, мгновенный HMR.
- **RHF + Zod** — schema-first подход, типы выводятся из схемы (`z.infer`), валидация переиспользуется на сервере.
- **i18next** — индустриальный стандарт, lazy-loading локалей, типизация ключей через `CustomTypeOptions`.
- **Mock API вместо реального backend** — изолирует фронт, позволяет демонстрировать всю функциональность offline, имитирует ошибки и задержки.

---

## 🏛 Архитектура

### Слои приложения

```
┌─────────────────────────────────────────────────────────┐
│  UI Layer (components/)                                 │
│  Header · ProductList · CartModal · OrdersModal · ...   │
│  - Презентационные компоненты + контейнеры              │
│  - useBodyScrollLock, useDebounce, useInfiniteScroll    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│  State Layer                                            │
│  ├─ Redux Toolkit slices: auth, cart, filters           │
│  └─ RTK Query: productsApi, ordersApi (server cache)    │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│  Data Layer (api/, lib/)                                │
│  - mockApi (имитация REST с задержками и ошибками)      │
│  - getErrorMessage (нормализация ошибок → i18n keys)    │
│  - format (Intl: цены, даты, реактивность к языку)      │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│  Persistence (localStorage via constants/storage.ts)    │
│  catalog:cart · catalog:filters · catalog:auth · ...    │
└─────────────────────────────────────────────────────────┘
```

### Принципы

- **Component-driven** — маленькие переиспользуемые компоненты с одной ответственностью.
- **Container/Presentational** — логика вынесена в hooks и selectors, UI-компоненты не знают о Redux напрямую (используют типизированные `useAppSelector` / `useAppDispatch`).
- **Strict TypeScript** — никаких `any`, явные типы возврата для публичных API, дженерики там, где это даёт пользу.
- **Error Boundary** — на корневом уровне, ловит непойманные ошибки рендера и показывает fallback UI.
- **A11y first** — семантический HTML, ARIA, focus trap в модалках, закрытие по `Escape`, `eslint-plugin-jsx-a11y` в CI.

---

## 📁 Структура проекта

```
src/
├── api/
│   └── mockApi.ts              # Имитация REST API: задержки, ошибки, in-memory + localStorage
├── components/
│   ├── CartModal.tsx           # Корзина + оформление заказа
│   ├── ConfirmDialog.tsx       # Универсальный диалог подтверждения
│   ├── EditProductModal.tsx    # Создание/редактирование товара (RHF + Zod)
│   ├── EditProductModal.schema.ts  # Zod-схема формы (i18n-aware)
│   ├── ErrorBoundary.tsx       # React Error Boundary с fallback UI
│   ├── Filters.tsx             # Поиск, категория, цена, сортировка
│   ├── Header.tsx              # Шапка: корзина, фильтры, заказы, role badge
│   ├── LanguageSwitcher.tsx    # Переключение RU/EN
│   ├── OrdersModal.tsx         # Заказы (admin: все, user: свои)
│   ├── ProductCard.tsx         # Карточка товара + fallback-плейсхолдер
│   ├── ProductCard.test.tsx    # Тесты карточки (RTL + userEvent)
│   ├── ProductList.tsx         # Сетка + infinite scroll
│   ├── RoleGate.tsx            # Экран выбора роли (admin/user)
│   └── Spinner.tsx             # Лоадер
├── constants/
│   └── storage.ts              # Все ключи localStorage с префиксом `catalog:`
├── hooks/
│   ├── useBodyScrollLock.ts    # Глобальная блокировка скролла со счётчиком
│   ├── useDebounce.ts          # Дебаунс значения
│   ├── useDebounce.test.ts
│   └── useInfiniteScroll.ts    # IntersectionObserver-based infinite scroll
├── i18n/
│   ├── index.ts                # Инициализация i18next + LanguageDetector
│   ├── types.d.ts              # Типизация ключей через CustomTypeOptions
│   └── locales/
│       ├── en.ts
│       └── ru.ts
├── lib/
│   ├── errors.ts               # getErrorMessage: ApiError → i18n-key
│   ├── errors.test.ts
│   ├── format.ts               # usePriceFormatter, useDateFormatter (реактивные к языку)
│   └── textLang.ts             # Эвристика «текст не переведён для UI-языка»
├── mocks/
│   ├── brands.json
│   ├── categories.json
│   └── products.json
├── store/
│   ├── api/
│   │   ├── productsApi.ts      # RTK Query: products + categories + brands
│   │   └── ordersApi.ts        # RTK Query: orders CRUD
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── cartSlice.ts
│   │   ├── cartSlice.test.ts
│   │   ├── filtersSlice.ts
│   │   └── filtersSlice.test.ts
│   ├── hooks.ts                # Типизированные useAppDispatch / useAppSelector
│   └── index.ts                # configureStore
├── test/
│   └── setup.ts                # Vitest + RTL setup, моки IntersectionObserver/ResizeObserver
├── types/
│   └── index.ts                # Доменные типы: Product, Order, Filters, ApiError, ...
├── App.tsx
├── main.tsx
└── index.css                   # Tailwind directives
```

---

## 🔄 Поток данных

```
User action (клик/ввод)
         │
         ▼
   Component (UI)
         │
         ├──► dispatch(action)        ──► Redux slice (auth/cart/filters)
         │                                          │
         │                                          ▼
         │                                  localStorage (persist)
         │
         └──► RTK Query hook (useGetProductsQuery, ...)
                       │
                       ▼
              fakeBaseQuery → mockApi
                       │
                       ▼
            Кэш RTK Query (с тегами)
                       │
                       ▼
              providesTags / invalidatesTags
                       │
                       ▼
        Автоматический re-fetch при мутациях
```

**Пример:** создание товара (admin)
1. Форма `EditProductModal` (RHF + Zod) → `useCreateProductMutation`.
2. RTK Query вызывает `mockApi.createProduct` → ответ кэшируется.
3. Мутация инвалидирует тег `Products` → `useGetProductsQuery` автоматически refetch'ит первую страницу.
4. UI обновляется без ручного управления.

---

## 👥 Ролевая модель

Реализована через `authSlice` + `RoleGate`. **Это демо-режим без серверной авторизации** — роль выбирается кликом и сохраняется в `localStorage`.

| Возможность | `guest` | `user` | `admin` |
|---|:---:|:---:|:---:|
| Просмотр каталога | ❌ (RoleGate) | ✅ | ✅ |
| Корзина | ❌ | ✅ | 👀 read-only |
| Оформление заказа | ❌ | ✅ | ❌ |
| «Мои заказы» | ❌ | ✅ | ❌ |
| Все заказы | ❌ | ❌ | ✅ |
| Создание/редактирование товаров | ❌ | ❌ | ✅ |
| Удаление товаров | ❌ | ❌ | ✅ |

Переключение роли — кнопка `logout` в шапке → возврат на `RoleGate`.

---

## ⚡ Ключевые фичи и реализация

### Бесконечная прокрутка
- `useInfiniteScroll` на базе `IntersectionObserver`
- RTK Query мерджит страницы через `serializeQueryArgs` + `merge` (стандартный паттерн RTKQ для infinite queries)
- Sentinel-элемент в конце списка триггерит `loadMore`

### Корзина
- `cartSlice` с селекторами `selectCartItems`, `selectCartTotalPrice`, `selectIsInCart`
- Ограничение количества по `stock` товара
- Дебаунс инпута количества во избежание мусорных диспатчей
- Персистентность в `localStorage` с защищённым парсингом (фильтрация невалидных items)

### Формы (создание/редактирование товара)
- React Hook Form + `@hookform/resolvers/zod`
- Zod-схема создаётся через фабрику `createProductFormSchema(t)` — сообщения об ошибках берутся из i18n
- Типы выводятся через `z.infer<ReturnType<typeof createProductFormSchema>>`

### Обработка ошибок
- `getErrorMessage(error, t, fallbackKey)` — единая точка нормализации
- `ApiError` имеет `code` (машинно-читаемый) → мапится в `errors.<code>` через i18n
- `ErrorBoundary` ловит непойманные ошибки рендера на уровне всего приложения

### Модалки и a11y
- `useBodyScrollLock` со счётчиком (поддержка вложенных модалок)
- Закрытие по `Escape`, клик по overlay
- `role="dialog"`, `aria-modal`, `aria-label`
- Focus management внутри модалок

---

## 🎭 API-слой (mock)

`src/api/mockApi.ts` имитирует REST с реалистичным поведением:

- **Задержки** — `delay(300ms)` перед каждым ответом
- **Имитация ошибок** — настраиваемая `FAIL_RATE` (по умолчанию 0)
- **Пагинация** — `page` + `limit` + `hasMore`
- **Поиск/фильтры/сортировка** — на стороне «сервера»
- **Персистентность заказов** — в `localStorage` (`catalog:orders`)
- **Сброс данных** — `resetMockData()` чистит заказы и localStorage (полезно для тестов)

Все методы возвращают `Promise<T>` с типами из `src/types/index.ts`. Замена на реальный backend — изменение одного файла.

---

## 🗄 State Management

| Состояние | Где живёт | Почему |
|---|---|---|
| Список товаров, категории, бренды, заказы | **RTK Query** | Серверные данные → нужен кэш, инвалидация, refetch |
| Корзина | **`cartSlice`** + localStorage | Клиентское состояние с персистентностью |
| Фильтры | **`filtersSlice`** + localStorage | Клиентское состояние, влияет на queryArg RTK Query |
| Роль | **`authSlice`** + localStorage | Клиентское состояние, влияет на гварды UI |
| Состояние модалок | **`useState`** в `App.tsx` | Локальное UI-состояние, не нужно глобально |
| Поля формы | **React Hook Form** | Изолированный controlled-state с валидацией |

Селекторы вынесены в slices (`selectCartItems`, `selectActiveFiltersCount`, ...), типизированы через `RootState`.

---

## 🌍 Интернационализация (i18n)

- **Языки**: RU (по умолчанию), EN
- **Библиотеки**: `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- **Типизация ключей**: через `CustomTypeOptions` в `src/i18n/types.d.ts` — IDE подсказывает доступные ключи, опечатки ловятся компилятором
- **Реактивные форматеры**: `usePriceFormatter` / `useDateFormatter` обновляются при смене языка через `i18n.on('languageChanged', ...)` с корректным cleanup
- **Локализация Zod-сообщений**: схема формы создаётся как функция от `t`, поэтому ошибки валидации тоже мультиязычны
- **Эвристика непереведённого текста**: `isUntranslatedForLang` помогает корректно отображать названия товаров из мок-данных

Файлы локалей: `src/i18n/locales/{ru,en}.ts` (плоские объекты с namespaces).

---

## 🚀 Производительность

- **Manual vendor chunks** в `vite.config.ts`:
  - `vendor-react` (react, react-dom)
  - `vendor-redux` (@reduxjs/toolkit, react-redux)
  - `vendor-i18n` (i18next, react-i18next, i18next-browser-languagedetector)
  - `vendor-forms` (react-hook-form, @hookform/resolvers, zod)
- **Bundle analysis**: `npm run build:analyze` → `dist/stats.html` (rollup-plugin-visualizer)
- **Debounce**: поиск (400 мс) и поля цены (500 мс)
- **`React.memo`/`useCallback`** — точечно, только там, где это даёт измеримый эффект
- **IntersectionObserver** вместо scroll-listener-а
- **Lazy hydration справочников** (категории/бренды) — загружаются один раз на верхнем уровне `App.tsx`

---

## 🧪 Тестирование

- **Runner**: Vitest 2 (jsdom environment)
- **Утилиты**: Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`)
- **Setup**: `src/test/setup.ts` — моки `IntersectionObserver` и `ResizeObserver`
- **MSW**: установлен и готов к подключению для интеграционных тестов API

### Покрытие
- ✅ `cartSlice` — add/remove/update quantity, селекторы
- ✅ `filtersSlice` — `selectActiveFiltersCount`, ресет
- ✅ `getErrorMessage` — все ветки (ApiError, FetchBaseQueryError, Error, неизвестное)
- ✅ `useDebounce` — таймеры, очистка
- ✅ `ProductCard` — рендер, добавление в корзину, режим admin (edit/delete), `out of stock`

### Запуск
```bash
npm test              # Watch-режим
npm run test:run      # Один прогон (для CI)
npm run test:ui       # Vitest UI
npm run test:coverage # Coverage report (v8)
```

---

## 📦 Импорты и alias `@/*`

В проекте настроен alias `@/*` → `src/*`. Он работает и на уровне TypeScript (`tsconfig.json` → `compilerOptions.paths`), и на уровне сборщика (`vite.config.ts` → `resolve.alias`), и в Vitest (`vitest.config.ts`).

Используйте абсолютные импорты вместо длинных относительных путей:

```ts
// ❌ Плохо — хрупко при перемещении файлов
import { useAppSelector } from '../../../store/hooks';
import type { Product } from '../../types';

// ✅ Хорошо — стабильно и читаемо
import { useAppSelector } from '@/store/hooks';
import type { Product } from '@/types';
```

> **Примечание**: в текущем коде ещё встречаются относительные импорты — миграция на `@/*` идёт постепенно, новый код пишется сразу через alias.

---

## 🚀 Запуск проекта

Требования: **Node.js >= 20 LTS**, **npm >= 10**.

```bash
# 1. Установить зависимости
npm install

# 2. Запустить dev-сервер (Vite)
npm run dev

# 3. Открыть в браузере
# http://localhost:3000
```

Production-сборка:
```bash
npm run build      # tsc + vite build → dist/
npm run preview    # Локальный просмотр production-сборки
```

---

## 📜 Скрипты

| Скрипт | Назначение |
|---|---|
| `npm run dev` | Dev-сервер Vite на `http://localhost:3000` |
| `npm run build` | TypeScript check + production build |
| `npm run build:analyze` | Сборка с генерацией `dist/stats.html` (bundle visualizer) |
| `npm run preview` | Локальный preview production-сборки |
| `npm run lint` | ESLint (max-warnings 0) |
| `npm run format` | Prettier для всех `*.{ts,tsx,css,json}` в `src/` |
| `npm test` | Vitest в watch-режиме |
| `npm run test:run` | Vitest один прогон (CI-friendly) |
| `npm run test:ui` | Vitest UI |
| `npm run test:coverage` | Coverage report (v8) |

---

## ⚠️ Известные ограничения

Проект — **демо/portfolio уровня**, и это явно отражено в коде:

1. **Mock backend** — `mockApi.ts` поверх `localStorage`. Никакой серверной авторизации, ролей, валидации.
2. **Роль выбирается кликом** в `RoleGate` — это не auth, а демонстрация UX-разделения.
3. **Нет роутинга** — вся навигация на стейте модалок. Deeplink на товар/заказ невозможен, кнопка «назад» в браузере не работает как ожидается.
4. **Нет E2E** — есть unit + integration через RTL, но Playwright/Cypress пока не подключены.
5. **Нет CI/CD конфига** в репозитории.
6. **Нет observability** (Sentry, Web Vitals, analytics) — только `ErrorBoundary` локально.
7. **Нет CSP / security headers** и валидации env через Zod на старте.
8. **Миграция импортов на `@/*`** не завершена — в части файлов всё ещё относительные пути.

---

## 🛣 Дальнейшее развитие

Roadmap до полноценного production:

### Этап 1 — Backend & Routing
- [ ] Подключение реального REST/GraphQL backend
- [ ] Auth (JWT/OAuth) + защищённые роуты
- [ ] React Router v6 (data routers, lazy routes, error boundaries на уровне роута)
- [ ] Deeplink на товар/заказ, scroll restoration

### Этап 2 — Quality & Observability
- [ ] CI/CD pipeline (GitHub Actions): lint → typecheck → test → build → deploy
- [ ] E2E на Playwright (критичные сценарии: оформление заказа, CRUD товаров)
- [ ] Sentry для error tracking + Web Vitals
- [ ] PostHog/Amplitude для product analytics

### Этап 3 — Security & Performance
- [ ] CSP headers, валидация env через Zod на старте
- [ ] Виртуализация списка товаров (TanStack Virtual) при больших объёмах
- [ ] Code-splitting роутов через `React.lazy` + `Suspense`
- [ ] Preload critical resources, image optimization

### Этап 4 — DX & Architecture
- [ ] Завершить миграцию импортов на `@/*`
- [ ] Storybook для UI-компонентов
- [ ] Опциональный переход на Feature-Sliced Design при росте кодобазы
- [ ] Подключить MSW для интеграционных тестов с моком сети

---

## 📄 Лицензия

MIT — используйте свободно как референс или основу для своих проектов.
````
