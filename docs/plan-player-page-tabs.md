# План: страница игрока -- табы в URL и разрез монолита

Дата составления: 2026-07-07. Целевой файл: `src/app/(dashboard)/player/[id]/page.tsx` (~3936 строк).
Номера строк ниже актуальны на момент составления -- перед правками перепроверять грепом, после каждого этапа они сместятся.

## Принятые решения (уже обсуждены, не пересматривать)

1. **Табы остаются клиентскими** внутри одного роута `/player/[id]`. Вариант с под-роутами (`/player/[id]/finance` + layout) рассмотрен и отклонён: переключение табы должно быть мгновенным, страница должна ощущаться монолитной, состояние таб не должно теряться при переключении.
2. **Активная таба отражается в URL query-параметром** `?tab=bonuses`. Hash (`#tab=...`) не используем. Смена табы -- через `window.history.replaceState` (НЕ `router.push`): кнопка «назад» не должна прокликивать табы в обратном порядке.
3. **В URL попадают только отклонения от дефолта**: `/player/123` без параметров = Overview; параметр появляется только для недефолтных значений. Чистый URL остаётся чистым.
4. **Параметры принадлежат активной табе**: при переключении табы чужие параметры (subtab, period, фильтры) из URL убираются. Состояние неактивных таб живёт в React и восстанавливается при возврате на табу.
5. **Монолит режем по табам** в колокацию с роутом: `page.tsx`-шелл + `_components/*-tab.tsx`. Общие для нескольких таб мелкие компоненты -- в `_components/shared.tsx`.
6. **Настройки отображения (видимость/заморозка колонок) в URL НЕ кладём** -- это персональные настройки, их место в localStorage (отдельная задача, не в этом плане).
7. Стиль и токены -- строго по `CLAUDE.md` проекта. Каждый этап проверять в светлой и тёмной теме.

## Текущее состояние кода (ориентиры)

- Страница -- один клиентский компонент. Строки ~63-1130: типы, мок-данные и мелкие компоненты, уже сгруппированные по табам (блоки Finance, Duplicates, Game History, Bonuses почти не зависят друг от друга). Строки ~1133-3936: `PlayerProfilePage`, ~40 `useState`.
- Главные табы: `const TABS` (строка ~237), значения: `overview`, `finance`, `statistics`, `bonuses`, `games-history`, `sport-history`, `duplicates`, `limits`. Табы `statistics` и `sport-history` -- заглушки.
- `<Tabs defaultValue="overview">` -- строка ~1656, неконтролируемый.
- Суб-табы Bonuses: `bonusSubtab` (useState, строка ~1258), `<Tabs value={bonusSubtab}>` (строка ~2314), значения: `bonuses` (дефолт), `shop`, `benefits` (disabled), `packages` (disabled).
- Секции `TabsContent`: overview ~1677, finance ~1844, statistics ~2302, bonuses ~2305 (внутри суб-табы: bonuses ~2381, shop ~2702), games-history ~2715, sport-history ~2829, duplicates ~2840, limits ~3262.
- Попоеры фильтров держат состояние ЛОКАЛЬНО у себя: `FinanceFiltersPopover` (~646, тип `FinanceFilterState` ~633), `DupFiltersPopover` (~764), `BonusFiltersPopover` (~1013). Для URL-фильтров состояние придётся поднимать.
- `DateRangeFilter` (`src/components/ui/date-range-filter.tsx`) -- уже контролируемый (`value`/`onChange`), используется в 4 табах: `financeDateRange` (~1927), `bonusDateRange` (~2370), `gameDateRange` (~2768), `dupDateRange` (~2895). Компонент также используют `all-players/page.tsx` и `reports/page.tsx` -- сам компонент НЕ менять.

## Этап 0 -- подготовка

