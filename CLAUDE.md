# Bildery — правила для Claude

## Рабочая директория
Основной проект всегда находится по пути `/Users/eugene/Downloads/Bildery/`.
Все правки файлов делать **только** там, даже если сессия открыта в worktree.


## Стек
- **Next.js 15**, **React 19**, **TypeScript**
- **Tailwind CSS v4.2**
- **shadcn/ui** стиль `radix-nova`, primitives из пакета `radix-ui`
- **Radix UI** импортируется как `import { Dialog as DialogPrimitive } from "radix-ui"`

## Компоненты
Источник истины — **Tailwind + Radix + shadcn**. При создании UI-компонентов ориентироваться на shadcn/ui (radix-nova), класть в `src/components/ui/`.

Сверять компоненты через Shadcn UI MCP (`get_component`, `get_component_demo`), а не по памяти. MCP отдаёт реестр new-york-v4: API и структуру брать оттуда, визуал пресета radix-nova — из локальных `src/components/ui/*`.

## Tailwind — цветовые токены
Только семантические токены, цвета не хардкодить. Порядок выбора:
1. **Вариант компонента** — если у shadcn-компонента есть подходящий `variant` (`Badge variant="destructive"`, `Button variant="destructive"`, `DropdownMenuItem variant="destructive"` и т.п.), брать его, а не собирать цвета классами
2. **Токены shadcn** — основа всего UI
3. **Расширения проекта** — только для того, чего в shadcn нет

**Токены shadcn:**

| Назначение | Класс |
|---|---|
| Фон страницы / текст | `bg-background`, `text-foreground` |
| Приглушённый фон / текст | `bg-muted`, `text-muted-foreground` |
| Карточка | `bg-card`, `text-card-foreground` |
| Поповер, меню | `bg-popover`, `text-popover-foreground` |
| Основная / вторичная заливка | `bg-primary` / `bg-secondary` (+ `-foreground`) |
| Ховер, выделение | `bg-accent`, `text-accent-foreground` |
| Ошибка | `text-destructive`, `bg-destructive` (тонкий фон -- `bg-destructive/10 dark:bg-destructive/20`, как в `Badge`) |
| Границы, поля, фокус | `border-border`, `border-input`, `ring-ring` |
| Сайдбар | `bg-sidebar`, `text-sidebar-foreground`, `sidebar-*` |

**Расширения проекта** (в shadcn аналогов нет):

| Назначение | Класс |
|---|---|
| Акцент бренда | `text-brand`, `bg-brand-bg` (`Badge variant="brand"`) |
| Успех | `text-success`, `bg-success-bg`, `border-success-border` (`Badge variant="success"`) |

Устаревшие дубли -- в новом коде не использовать: `bg-destructive-bg` (вместо него `bg-destructive/10`), `bg-subtle` / `border-subtle-border` (вместо них `bg-muted` / `border-border`).

## Иконки
- Библиотека иконок: **Lucide** (`lucide-react`)
- Всегда импортировать иконки из `lucide-react`, **не писать inline SVG**
- Пример: `import { Lock, Plus, Trash2 } from 'lucide-react'`
- **Внутри shadcn-компонентов** (`Button`, `DropdownMenuItem`, `Badge`, `InputGroupAddon`, `EmptyMedia`, `SidebarMenuButton` и т.п.) размер иконки **не задавать** -- компонент сам выставляет его под свой `size` (`[&_svg:not([class*='size-'])]:size-4`), явный `size-*` ломает пресет. Иконку рядом с текстом в `Button` помечать `data-icon="inline-start"` / `"inline-end"`
- **Вне компонентов** (иконка в своей разметке) размер задавать классом: `size-4` (16px), `size-3.5` (14px) и т.д.

## Компонент Button для иконок
Кнопки с одиночной иконкой — всегда `Button` с `size="icon"` / `icon-sm` / `icon-xs`, вариант по контексту:
- **`variant="outline"`** — отдельно стоящая кнопка или кнопка в группе с другими `outline`-кнопками (например, корзина рядом с Replace / Library в `ButtonGroup`)
- **`variant="ghost"`** — иконка внутри строки, поля или рядом с подписью: удаление в строке label, меню «⋯» в строке списка, копирование ID

## Пресет shadcn
Визуальный пресет проекта: **`--preset b2fA`** (https://ui.shadcn.com/create?preset=b2fA)
Параметры пресета:
- Heading / Font: **Geist**
- Icon Library: **Lucide**
- Radius: **Default** (~0.625rem / 10px)
- Menu: **Default / Solid**
- Menu Accent: **Subtle**

Это ориентир при добавлении новых компонентов и страниц. Пустые состояния (empty states) -- компонент `Empty` из `src/components/ui/empty.tsx`: `EmptyMedia variant="icon"` (подложка `bg-muted`, `rounded-lg` задана в компоненте) + `EmptyTitle` / `EmptyDescription`, не собирать вручную.

## Тёмная тема — обязательно
Тёмная тема активна глобально (`next-themes`, `.dark` класс). При каждом изменении UI нужно явно убедиться, что компонент корректно выглядит в обоих режимах.

**Правила:**
- Использовать семантические токены (`bg-muted`, `text-foreground` и т.д.) — они автоматически переключаются. Расширенные токены проекта (`brand`, `brand-bg`, `success`, `success-bg`) имеют dark-варианты в `globals.css`
- Добавлять `dark:` классы только там, где семантических токенов не хватает
- **При добавлении нового цветового токена** — сразу добавлять его и в `.dark {}` в `globals.css`
- Никогда не использовать светлые фоны (white, hsl с высокой светлотой) без `dark:`-аналога

## Типографика
Использовать стандартную шкалу Tailwind:

`text-xs` · `text-sm` · `text-base` · `text-lg` · `text-xl` · `text-2xl` · `text-3xl` · `text-4xl` · `text-5xl` …

Аналогично для `tracking-*`, `leading-*` и остальных типографических утилит — только встроенные значения Tailwind.

**Исключение — shadcn-компоненты:** внутренние размеры шрифта shadcn/ui компонентов (`text-[0.8rem]` в `Button size="sm"` и т.п.) разрешены, так как они часть пресета b2fA и не являются произвольными значениями. При создании кастомных компонентов, которые должны визуально соответствовать shadcn-размерам, допускается использовать те же значения.

## Правила
- Не использовать inline-стили для цветов и отступов
- Карточки -- компонент `Card`. Если card-контейнер собирается вручную (например, обёртка таблицы), скругление как у `Card`: `rounded-xl` (в пресете `--radius` + 4px = 14px). Шкала радиусов привязана к `--radius`, значения вне её (`rounded-2xl` и выше) не использовать
- Иконки-кнопки всегда с подложкой через `Button` компонент, не голый `<button>`
- **Никогда не использовать эмодзи в UI** — вместо эмодзи всегда брать иконку из `lucide-react`
