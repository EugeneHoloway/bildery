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

## Tailwind — токены проекта
Использовать только эти значения, не хардкодить цвета/отступы:

| Назначение | Класс |
|---|---|
| Основной текст | `text-foreground` |
| Приглушённый текст | `text-muted-foreground` |
| Фон страницы | `bg-background` |
| Граница | `border-border` |
| Акцент (индиго) | `text-brand`, `bg-brand-bg` |
| Успех | `text-success`, `bg-success-bg` |
| Ошибка | `text-destructive`, `bg-destructive-bg` |
| Тонкий фон | `bg-subtle`, `border-subtle-border` |

## Иконки
- Библиотека иконок: **Lucide** (`lucide-react`)
- Всегда импортировать иконки из `lucide-react`, **не писать inline SVG**
- Пример: `import { Lock, Plus, Trash2 } from 'lucide-react'`
- Размер иконки задавать через класс: `size-4` (16px), `size-3.5` (14px) и т.д.

## Компонент Button для иконок
Для кнопок с одиночной иконкой использовать `<Button variant="outline" size="icon-sm">` или `size="icon"` — это даёт правильную подложку и hover-состояние по shadcn/пресету.

## Пресет shadcn
Визуальный пресет проекта: **`--preset b2fA`** (https://ui.shadcn.com/create?preset=b2fA)
Параметры пресета:
- Heading / Font: **Geist**
- Icon Library: **Lucide**
- Radius: **Default** (~0.625rem / 10px)
- Menu: **Default / Solid**
- Menu Accent: **Subtle**

Это ориентир при добавлении новых компонентов и страниц. Пустые состояния (empty states) оформлять по паттерну shadcn: иконка с подложкой (`bg-muted`, `rounded-xl`) + подпись.

## Тёмная тема — обязательно
Тёмная тема активна глобально (`next-themes`, `.dark` класс). При каждом изменении UI нужно явно убедиться, что компонент корректно выглядит в обоих режимах.

**Правила:**
- Использовать семантические токены (`bg-muted`, `text-foreground` и т.д.) — они автоматически переключаются. Все расширенные токены проекта (включая `brand-bg`, `success-bg`, `destructive-bg`, `subtle`) имеют dark-варианты в `globals.css`
- Добавлять `dark:` классы только там, где семантических токенов не хватает
- **При добавлении нового цветового токена** — сразу добавлять его и в `.dark {}` в `globals.css`
- Никогда не использовать светлые фоны (white, hsl с высокой светлотой) без `dark:`-аналога

## Типографика — только стандартная шкала Tailwind
Никогда не использовать произвольные размеры шрифта (`text-[2rem]`, `text-[0.7rem]` и т.д.).
Всегда выбирать ближайший шаг из стандартной шкалы:

`text-xs` · `text-sm` · `text-base` · `text-lg` · `text-xl` · `text-2xl` · `text-3xl` · `text-4xl` · `text-5xl` …

Аналогично для `tracking-*`, `leading-*` и остальных типографических утилит — только встроенные значения Tailwind.

## Правила
- Не использовать inline-стили для цветов и отступов
- Скругления карточек: `rounded-2xl` (1rem = 16px) — стандарт для card-контейнеров
- Иконки-кнопки всегда с подложкой через `Button` компонент, не голый `<button>`
- **Никогда не использовать эмодзи в UI** — вместо эмодзи всегда брать иконку из `lucide-react`