- [ ] Убедиться, что рабочее дерево чистое; незакоммиченные изменения (all-players, player page, reports, date-range-filter.tsx) закоммитить отдельно ДО начала.
- [ ] `npm run dev`, открыть `http://localhost:3000/player/2883575941`, зафиксировать текущее поведение (все табы, суб-табы, дровери) как базу для сравнения.

## Этап 1 -- `?tab=` и `?subtab=` в URL (маленький, один коммит)

- [ ] Перевести главный `<Tabs>` в контролируемый режим: `const [tab, setTab] = useState(...)`.
- [ ] Начальное значение читать из query (`useSearchParams` из `next/navigation`; если Next потребует Suspense-границу для `useSearchParams` -- обернуть, либо читать `window.location.search` в `useState`-инициализаторе с fallback `'overview'` на сервере). Валидация: значение должно входить в список `TABS.map(t => t.value)`, иначе `overview`.
- [ ] Аналогично `bonusSubtab`: читать `?subtab=`, валидные значения только `bonuses` и `shop` (disabled-табы `benefits`/`packages` отклонять).
- [ ] Единая функция синхронизации URL: собирает query из текущего состояния и вызывает `window.history.replaceState(null, '', url)`. Правила: `tab=overview` -> параметр отсутствует; `subtab` пишется только при `tab=bonuses` и `subtab !== 'bonuses'`; при уходе с bonuses `subtab` удаляется.
- [ ] Проверка (чеклист внизу) + коммит: `feat(player): reflect active tab in URL query params`.

## Этап 2 -- разрез монолита (по одной табе = один коммит)

Целевая структура:

```
src/app/(dashboard)/player/[id]/
  page.tsx              <- шелл: шапка игрока (статус, VIP, copy ID), TABS, Tabs + URL-синк, дровери статуса
  _components/
    shared.tsx          <- StatCard, PillToggle и прочее, что нужно >1 табе
    overview-tab.tsx    <- + WalletsCard, PLAYER_WALLETS, fmtWalletAmount
    finance-tab.tsx     <- + типы Tx*, FINANCE_COLS/ROWS, FinanceFiltersPopover, FinanceTruncCell, FinanceSortableHead, TxStatusBadge, tx-drawer
    bonuses-tab.tsx     <- + типы Bonus*, BONUS_COLS, MOCK_BONUSES, BonusFiltersPopover, суб-табы, bonus-drawer
    game-history-tab.tsx<- + GameHistoryRow, GAME_HISTORY_COLS, MOCK_GAME_HISTORY, GameHeadLabel
    duplicates-tab.tsx  <- + DuplicateAccount, MOCK_DUPLICATES, DupFiltersPopover, DuplicateFlag, dup-drawer
    limits-tab.tsx      <- + PL_TYPES, OL_TYPES, OL_SCOPES, OL_TAGS и связанные дровери
```

Правила разреза:

- Каждый `*-tab.tsx` -- клиентский компонент, владеющий СВОИМ состоянием (search, видимость колонок, дровери, выбранная строка, dateRange, scroll-overflow refs). Пропсов в идеале ноль или минимум (например, `subtab`/`onSubtabChange` для bonuses, т.к. subtab синхронизируется с URL на уровне шелла).
- Вместе с табой переезжают её типы, мок-данные и вспомогательные компоненты. Перед переносом каждого хелпера грепом проверить, не используется ли он другой табой -- тогда он едет в `shared.tsx`.
- Внимание: дровери self-exclusion (`seDrawer*`) и cooling-off (`coDrawer*`) относятся к статусу игрока (шапка), а не к табе -- проверить по коду, откуда открываются, и оставить у владельца.
- Разрез механический: ничего не переписывать, поведение не менять, только перенос кода.

Порядок (от простого к сложному, каждый шаг -- проверка в браузере + коммит `refactor(player): extract <name> tab`):

