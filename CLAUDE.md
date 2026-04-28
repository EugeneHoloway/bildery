# Bildery — правила для Claude

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

## Правила
- Не использовать inline-стили для цветов и отступов
- Тёмная тема активна (`next-themes`, `.dark` класс) — при создании компонентов добавлять `dark:` варианты где нужно
