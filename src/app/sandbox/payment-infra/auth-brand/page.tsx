'use client'

import { useState } from 'react'
import {
  Shield, AlertTriangle, CheckCircle2, Info,
  Lock, Globe, User, Clock, Key, ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DocLayout  } from '@/components/doc/DocLayout'
import { DocSection } from '@/components/doc/DocSection'
import { DocTable, DocTableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/doc/DocTable'
import { Badge } from '@/components/ui/badge'

// ─── Lang ─────────────────────────────────────────────────────────────────────

type Lang = 'en' | 'ua'

function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5">
      {(['en', 'ua'] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={[
            'px-2.5 py-1 rounded-md text-xs font-semibold transition-colors',
            lang === l
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = 'required' | 'recommended' | 'optional'

interface I18n { en: string; ua: string }

interface Check {
  id: string
  title: I18n
  desc?: I18n
  errorCode?: string
  errorMsg?: string
  severity: Severity
}

interface Group {
  id: string
  title: I18n
  subtitle?: I18n
  Icon: typeof Shield
  checks: Check[]
}

interface EdgeCase {
  title: I18n
  scenario: I18n
  expected: I18n
  severity: 'high' | 'medium'
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SEVERITY_STYLE: Record<Severity, { badge: string }> = {
  required:    { badge: 'bg-destructive-bg text-destructive border-destructive/30' },
  recommended: { badge: 'bg-warning-bg text-warning border-warning/30'             },
  optional:    { badge: 'bg-muted text-muted-foreground border-border'             },
}

const GROUPS: Group[] = [
  {
    id: 'jwt_structure',
    title:    { en: 'JWT -- Structure & Signature', ua: 'JWT -- Структура та підпис' },
    subtitle: { en: 'Validate the token before touching any payload data.', ua: 'Перевірити токен до звернення до будь-яких даних payload.' },
    Icon: Key,
    checks: [
      {
        id: 'jwt-present',
        title: { en: 'Authorization header is present', ua: 'Заголовок Authorization присутній' },
        desc: {
          en: 'Request must include Authorization: Bearer <token>. Missing header -- reject immediately.',
          ua: 'Запит повинен містити Authorization: Bearer <token>. Відсутній заголовок -- відхилити одразу.',
        },
        errorCode: '401', errorMsg: 'MISSING_TOKEN', severity: 'required',
      },
      {
        id: 'jwt-format',
        title: { en: 'Token has valid JWT format', ua: 'Токен має валідний формат JWT' },
        desc: {
          en: 'Must consist of exactly three Base64URL segments separated by dots: header.payload.signature. Malformed string -- reject.',
          ua: 'Повинен складатись рівно з трьох Base64URL-сегментів, розділених крапками: header.payload.signature. Неправильний рядок -- відхилити.',
        },
        errorCode: '401', errorMsg: 'MALFORMED_TOKEN', severity: 'required',
      },
      {
        id: 'jwt-alg',
        title: { en: 'Algorithm matches expected (alg claim)', ua: 'Алгоритм відповідає очікуваному (alg claim)' },
        desc: {
          en: 'Accept only configured algorithm (e.g. HS256 or RS256). Reject tokens with alg: none or unexpected algorithm -- this prevents algorithm-confusion attacks.',
          ua: 'Приймати лише сконфігурований алгоритм (наприклад, HS256 або RS256). Відхиляти токени з alg: none або несподіваним алгоритмом -- це запобігає атакам algorithm-confusion.',
        },
        errorCode: '401', errorMsg: 'INVALID_TOKEN_ALG', severity: 'required',
      },
      {
        id: 'jwt-signature',
        title: { en: 'Signature is cryptographically valid', ua: 'Підпис криптографічно валідний' },
        desc: {
          en: 'Verify HMAC or RSA signature against the secret/public key. A single bit difference -- reject.',
          ua: 'Перевірити HMAC або RSA підпис за допомогою secret/public key. Будь-яка різниця -- відхилити.',
        },
        errorCode: '401', errorMsg: 'INVALID_TOKEN_SIGNATURE', severity: 'required',
      },
    ],
  },
  {
    id: 'jwt_claims',
    title:    { en: 'JWT -- Claims Validation', ua: 'JWT -- Валідація claims' },
    subtitle: { en: 'Standard claims must be present and within valid ranges.', ua: 'Стандартні claims мають бути присутні та в допустимих межах.' },
    Icon: Clock,
    checks: [
      {
        id: 'jwt-exp',
        title: { en: 'Token is not expired (exp claim)', ua: 'Токен не прострочений (exp claim)' },
        desc: {
          en: 'exp must be in the future. Allow a small clock-skew tolerance (up to 60 seconds) for distributed systems.',
          ua: 'exp має бути в майбутньому. Допускати невелику похибку синхронізації годинника (до 60 секунд) для розподілених систем.',
        },
        errorCode: '401', errorMsg: 'TOKEN_EXPIRED', severity: 'required',
      },
      {
        id: 'jwt-nbf',
        title: { en: 'Token is active (nbf claim)', ua: 'Токен активний (nbf claim)' },
        desc: {
          en: 'If nbf (not before) is present, current time must be >= nbf. Reject tokens used before their activation time.',
          ua: 'Якщо nbf (not before) присутній, поточний час має бути >= nbf. Відхиляти токени, використані до часу активації.',
        },
        errorCode: '401', errorMsg: 'TOKEN_NOT_YET_VALID', severity: 'required',
      },
      {
        id: 'jwt-iss',
        title: { en: 'Issuer matches expected (iss claim)', ua: 'Емітент відповідає очікуваному (iss claim)' },
        desc: {
          en: 'iss must match the configured issuer identifier. Prevents accepting tokens from foreign auth services.',
          ua: 'iss має збігатись з налаштованим ідентифікатором емітента. Запобігає прийняттю токенів від сторонніх auth-сервісів.',
        },
        errorCode: '401', errorMsg: 'INVALID_TOKEN_ISSUER', severity: 'required',
      },
      {
        id: 'jwt-aud',
        title: { en: 'Audience is correct (aud claim)', ua: 'Аудиторія правильна (aud claim)' },
        desc: {
          en: 'If aud is present, it must include the payment service identifier (e.g. "payment-api"). Prevents using tokens issued for other services.',
          ua: 'Якщо aud присутній, він має містити ідентифікатор платіжного сервісу (наприклад, "payment-api"). Запобігає використанню токенів, виданих для інших сервісів.',
        },
        errorCode: '401', errorMsg: 'INVALID_TOKEN_AUDIENCE', severity: 'recommended',
      },
      {
        id: 'jwt-sub',
        title: { en: 'Subject (user ID) is present (sub claim)', ua: 'Subject (ID користувача) присутній (sub claim)' },
        desc: {
          en: 'sub must be a non-empty string. This is the player\'s identifier -- required to attach the transaction to a user.',
          ua: 'sub має бути непорожнім рядком. Це ідентифікатор гравця -- необхідний для прив\'язки транзакції до користувача.',
        },
        errorCode: '401', errorMsg: 'MISSING_SUBJECT', severity: 'required',
      },
      {
        id: 'jwt-jti',
        title: { en: 'Token ID is unique (jti claim) -- revocation', ua: 'ID токена унікальний (jti claim) -- відкликання' },
        desc: {
          en: 'If jti is present, check it against a revocation list (Redis). Allows immediate token invalidation on logout or security event.',
          ua: 'Якщо jti присутній, перевірити його у списку відкликання (Redis). Дозволяє миттєво інвалідувати токен при logout або security-події.',
        },
        errorCode: '401', errorMsg: 'TOKEN_REVOKED', severity: 'recommended',
      },
    ],
  },
  {
    id: 'jwt_payload',
    title:    { en: 'JWT -- Payload Contents', ua: 'JWT -- Вміст payload' },
    subtitle: { en: 'Business-level fields required for downstream processing.', ua: 'Бізнес-поля, необхідні для подальшої обробки запиту.' },
    Icon: User,
    checks: [
      {
        id: 'payload-userid',
        title: { en: 'user_id is a valid, non-empty identifier', ua: 'user_id -- валідний непорожній ідентифікатор' },
        desc: {
          en: 'Must be a non-empty string or positive integer. Reject obviously invalid values (empty string, "null", 0).',
          ua: 'Має бути непорожнім рядком або додатним цілим числом. Відхиляти очевидно невалідні значення (порожній рядок, "null", 0).',
        },
        errorCode: '401', errorMsg: 'INVALID_USER_ID', severity: 'required',
      },
      {
        id: 'payload-session',
        title: { en: 'session_id is present', ua: 'session_id присутній' },
        desc: {
          en: 'Required for idempotency and fraud correlation. Pass downstream to orchestrator.',
          ua: 'Необхідний для ідемпотентності та кореляції фроду. Передавати далі в оркестратор.',
        },
        errorCode: '401', errorMsg: 'MISSING_SESSION_ID', severity: 'recommended',
      },
      {
        id: 'payload-role',
        title: { en: 'User has payment permission', ua: 'Користувач має дозвіл на платежі' },
        desc: {
          en: 'If roles/permissions are encoded in JWT, verify the user is allowed to initiate payments (e.g. not a banned or restricted account at token-issuance time).',
          ua: 'Якщо ролі/дозволи закодовані в JWT, перевірити що користувач може ініціювати платежі (наприклад, не заблокований акаунт на момент видачі токена).',
        },
        errorCode: '403', errorMsg: 'INSUFFICIENT_PERMISSIONS', severity: 'recommended',
      },
    ],
  },
  {
    id: 'brand_resolution',
    title:    { en: 'Brand Resolution', ua: 'Визначення бренду' },
    subtitle: { en: 'Determine which brand (tenant) is making the request.', ua: 'Визначити який бренд (тенант) робить запит.' },
    Icon: Globe,
    checks: [
      {
        id: 'brand-source',
        title: { en: 'brand_id is resolved from one of the accepted sources', ua: 'brand_id визначено з одного з прийнятих джерел' },
        desc: {
          en: 'Resolution order (first wins): 1) JWT payload claim brand_id -- 2) Request header X-Brand-ID -- 3) Origin/Host domain mapped to brand. If none resolve -- reject.',
          ua: 'Порядок визначення (перший виграє): 1) claim brand_id у JWT payload -- 2) заголовок запиту X-Brand-ID -- 3) домен Origin/Host, маплений на бренд. Якщо жоден не спрацював -- відхилити.',
        },
        errorCode: '400', errorMsg: 'UNRESOLVABLE_BRAND', severity: 'required',
      },
      {
        id: 'brand-exists',
        title: { en: 'brand_id exists in the database', ua: 'brand_id існує в базі даних' },
        desc: {
          en: 'Load brand config from DB (or cache). If brand_id is not found -- reject. Do not silently fall back to a default brand.',
          ua: 'Завантажити конфіг бренду з БД (або кешу). Якщо brand_id не знайдено -- відхилити. Не робити тихий fallback на дефолтний бренд.',
        },
        errorCode: '400', errorMsg: 'UNKNOWN_BRAND', severity: 'required',
      },
      {
        id: 'brand-active',
        title: { en: 'Brand is active (not suspended)', ua: 'Бренд активний (не призупинений)' },
        desc: {
          en: 'Brand may be temporarily disabled (maintenance, legal hold). If brand.status != active -- reject with clear error.',
          ua: 'Бренд може бути тимчасово вимкнений (обслуговування, юридичне заморожування). Якщо brand.status != active -- відхилити з чітким повідомленням.',
        },
        errorCode: '403', errorMsg: 'BRAND_SUSPENDED', severity: 'required',
      },
      {
        id: 'brand-jwt-match',
        title: { en: 'JWT sub (user) belongs to the resolved brand', ua: 'JWT sub (користувач) належить до визначеного бренду' },
        desc: {
          en: 'Verify the user_id in the JWT was issued by the same brand. Prevents cross-brand token reuse -- a user from brand A cannot act under brand B.',
          ua: 'Перевірити що user_id у JWT був виданий тим самим брендом. Запобігає міжбрендовому повторному використанню токенів -- користувач бренду A не може діяти під брендом B.',
        },
        errorCode: '403', errorMsg: 'USER_BRAND_MISMATCH', severity: 'required',
      },
      {
        id: 'brand-psp-config',
        title: { en: 'Brand has at least one active PSP configured', ua: 'У бренду налаштований хоча б один активний PSP' },
        desc: {
          en: 'If the brand has no active PSP config, payment cannot proceed. Fail fast here rather than inside the orchestrator.',
          ua: 'Якщо у бренду немає активного PSP конфігу, платіж не може бути виконаний. Краще відхилити тут, аніж всередині оркестратора.',
        },
        errorCode: '503', errorMsg: 'NO_PSP_CONFIGURED', severity: 'recommended',
      },
    ],
  },
  {
    id: 'context_propagation',
    title:    { en: 'Context Propagation', ua: 'Передача контексту' },
    subtitle: { en: 'Auth & Brand layer must enrich the request before passing it downstream.', ua: 'Шар Auth & Brand зобов\'язаний збагатити запит перед передачею далі.' },
    Icon: ArrowRight,
    checks: [
      {
        id: 'ctx-user-id',
        title: { en: 'user_id is attached to request context', ua: 'user_id прикріплений до контексту запиту' },
        desc: {
          en: 'Set on internal request object / middleware context. Never re-read from JWT downstream -- use the validated value.',
          ua: 'Встановити у внутрішньому об\'єкті запиту / middleware-контексті. Ніколи не зчитувати повторно з JWT далі по ланцюгу -- використовувати валідоване значення.',
        },
        severity: 'required',
      },
      {
        id: 'ctx-brand-id',
        title: { en: 'brand_id is attached to request context', ua: 'brand_id прикріплений до контексту запиту' },
        desc: {
          en: 'All downstream layers (orchestrator, adapters, wallet) receive brand_id from context, not from raw request.',
          ua: 'Всі наступні шари (оркестратор, адаптери, гаманець) отримують brand_id з контексту, а не з сирого запиту.',
        },
        severity: 'required',
      },
      {
        id: 'ctx-brand-config',
        title: { en: 'Loaded brand config is attached to request context', ua: 'Завантажений конфіг бренду прикріплений до контексту' },
        desc: {
          en: 'Include PSP configs, limits, allowed currencies. Avoids redundant DB lookups in orchestrator.',
          ua: 'Включати PSP конфіги, ліміти, дозволені валюти. Уникає зайвих звернень до БД в оркестраторі.',
        },
        severity: 'recommended',
      },
      {
        id: 'ctx-session-id',
        title: { en: 'session_id is attached to request context', ua: 'session_id прикріплений до контексту запиту' },
        desc: {
          en: 'Used by downstream layers for idempotency key construction and fraud correlation.',
          ua: 'Використовується наступними шарами для побудови ключа ідемпотентності та кореляції фроду.',
        },
        severity: 'recommended',
      },
      {
        id: 'ctx-request-id',
        title: { en: 'request_id is generated and attached', ua: 'request_id згенерований та прикріплений' },
        desc: {
          en: 'Generate a unique request_id (UUID) at the gateway. Pass as X-Request-ID in all outbound calls and include in all error responses. Essential for log tracing.',
          ua: 'Згенерувати унікальний request_id (UUID) на шлюзі. Передавати як X-Request-ID у всіх вихідних викликах та включати у всі відповіді з помилками. Необхідний для трасування логів.',
        },
        severity: 'required',
      },
    ],
  },
  {
    id: 'security',
    title:    { en: 'Security Hardening', ua: 'Посилення безпеки' },
    subtitle: { en: 'Gateway-level protections that do not belong in business logic.', ua: 'Захист на рівні шлюзу, який не належить до бізнес-логіки.' },
    Icon: Shield,
    checks: [
      {
        id: 'sec-https',
        title: { en: 'All requests arrive over HTTPS only', ua: 'Всі запити приходять лише по HTTPS' },
        desc: {
          en: 'Reject plain HTTP. If behind a load balancer, verify X-Forwarded-Proto: https.',
          ua: 'Відхиляти plain HTTP. Якщо за балансувальником навантаження, перевіряти X-Forwarded-Proto: https.',
        },
        errorCode: '403', errorMsg: 'HTTPS_REQUIRED', severity: 'required',
      },
      {
        id: 'sec-content-type',
        title: { en: 'Content-Type is application/json for POST requests', ua: 'Content-Type є application/json для POST-запитів' },
        desc: {
          en: 'Reject requests with incorrect Content-Type to prevent parser confusion attacks.',
          ua: 'Відхиляти запити з некоректним Content-Type для запобігання атакам parser confusion.',
        },
        errorCode: '415', errorMsg: 'UNSUPPORTED_MEDIA_TYPE', severity: 'required',
      },
      {
        id: 'sec-body-size',
        title: { en: 'Request body does not exceed size limit', ua: 'Тіло запиту не перевищує ліміт розміру' },
        desc: {
          en: 'Enforce a body size limit (e.g. 64 KB for payment requests). Prevents memory exhaustion.',
          ua: 'Встановити ліміт розміру тіла (наприклад, 64 КБ для платіжних запитів). Запобігає вичерпанню пам\'яті.',
        },
        errorCode: '413', errorMsg: 'PAYLOAD_TOO_LARGE', severity: 'required',
      },
      {
        id: 'sec-cors',
        title: { en: 'CORS: Origin is in the allowed list', ua: 'CORS: Origin у списку дозволених' },
        desc: {
          en: 'Only origins matching a configured whitelist (brand domains) receive CORS headers. Do not use wildcard (*) for authenticated endpoints.',
          ua: 'Лише origins, що відповідають налаштованому whitelist\'у (домени брендів), отримують CORS-заголовки. Не використовувати wildcard (*) для автентифікованих ендпоінтів.',
        },
        errorCode: '403', errorMsg: 'ORIGIN_NOT_ALLOWED', severity: 'required',
      },
      {
        id: 'sec-log',
        title: { en: 'All auth failures are logged with context', ua: 'Всі auth-помилки логуються з контекстом' },
        desc: {
          en: 'Log: timestamp, IP, user_id (if extractable), brand_id (if resolved), error code, request_id. Never log full JWT or secret.',
          ua: 'Логувати: timestamp, IP, user_id (якщо можна витягти), brand_id (якщо визначено), код помилки, request_id. Ніколи не логувати повний JWT або secret.',
        },
        severity: 'required',
      },
      {
        id: 'sec-no-leak',
        title: { en: 'Error responses do not leak internal details', ua: 'Відповіді з помилками не розкривають внутрішні деталі' },
        desc: {
          en: 'Return only the error code and a human-readable message. Stack traces, DB errors, and internal field names must never appear in responses.',
          ua: 'Повертати лише код помилки та зрозуміле повідомлення. Stack traces, помилки БД та імена внутрішніх полів ніколи не повинні з\'являтись у відповідях.',
        },
        severity: 'required',
      },
    ],
  },
]

const EDGE_CASES: EdgeCase[] = [
  {
    title:    { en: 'Token issued for a different brand', ua: 'Токен виданий для іншого бренду' },
    scenario: { en: 'User authenticates on brand-A, then sends the same JWT to the brand-B payment endpoint.', ua: 'Користувач автентифікується на brand-A, потім надсилає той самий JWT на платіжний ендпоінт brand-B.' },
    expected: { en: 'Reject 403 USER_BRAND_MISMATCH. Brand resolution detects the mismatch between JWT brand_id and the resolved request brand.', ua: 'Відхилити 403 USER_BRAND_MISMATCH. Визначення бренду виявляє невідповідність між brand_id у JWT та визначеним брендом запиту.' },
    severity: 'high',
  },
  {
    title:    { en: 'Token expires mid-session', ua: 'Токен закінчується під час сесії' },
    scenario: { en: 'User opens checkout, JWT expires while they are filling in the form. Payment request arrives with expired token.', ua: 'Користувач відкриває checkout, JWT закінчується поки він заповнює форму. Платіжний запит приходить з простроченим токеном.' },
    expected: { en: 'Reject 401 TOKEN_EXPIRED. Frontend must handle this gracefully -- redirect to re-auth or silently refresh if refresh token is available.', ua: 'Відхилити 401 TOKEN_EXPIRED. Фронтенд повинен обробити це коректно -- перенаправити на повторну авторизацію або тихо оновити токен, якщо є refresh token.' },
    severity: 'high',
  },
  {
    title:    { en: 'Brand exists but has no active PSP', ua: 'Бренд існує, але не має активного PSP' },
    scenario: { en: 'Brand config is present in DB but all PSP configs are disabled (e.g. pending onboarding).', ua: 'Конфіг бренду є в БД, але всі PSP конфіги вимкнені (наприклад, очікується онбординг).' },
    expected: { en: 'Reject 503 NO_PSP_CONFIGURED at gateway. Do not let the request reach the orchestrator.', ua: 'Відхилити 503 NO_PSP_CONFIGURED на шлюзі. Не пропускати запит до оркестратора.' },
    severity: 'high',
  },
  {
    title:    { en: 'Missing X-Brand-ID with no domain mapping', ua: 'Відсутній X-Brand-ID без маппінгу домену' },
    scenario: { en: 'Request comes from an API client (not a browser), no brand_id in JWT, no domain-to-brand mapping exists.', ua: 'Запит приходить від API-клієнта (не браузера), немає brand_id у JWT, відсутній маппінг домену на бренд.' },
    expected: { en: 'Reject 400 UNRESOLVABLE_BRAND. Resolution chain exhausted with no result.', ua: 'Відхилити 400 UNRESOLVABLE_BRAND. Ланцюг визначення бренду вичерпано без результату.' },
    severity: 'high',
  },
  {
    title:    { en: 'JWT replayed after logout', ua: 'JWT повторно використаний після logout' },
    scenario: { en: 'User logs out (jti added to revocation list), but attacker replays the old token.', ua: 'Користувач виходить (jti додається до списку відкликання), але зловмисник повторно відтворює старий токен.' },
    expected: { en: 'Reject 401 TOKEN_REVOKED. Requires jti revocation check against Redis or equivalent fast store.', ua: 'Відхилити 401 TOKEN_REVOKED. Потребує перевірки jti у Redis або аналогічному швидкому сховищі.' },
    severity: 'high',
  },
  {
    title:    { en: 'alg: none attack', ua: 'Атака alg: none' },
    scenario: { en: 'Attacker crafts a JWT with alg: none and no signature, hoping the server skips verification.', ua: 'Зловмисник створює JWT з alg: none та без підпису, розраховуючи що сервер пропустить перевірку.' },
    expected: { en: 'Reject 401 INVALID_TOKEN_ALG. Server only accepts the pre-configured algorithm.', ua: 'Відхилити 401 INVALID_TOKEN_ALG. Сервер приймає лише заздалегідь налаштований алгоритм.' },
    severity: 'high',
  },
  {
    title:    { en: 'Brand suspended mid-session', ua: 'Бренд призупинений під час сесії' },
    scenario: { en: 'Brand is suspended by ops while player has an active session. Player tries to deposit.', ua: 'Бренд призупинений ops-командою поки у гравця є активна сесія. Гравець намагається зробити депозит.' },
    expected: { en: 'Reject 403 BRAND_SUSPENDED. Brand config is re-loaded per request (or cache TTL is short enough to catch this within seconds).', ua: 'Відхилити 403 BRAND_SUSPENDED. Конфіг бренду перезавантажується на кожен запит (або TTL кешу достатньо короткий щоб виявити це за секунди).' },
    severity: 'medium',
  },
  {
    title:    { en: 'Request arrives over HTTP', ua: 'Запит приходить по HTTP' },
    scenario: { en: 'Client (or misconfigured proxy) sends request over plain HTTP.', ua: 'Клієнт (або неправильно налаштований проксі) надсилає запит по plain HTTP.' },
    expected: { en: 'Reject 403 HTTPS_REQUIRED or redirect 301. Never process payment data over HTTP.', ua: 'Відхилити 403 HTTPS_REQUIRED або перенаправити 301. Ніколи не обробляти платіжні дані по HTTP.' },
    severity: 'medium',
  },
]

const ERROR_TABLE: { code: string; key: string; when: I18n }[] = [
  { code: '401', key: 'MISSING_TOKEN',           when: { en: 'No Authorization header',                   ua: 'Відсутній заголовок Authorization'                  } },
  { code: '401', key: 'MALFORMED_TOKEN',          when: { en: 'Token is not a valid JWT string',            ua: 'Токен не є валідним рядком JWT'                     } },
  { code: '401', key: 'INVALID_TOKEN_ALG',        when: { en: 'Algorithm is none or unexpected',            ua: 'Алгоритм none або несподіваний'                     } },
  { code: '401', key: 'INVALID_TOKEN_SIGNATURE',  when: { en: 'Signature does not match',                   ua: 'Підпис не збігається'                               } },
  { code: '401', key: 'TOKEN_EXPIRED',            when: { en: 'exp claim is in the past',                   ua: 'exp claim у минулому'                               } },
  { code: '401', key: 'TOKEN_NOT_YET_VALID',      when: { en: 'nbf claim is in the future',                 ua: 'nbf claim у майбутньому'                            } },
  { code: '401', key: 'INVALID_TOKEN_ISSUER',     when: { en: 'iss does not match expected',                ua: 'iss не відповідає очікуваному'                      } },
  { code: '401', key: 'INVALID_TOKEN_AUDIENCE',   when: { en: 'aud does not include payment service',       ua: 'aud не містить ідентифікатор платіжного сервісу'    } },
  { code: '401', key: 'MISSING_SUBJECT',          when: { en: 'sub claim is absent or empty',               ua: 'sub claim відсутній або порожній'                   } },
  { code: '401', key: 'TOKEN_REVOKED',            when: { en: 'jti found in revocation list',               ua: 'jti знайдено у списку відкликання'                  } },
  { code: '401', key: 'INVALID_USER_ID',          when: { en: 'user_id is empty or invalid',                ua: 'user_id порожній або невалідний'                    } },
  { code: '400', key: 'UNRESOLVABLE_BRAND',       when: { en: 'brand_id cannot be determined',              ua: 'brand_id неможливо визначити'                       } },
  { code: '400', key: 'UNKNOWN_BRAND',            when: { en: 'brand_id not found in DB',                   ua: 'brand_id не знайдено в БД'                          } },
  { code: '403', key: 'BRAND_SUSPENDED',          when: { en: 'Brand status is not active',                 ua: 'Статус бренду не active'                            } },
  { code: '403', key: 'USER_BRAND_MISMATCH',      when: { en: 'User does not belong to resolved brand',     ua: 'Користувач не належить до визначеного бренду'       } },
  { code: '403', key: 'INSUFFICIENT_PERMISSIONS', when: { en: 'User role does not allow payments',          ua: 'Роль користувача не дозволяє платежі'               } },
  { code: '403', key: 'ORIGIN_NOT_ALLOWED',       when: { en: 'CORS origin not in whitelist',               ua: 'CORS origin не у whitelist\'і'                      } },
  { code: '403', key: 'HTTPS_REQUIRED',           when: { en: 'Request arrived over HTTP',                  ua: 'Запит прийшов по HTTP'                              } },
  { code: '413', key: 'PAYLOAD_TOO_LARGE',        when: { en: 'Request body exceeds size limit',            ua: 'Тіло запиту перевищує ліміт розміру'                } },
  { code: '415', key: 'UNSUPPORTED_MEDIA_TYPE',   when: { en: 'Content-Type is not application/json',       ua: 'Content-Type не є application/json'                 } },
  { code: '503', key: 'NO_PSP_CONFIGURED',        when: { en: 'Brand has no active PSP',                    ua: 'У бренду немає активного PSP'                       } },
]

// ─── Components ───────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <Badge variant="outline" className={cn('pointer-events-none shrink-0 text-xs', SEVERITY_STYLE[severity].badge)}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  )
}

function CheckCard({ check, lang }: { check: Check; lang: Lang }) {
  return (
    <div className="flex flex-col gap-2 border border-border bg-card rounded-2xl px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-foreground leading-snug">{check.title[lang]}</p>
        </div>
        <SeverityBadge severity={check.severity} />
      </div>

      {check.desc && (
        <p className="text-sm text-muted-foreground leading-relaxed pl-6">{check.desc[lang]}</p>
      )}

      {(check.errorCode || check.errorMsg) && (
        <div className="flex items-center gap-2 pl-6">
          {check.errorCode && (
            <span className="font-mono text-xs bg-muted rounded px-1.5 py-0.5">{check.errorCode}</span>
          )}
          {check.errorMsg && (
            <span className="font-mono text-xs bg-destructive-bg text-destructive rounded px-1.5 py-0.5">{check.errorMsg}</span>
          )}
        </div>
      )}
    </div>
  )
}

function GroupCard({ group, lang }: { group: Group; lang: Lang }) {
  const { Icon } = group
  const required = group.checks.filter(c => c.severity === 'required').length
  const total    = group.checks.length
  const ua = lang === 'ua'
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-snug">{group.title[lang]}</p>
          {group.subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{group.subtitle[lang]}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {required} {ua ? 'обов\'язкових' : 'required'} · {total} {ua ? 'всього перевірок' : 'total checks'}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {group.checks.map(check => (
          <CheckCard key={check.id} check={check} lang={lang} />
        ))}
      </div>
    </div>
  )
}

function EdgeCaseCard({ ec, lang }: { ec: EdgeCase; lang: Lang }) {
  const severityStyle = {
    high:   { badge: 'bg-destructive-bg text-destructive border-destructive/30', icon: 'text-destructive' },
    medium: { badge: 'bg-warning-bg text-warning border-warning/30',             icon: 'text-warning'     },
  }[ec.severity]
  const ua = lang === 'ua'

  return (
    <div className="border border-border bg-card rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted">
          <AlertTriangle className={cn('size-3.5', severityStyle.icon)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-foreground leading-snug">{ec.title[lang]}</p>
            <Badge variant="outline" className={cn('pointer-events-none shrink-0 text-xs', severityStyle.badge)}>
              {ec.severity.charAt(0).toUpperCase() + ec.severity.slice(1)}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 pl-10">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            {ua ? 'Сценарій' : 'Scenario'}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">{ec.scenario[lang]}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            {ua ? 'Очікувана поведінка' : 'Expected behavior'}
          </p>
          <p className="text-sm text-foreground leading-relaxed">{ec.expected[lang]}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const ua = lang === 'ua'

  const totalChecks    = GROUPS.reduce((s, g) => s + g.checks.length, 0)
  const requiredChecks = GROUPS.reduce((s, g) => s + g.checks.filter(c => c.severity === 'required').length, 0)

  return (
    <DocLayout
      title="Auth & Brand -- Spec"
      breadcrumbLabel="Payment Infrastructure"
      breadcrumbHref="/sandbox/payment-infra"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Повна спека валідацій для шару авторизації та контексту бренду на API Gateway'
        : 'Complete validation specification for the API Gateway auth and brand-context layer'}
      tags={[
        { label: 'Phase 1',     type: 'tag'    },
        { label: 'Spec',        type: 'status' },
        { label: 'API Gateway', type: 'tag'    },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | AUTH & BRAND GATEWAY | SPEC v1 | ALL REQUIRED CHECKS MUST PASS BEFORE PHASE 1 SIGN-OFF"
    >

      {/* ── Scope note ────────────────────────────────────────────────────── */}
      <div className="border border-border bg-card shadow-card rounded-2xl px-4 py-3 mb-8 flex items-start gap-3">
        <Info className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
        <div>
          <p className="text-sm text-foreground leading-relaxed">
            {ua ? (
              <>
                Ця спека охоплює лише <strong>auth middleware API Gateway</strong> -- шар між фронтендом та внутрішнім оркестратором.
                Не охоплює авторизацію PassimPay (це спека Adapter Layer) та флоу реєстрації/входу гравця.
              </>
            ) : (
              <>
                This spec covers the <strong>API Gateway auth middleware only</strong> -- the layer between the frontend and the internal orchestrator.
                It does not cover PassimPay authentication (that belongs to the Adapter Layer spec) or player registration/login flows.
              </>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {requiredChecks} {ua ? 'обов\'язкових перевірок' : 'required checks'} · {totalChecks - requiredChecks} {ua ? 'рекомендованих/опціональних' : 'recommended/optional'} · {totalChecks} {ua ? 'всього' : 'total'}
          </p>
        </div>
      </div>

      {/* ── Section 1: Validation groups ──────────────────────────────────── */}
      <DocSection num="1" title={ua ? 'Чеклист валідацій' : 'Validation Checklist'}>
        <div className="flex flex-col gap-10">
          {GROUPS.map((group, i) => (
            <div key={group.id}>
              {i > 0 && <div className="border-t border-border mb-10" />}
              <GroupCard group={group} lang={lang} />
            </div>
          ))}
        </div>
      </DocSection>

      {/* ── Section 2: Edge cases ──────────────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="2" title={ua ? 'Граничні випадки' : 'Edge Cases'}>
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
            {EDGE_CASES.map((ec, i) => (
              <EdgeCaseCard key={i} ec={ec} lang={lang} />
            ))}
          </div>
        </DocSection>
      </div>

      {/* ── Section 3: Error codes reference ──────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="3" title={ua ? 'Довідник кодів помилок' : 'Error Code Reference'}>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>HTTP</TableHead>
                <TableHead>{ua ? 'Ключ помилки' : 'Error Key'}</TableHead>
                <TableHead>{ua ? 'Коли' : 'When'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              {ERROR_TABLE.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <span className={cn(
                      'font-mono text-xs font-semibold',
                      row.code === '401' ? 'text-warning'          :
                      row.code === '403' ? 'text-destructive'      :
                      row.code === '400' ? 'text-sky-500'          :
                      row.code === '503' ? 'text-orange-500'       :
                      'text-muted-foreground',
                    )}>
                      {row.code}
                    </span>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted rounded px-1.5 py-0.5">{row.key}</code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.when[lang]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </DocSection>
      </div>

    </DocLayout>
  )
}