- [ ] 2.1 `game-history-tab.tsx` (самая самодостаточная -- обкатка паттерна)
- [ ] 2.2 `duplicates-tab.tsx`
- [ ] 2.3 `finance-tab.tsx`
- [ ] 2.4 `bonuses-tab.tsx` (самая большая: суб-табы, дровер с wagering progress)
- [ ] 2.5 `limits-tab.tsx`
- [ ] 2.6 `overview-tab.tsx` + `shared.tsx`; заглушки statistics/sport-history можно оставить inline в page.tsx
- [ ] 2.7 Финальный проход: `page.tsx` должен остаться ~400-600 строк; `npm run build` без ошибок

## Этап 3 -- период (DateRangeFilter) активной табы в URL (маленький, один коммит)

- [ ] Сериализация только для АКТИВНОЙ табы (решение №4): если выбранный диапазон совпадает с пресетом -- `?period=<slug>` (slug из label пресета, напр. `last-28-days`); если кастомный -- `?from=YYYY-MM-DD&to=YYYY-MM-DD`. Дефолтный пресет -> параметра нет.
- [ ] При маунте табы: если в URL есть period/from/to и таба активна -- инициализировать её dateRange из URL.
- [ ] При переключении табы period/from/to из URL убираются (общая функция синка из этапа 1), состояние неактивных таб остаётся в React.
- [ ] `src/components/ui/date-range-filter.tsx` НЕ трогать (используется reports и all-players). Вся сериализация -- на уровне страницы/таб. Проверить, что reports и all-players не задеты.
- [ ] Коммит: `feat(player): reflect active tab date range in URL`.

## Этап 4 (опциональный, делать по потребности) -- фильтры таблиц в URL

- [ ] Поднять состояние фильтров из `FinanceFiltersPopover` / `DupFiltersPopover` / `BonusFiltersPopover` в соответствующий `*-tab.tsx` (сделать попоеры контролируемыми: `filters`/`onFiltersChange`).
- [ ] Сериализация: `Set` -> список через запятую (`?status=failed,pending`), пустые значения не пишутся. Задокументировать имена параметров прямо в коде табы.
- [ ] Правила те же: только активная таба, только отклонения от дефолта, очистка при смене табы.
- [ ] По одной табе за коммит: finance -> duplicates -> bonuses.

## Чеклист проверки после КАЖДОГО этапа

- [ ] `/player/2883575941` без параметров -- Overview, URL чистый.
- [ ] Переключение таб мгновенное, URL меняется, записи в history НЕ добавляются (back уводит со страницы, а не по табам).
- [ ] F5 на любой табе (и суб-табе Bonuses) восстанавливает её.
- [ ] Копирование URL в новую вкладку открывает то же состояние.
- [ ] Невалидный параметр (`?tab=foo`, `?subtab=benefits`) -> молча Overview / дефолт, без крэша.
- [ ] При смене табы чужие параметры исчезают из URL.
- [ ] Нет hydration-warning и ошибок в консоли браузера.
- [ ] Светлая И тёмная тема, десктоп и узкий вьюпорт.
- [ ] `npm run build` проходит.

## Приложение -- тезисы для обсуждения с разработчиками (реальные данные, НЕ для этого прототипа)

- Табы клиентские, данные каждой табы грузятся лениво при первой активации; после первой загрузки таба остаётся смонтированной (мгновенный возврат). Скелетон -- внутри панели табы, шапка страницы не двигается.
- Overview приходит с сервера сразу (RSC/SSR) -- быстрый первый экран.
- Кэш-слой: TanStack Query / SWR, ключ `[playerId, tab, filters, period]`, фоновая ревалидация.
- С реальными данными фильтры/сортировка/пагинация становятся серверными -> их место в URL уже обязательно (URL = описание API-запроса). Этап 4 тогда делается заодно с интеграцией API.
- Code-splitting тяжёлых по коду таб достигается `next/dynamic(() => import('./finance-tab'))` -- под-роуты для этого не нужны.
- Под-роуты оправданы только при независимых страницах с SSR-стримингом/SEO -- для внутренней админки не наш случай.
