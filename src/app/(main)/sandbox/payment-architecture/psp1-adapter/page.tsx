'use client'

import { useState } from 'react'
import {
  Zap, Shield, Key, ArrowRight, Code2, AlertTriangle,
  Info, CheckCircle2, Clock, Globe, Repeat2, Lock,
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
        <button key={l} onClick={() => onChange(l)}
          className={['px-2.5 py-1 rounded-md text-xs font-semibold transition-colors',
            lang === l ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >{l.toUpperCase()}</button>
      ))}
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface I18n { en: string; ua: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      {label && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted">
          <Code2 className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        </div>
      )}
      <pre className="bg-card px-4 py-4 overflow-x-auto text-xs leading-relaxed text-foreground font-mono whitespace-pre">
        {code.trim()}
      </pre>
    </div>
  )
}

function InfoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border bg-card shadow-card rounded-2xl px-4 py-3 flex items-start gap-3 mb-6">
      <Info className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
      <div className="text-sm text-foreground leading-relaxed">{children}</div>
    </div>
  )
}

function WarnCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-warning/30 bg-warning-bg rounded-2xl px-4 py-3 flex items-start gap-3 mb-4">
      <AlertTriangle className="size-4 shrink-0 mt-0.5 text-warning" />
      <div className="text-sm text-foreground leading-relaxed">{children}</div>
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

// Section 1 -- Config
const ENV_VARS: { name: string; required: boolean; desc: I18n }[] = [
  { name: 'PASSIMPAY_PLATFORM_ID', required: true,  desc: { en: 'Integer platform ID from account.passimpay.io', ua: 'Цілочисельний ID платформи з account.passimpay.io' } },
  { name: 'PASSIMPAY_API_SECRET',  required: true,  desc: { en: 'API secret key (used for request signing and webhook verification)', ua: 'Секретний API ключ (використовується для підпису запитів та верифікації webhook)' } },
  { name: 'PASSIMPAY_BASE_URL',    required: true,  desc: { en: 'https://api.passimpay.io (no trailing slash)', ua: 'https://api.passimpay.io (без кінцевого слешу)' } },
  { name: 'PASSIMPAY_WEBHOOK_URL', required: true,  desc: { en: 'Your public webhook endpoint, configured in PassimPay platform settings (e.g. https://yourapi.com/webhooks/passimpay)', ua: 'Ваш публічний webhook ендпоінт, налаштований у PassimPay (наприклад, https://yourapi.com/webhooks/passimpay)' } },
  { name: 'PASSIMPAY_SERVER_IP',   required: true,  desc: { en: 'Your server\'s outbound IP -- must be whitelisted in PassimPay platform settings for withdraw to work', ua: 'Вихідний IP вашого сервера -- має бути доданий у whitelist у налаштуваннях PassimPay для роботи виведення' } },
]

// Section 2 -- Signature
const CS_SIGNATURE = `
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

public static class PassimPaySignature
{
    /// Sign a PassimPay API request.
    /// Contract: HMAC-SHA256( platformId + ";" + jsonBody + ";" + secret, secret )
    /// IMPORTANT: PassimPay expects escaped forward slashes (\\/).
    public static string SignRequest(int platformId, object body, string secret)
    {
        var jsonBody = JsonSerializer.Serialize(body).Replace("/", "\\/");
        var contract = $"{platformId};{jsonBody};{secret}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(contract));
        return Convert.ToHexString(hash).ToLower();
    }

    /// Verify an incoming PassimPay webhook.
    /// Same contract -- compare computed signature with x-signature header.
    public static bool VerifyWebhook(
        int platformId,
        string rawBody,       // raw unparsed request body string
        string secret,
        string receivedSignature)
    {
        var contract = $"{platformId};{rawBody};{secret}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var expected = Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(contract))).ToLower();
        return CryptographicOperations.FixedTimeEquals(
            Convert.FromHexString(expected),
            Convert.FromHexString(receivedSignature)
        );
    }
}
`

// Section 3 -- Method mapping
interface MethodMap {
  unified: string
  passimpayEndpoint: string
  httpMethod: 'GET' | 'POST'
  when: I18n
  keyFields: I18n
}

const METHOD_MAP: MethodMap[] = [
  {
    unified: 'initiateDeposit',
    passimpayEndpoint: '/v2/address',
    httpMethod: 'POST',
    when: { en: 'H2H method (btc, eth, usdt_trc20, etc.)', ua: 'H2H метод (btc, eth, usdt_trc20 тощо)' },
    keyFields: { en: 'Send: platformId, paymentId (currency ID), orderId. Receive: address, destinationTag (XRP/TON)', ua: 'Надіслати: platformId, paymentId (ID валюти), orderId. Отримати: address, destinationTag (XRP/TON)' },
  },
  {
    unified: 'initiateDeposit',
    passimpayEndpoint: '/v2/createorder',
    httpMethod: 'POST',
    when: { en: 'Invoice method (fixed amount, redirect flow)', ua: 'Invoice метод (фіксована сума, redirect-флоу)' },
    keyFields: { en: 'Send: platformId, orderId, amount, currencies, returnUrl. Receive: url (redirect player here)', ua: 'Надіслати: platformId, orderId, amount, currencies, returnUrl. Отримати: url (редиректити гравця сюди)' },
  },
  {
    unified: 'initiateWithdrawal',
    passimpayEndpoint: '/v2/withdraw',
    httpMethod: 'POST',
    when: { en: 'All withdrawal requests', ua: 'Всі запити на виведення' },
    keyFields: { en: 'Send: platformId, paymentId, addressTo (address:tag for XRP/TON), amount (in crypto). Receive: transactionId', ua: 'Надіслати: platformId, paymentId, addressTo (address:tag для XRP/TON), amount (у крипті). Отримати: transactionId' },
  },
  {
    unified: 'getTransactionStatus',
    passimpayEndpoint: '/v2/withdrawstatus',
    httpMethod: 'POST',
    when: { en: 'Withdrawal status check (reconciliation)', ua: 'Перевірка статусу виведення (reconciliation)' },
    keyFields: { en: 'Send: platformId, transactionId or orderId. Receive: approve (0/1/2), txhash, amountDebited', ua: 'Надіслати: platformId, transactionId або orderId. Отримати: approve (0/1/2), txhash, amountDebited' },
  },
  {
    unified: 'getTransactionStatus',
    passimpayEndpoint: '/v3/orderstatus',
    httpMethod: 'POST',
    when: { en: 'Invoice deposit status check (reconciliation)', ua: 'Перевірка статусу invoice-депозиту (reconciliation)' },
    keyFields: { en: 'Send: platformId, orderId. Receive: status (paid/wait/error), amountCreditedMerchant, feeService, feeNetwork', ua: 'Надіслати: platformId, orderId. Отримати: status (paid/wait/error), amountCreditedMerchant, feeService, feeNetwork' },
  },
  {
    unified: 'handleWebhook',
    passimpayEndpoint: '-- (incoming)',
    httpMethod: 'POST',
    when: { en: 'PassimPay calls your webhook URL on deposit / withdrawal events', ua: 'PassimPay викликає ваш webhook URL при подіях депозиту / виведення' },
    keyFields: { en: 'Verify x-signature first. Parse type field: "deposit" or "withdraw". Map to UnifiedEvent.', ua: 'Спочатку верифікувати x-signature. Парсити поле type: "deposit" або "withdraw". Маппити у UnifiedEvent.' },
  },
  {
    unified: 'getSupportedMethods',
    passimpayEndpoint: '/v2/currencies',
    httpMethod: 'POST',
    when: { en: 'Fetch available currencies for this platform', ua: 'Отримати доступні валюти для цієї платформи' },
    keyFields: { en: 'Send: platformId. Receive: list[] with id, currency, network, rateUsd, minDep, minWithdraw. Cache up to 5 min.', ua: 'Надіслати: platformId. Отримати: list[] з id, currency, network, rateUsd, minDep, minWithdraw. Кешувати до 5 хв.' },
  },
]

// Section 4 -- Status mapping
interface StatusRow {
  trigger: I18n
  field: string
  value: string
  unified: string
  unifiedColor: string
  unifiedBg: string
  unifiedBorder: string
  note?: I18n
}

const STATUS_MAP: StatusRow[] = [
  {
    trigger:       { en: 'Deposit: /v2/address called', ua: 'Депозит: викликано /v2/address' },
    field: '--', value: '--',
    unified: 'INITIATED', unifiedColor: 'text-slate-400', unifiedBg: 'bg-muted', unifiedBorder: 'border-border',
  },
  {
    trigger:       { en: 'Deposit webhook: confirmations = 1 (UTXO networks)', ua: 'Deposit webhook: confirmations = 1 (UTXO мережі)' },
    field: 'confirmations', value: '1',
    unified: 'PROCESSING', unifiedColor: 'text-warning', unifiedBg: 'bg-warning-bg', unifiedBorder: 'border-warning/30',
    note: { en: 'BTC / LTC / DASH / DOGE / BCH only. Do NOT credit balance yet.', ua: 'Тільки BTC / LTC / DASH / DOGE / BCH. НЕ зараховувати баланс.' },
  },
  {
    trigger:       { en: 'Deposit webhook: confirmations >= 2 (UTXO) OR confirmations = 0 (EVM / TRX / TON)', ua: 'Deposit webhook: confirmations >= 2 (UTXO) АБО confirmations = 0 (EVM / TRX / TON)' },
    field: 'confirmations', value: '≥2 / 0',
    unified: 'COMPLETED', unifiedColor: 'text-success', unifiedBg: 'bg-success-bg', unifiedBorder: 'border-success/30',
    note: { en: 'Credit amountReceive (after fees) to player balance.', ua: 'Зарахувати amountReceive (після комісій) на баланс гравця.' },
  },
  {
    trigger:       { en: 'Invoice webhook: status = "waiting" (partial payment)', ua: 'Invoice webhook: status = "waiting" (часткова оплата)' },
    field: 'status', value: 'waiting',
    unified: 'PENDING_PARTIAL', unifiedColor: 'text-violet-500', unifiedBg: 'bg-violet-500/10', unifiedBorder: 'border-violet-500/30',
    note: { en: 'Invoice method only. Business decision: credit actual or wait.', ua: 'Тільки Invoice метод. Бізнес-рішення: зарахувати фактичну або чекати.' },
  },
  {
    trigger:       { en: 'Invoice webhook: status = "error" (expired or partial fail)', ua: 'Invoice webhook: status = "error" (закінчився або часткова невдача)' },
    field: 'status', value: 'error',
    unified: 'FAILED', unifiedColor: 'text-destructive', unifiedBg: 'bg-destructive-bg', unifiedBorder: 'border-destructive/30',
  },
  {
    trigger:       { en: 'Withdrawal webhook: approve = 0 (processing)', ua: 'Withdrawal webhook: approve = 0 (обробляється)' },
    field: 'approve', value: '0',
    unified: 'PROCESSING', unifiedColor: 'text-warning', unifiedBg: 'bg-warning-bg', unifiedBorder: 'border-warning/30',
  },
  {
    trigger:       { en: 'Withdrawal webhook: approve = 1 (success)', ua: 'Withdrawal webhook: approve = 1 (успіх)' },
    field: 'approve', value: '1',
    unified: 'COMPLETED', unifiedColor: 'text-success', unifiedBg: 'bg-success-bg', unifiedBorder: 'border-success/30',
    note: { en: 'Use amountDebited for final deduction from PSP balance.', ua: 'Використовувати amountDebited для фінального списання з балансу PSP.' },
  },
  {
    trigger:       { en: 'Withdrawal webhook: approve = 2 (error)', ua: 'Withdrawal webhook: approve = 2 (помилка)' },
    field: 'approve', value: '2',
    unified: 'FAILED', unifiedColor: 'text-destructive', unifiedBg: 'bg-destructive-bg', unifiedBorder: 'border-destructive/30',
    note: { en: 'Mandatory balance rollback. Notify player.', ua: 'Обов\'язковий rollback балансу. Повідомити гравця.' },
  },
  {
    trigger:       { en: 'Internal TTL expired -- no webhook received', ua: 'Внутрішній TTL закінчився -- webhook не отримано' },
    field: '--', value: '--',
    unified: 'TIMED_OUT', unifiedColor: 'text-orange-500', unifiedBg: 'bg-orange-500/10', unifiedBorder: 'border-orange-500/30',
    note: { en: 'PassimPay only sends callbacks on success. No callback = timeout. Run reconciliation job.', ua: 'PassimPay надсилає callback тільки при успіху. Немає callback = timeout. Запустити reconciliation job.' },
  },
]

// Section 5 -- Webhook verification code
const CS_WEBHOOK = `
[ApiController]
[Route("webhooks")]
public class PassimPayWebhookController : ControllerBase
{
    private readonly IWebhookEventRepository _events;
    private readonly IPaymentQueue _queue;

    public PassimPayWebhookController(
        IWebhookEventRepository events,
        IPaymentQueue queue)
    {
        _events = events;
        _queue = queue;
    }

    // IMPORTANT: read raw body BEFORE any middleware deserializes it.
    // Do NOT use [FromBody] -- that would parse the body and break signature verification.
    [HttpPost("passimpay")]
    public async Task<IActionResult> HandleWebhook()
    {
        // Step 1 -- read raw body (required for signature verification)
        using var reader = new StreamReader(Request.Body, Encoding.UTF8);
        var rawBody = await reader.ReadToEndAsync();

        var signature = Request.Headers["x-signature"].ToString();
        var platformId = int.Parse(Environment.GetEnvironmentVariable("PASSIMPAY_PLATFORM_ID")!);
        var secret = Environment.GetEnvironmentVariable("PASSIMPAY_API_SECRET")!;

        // Step 2 -- verify signature
        if (!PassimPaySignature.VerifyWebhook(platformId, rawBody, secret, signature))
            return BadRequest(new { error = "INVALID_SIGNATURE" });

        // Step 3 -- parse body
        var payload = JsonSerializer.Deserialize<JsonElement>(rawBody);

        // Step 4 -- idempotency check (orderId or transactionId)
        var idempotencyKey =
            payload.TryGetProperty("orderId", out var orderId) ? orderId.GetString() :
            payload.GetProperty("transactionId").GetString();

        if (await _events.ExistsAsync(idempotencyKey!))
            return Ok(new { ok = true }); // return 200 to stop PSP retries

        // Step 5 -- enqueue for orchestrator (do NOT process inline)
        await _queue.PushAsync(new PassimPayWebhookMessage { RawBody = rawBody });

        // Step 6 -- respond 200 immediately
        // PassimPay retries up to 2 times if 200 is not returned promptly.
        return Ok(new { ok = true });
    }
}
`

// Section 6 -- PassimPay specifics
interface Quirk {
  Icon: typeof Shield
  title: I18n
  severity?: 'high' | 'medium'
  desc: I18n
  action: I18n
}

const QUIRKS: Quirk[] = [
  {
    Icon: ArrowRight,
    title:    { en: 'H2H vs Invoice -- which to use', ua: 'H2H vs Invoice -- який використовувати' },
    desc: {
      en: 'H2H (/v2/address): player pays any amount to a generated address. No redirect. Use for standard crypto deposits where you show the address in your own UI.\n\nInvoice (/v2/createorder): fixed amount, player is redirected to PassimPay-hosted form. Use when you need a fixed amount, on-ramp (fiat), or payment splitting.',
      ua: 'H2H (/v2/address): гравець платить будь-яку суму на згенеровану адресу. Без редиректу. Використовувати для стандартних крипто-депозитів де ви показуєте адресу у власному UI.\n\nInvoice (/v2/createorder): фіксована сума, гравець перенаправляється на форму PassimPay. Використовувати коли потрібна фіксована сума, on-ramp (фіат) або split-оплата.',
    },
    action: { en: 'Use H2H by default. Switch to Invoice only for fixed-amount or fiat flows.', ua: 'Використовувати H2H за замовчуванням. Перемикатись на Invoice лише для фіксованих сум або fiat-флоу.' },
  },
  {
    Icon: Repeat2,
    title:    { en: 'UTXO networks -- two webhooks (BTC / LTC / DASH / DOGE / BCH)', ua: 'UTXO мережі -- два webhooks (BTC / LTC / DASH / DOGE / BCH)' },
    severity: 'high',
    desc: {
      en: 'For Bitcoin, Litecoin, Dash, Dogecoin, and Bitcoin Cash, PassimPay sends two webhook callbacks: first at confirmations=1 (transaction in mempool), second at confirmations=2 (transaction finalized). EVM, TRX, TON send only one webhook (confirmations=0).',
      ua: 'Для Bitcoin, Litecoin, Dash, Dogecoin та Bitcoin Cash PassimPay надсилає два webhook callbacks: перший при confirmations=1 (транзакція у мемпулі), другий при confirmations=2 (транзакція фіналізована). EVM, TRX, TON надсилають лише один webhook (confirmations=0).',
    },
    action: { en: 'Map confirmations=1 → PROCESSING (update UI only). Map confirmations=2 → COMPLETED (credit balance). Never credit on the first webhook.', ua: 'Маппити confirmations=1 → PROCESSING (оновити тільки UI). Маппити confirmations=2 → COMPLETED (зарахувати баланс). Ніколи не зараховувати при першому webhook.' },
  },
  {
    Icon: Lock,
    title:    { en: 'XRP / TON / similar -- mandatory destination tag', ua: 'XRP / TON / подібні -- обов\'язковий destination tag' },
    severity: 'high',
    desc: {
      en: '/v2/address returns a destinationTag field for networks that require it (XRP, TON). If the player sends funds without the tag, PassimPay cannot identify the payment and the funds are effectively lost.',
      ua: '/v2/address повертає поле destinationTag для мереж, які його вимагають (XRP, TON). Якщо гравець надсилає кошти без тегу, PassimPay не може ідентифікувати платіж і кошти фактично втрачаються.',
    },
    action: {
      en: 'Always display destinationTag prominently next to the address with a warning. For /v2/withdraw and /v2/fees with XRP/TON, format addressTo as "address:tag" (colon-separated).',
      ua: 'Завжди відображати destinationTag помітно поруч з адресою з попередженням. Для /v2/withdraw та /v2/fees з XRP/TON форматувати addressTo як "address:tag" (через двокрапку).',
    },
  },
  {
    Icon: Globe,
    title:    { en: 'Amount fields -- which one to use for crediting', ua: 'Поля суми -- яке використовувати для зарахування' },
    severity: 'high',
    desc: {
      en: 'Deposit webhook contains three amount fields: amount (raw crypto received), amountReceive (after PassimPay fees -- this is what lands in your PSP balance), feeService + feeNetwork (deducted fees). Withdrawal webhook contains amountDebited (definitive deduction from your PSP balance).',
      ua: 'Deposit webhook містить три поля суми: amount (сира крипта отримана), amountReceive (після комісій PassimPay -- це те що потрапляє на ваш PSP баланс), feeService + feeNetwork (списані комісії). Withdrawal webhook містить amountDebited (остаточне списання з вашого PSP балансу).',
    },
    action: {
      en: 'For deposit: credit amountReceive (converted to USD) to player balance. For withdrawal: record amountDebited as the final PSP deduction. Always store both amount and amountReceive for audit.',
      ua: 'Для депозиту: зараховувати amountReceive (конвертований у USD) на баланс гравця. Для виведення: записувати amountDebited як фінальне списання з PSP. Завжди зберігати і amount і amountReceive для аудиту.',
    },
  },
  {
    Icon: Key,
    title:    { en: 'Amount in crypto -- USD conversion required', ua: 'Сума у крипті -- необхідна конвертація USD' },
    severity: 'medium',
    desc: {
      en: '/v2/withdraw requires amount in cryptocurrency, not USD. You must convert the player\'s USD withdrawal amount to crypto before calling the endpoint. Use /v2/estimated to get the current rate, or /v2/currencies for the rateUsd field.',
      ua: '/v2/withdraw вимагає суму у криптовалюті, а не в USD. Ви повинні конвертувати суму виведення гравця з USD у крипту перед викликом ендпоінту. Використовувати /v2/estimated для отримання поточного курсу, або /v2/currencies для поля rateUsd.',
    },
    action: {
      en: 'Call /v2/estimated before /v2/withdraw. Store the rate used for audit. Note: rate may shift between estimate and actual execution.',
      ua: 'Викликати /v2/estimated перед /v2/withdraw. Зберігати використаний курс для аудиту. Примітка: курс може змінитись між оцінкою та фактичним виконанням.',
    },
  },
  {
    Icon: Shield,
    title:    { en: 'Duplicate webhook delivery', ua: 'Дублювання webhook доставки' },
    severity: 'high',
    desc: {
      en: 'PassimPay retries webhook delivery up to 2 additional times if your server does not return HTTP 200. This means the same event may arrive 3 times. Without idempotency protection, you could credit a player\'s balance 3 times for one deposit.',
      ua: 'PassimPay повторює доставку webhook до 2 додаткових разів якщо ваш сервер не повертає HTTP 200. Це означає що та сама подія може надійти 3 рази. Без захисту ідемпотентності ви можете зарахувати баланс гравця 3 рази за один депозит.',
    },
    action: {
      en: 'Check orderId (deposits) or transactionId (withdrawals) against a processed-events table before any state change. Return 200 immediately for duplicates.',
      ua: 'Перевіряти orderId (депозити) або transactionId (виведення) у таблиці оброблених подій перед будь-якою зміною стану. Повертати 200 одразу для дублікатів.',
    },
  },
  {
    Icon: AlertTriangle,
    title:    { en: 'orderId constraints', ua: 'Обмеження orderId' },
    severity: 'medium',
    desc: {
      en: 'PassimPay orderId is limited to 64 characters and only allows: A-Za-z0-9+/=-:.,_ -- no spaces, no Unicode. Your internal payment_id (UUID) must be transformed before use.',
      ua: 'orderId PassimPay обмежений 64 символами і допускає лише: A-Za-z0-9+/=-:.,_ -- без пробілів, без Unicode. Ваш внутрішній payment_id (UUID) потрібно трансформувати перед використанням.',
    },
    action: {
      en: 'Strip hyphens from UUID or use Base64URL encoding. Store the mapping payment_id <-> orderId in the transactions table.',
      ua: 'Видалити дефіси з UUID або використати Base64URL-кодування. Зберігати маппінг payment_id <-> orderId у таблиці транзакцій.',
    },
  },
  {
    Icon: Clock,
    title:    { en: 'IP whitelist required for /v2/withdraw', ua: 'Whitelist IP обов\'язковий для /v2/withdraw' },
    severity: 'high',
    desc: {
      en: 'PassimPay blocks withdrawal requests from non-whitelisted IPs. The IP of your server making outbound calls to PassimPay must be added in your platform settings at account.passimpay.io. Exceeding the rate limit (1 req/sec) causes an account block.',
      ua: 'PassimPay блокує запити на виведення з незаліствованих IP. IP вашого сервера, що робить вихідні виклики до PassimPay, повинен бути доданий у налаштуваннях платформи на account.passimpay.io. Перевищення rate limit (1 запит/сек) призводить до блокування акаунту.',
    },
    action: {
      en: 'Add server IP before testing withdrawals. In CI/CD: use a static IP or NAT gateway. Never call /v2/withdraw more than once per second.',
      ua: 'Додати IP сервера перед тестуванням виведення. В CI/CD: використовувати статичний IP або NAT gateway. Ніколи не викликати /v2/withdraw частіше одного разу на секунду.',
    },
  },
]

// Section 7 -- Rate limits
const RATE_LIMITS: { endpoint: string; limit: I18n; risk: I18n }[] = [
  { endpoint: '/v2/address',        limit: { en: '10 req/sec', ua: '10 запитів/сек' }, risk: { en: 'Low',    ua: 'Низький'    } },
  { endpoint: '/v2/createorder',    limit: { en: '10 req/sec', ua: '10 запитів/сек' }, risk: { en: 'Low',    ua: 'Низький'    } },
  { endpoint: '/v2/withdraw',       limit: { en: '1 req/sec -- account blocked if exceeded', ua: '1 запит/сек -- акаунт блокується при перевищенні' }, risk: { en: 'Critical', ua: 'Критичний' } },
  { endpoint: '/v2/withdrawstatus', limit: { en: '10 req/sec', ua: '10 запитів/сек' }, risk: { en: 'Low',    ua: 'Низький'    } },
  { endpoint: '/v2/orderstatus',    limit: { en: '10 req/sec', ua: '10 запитів/сек' }, risk: { en: 'Low',    ua: 'Низький'    } },
  { endpoint: '/v3/orderstatus',    limit: { en: '10 req/sec', ua: '10 запитів/сек' }, risk: { en: 'Low',    ua: 'Низький'    } },
  { endpoint: '/v2/currencies',     limit: { en: '1 req/sec -- cache the result', ua: '1 запит/сек -- кешувати результат' },   risk: { en: 'Medium',  ua: 'Середній'  } },
  { endpoint: '/v2/balance',        limit: { en: '10 req/sec', ua: '10 запитів/сек' }, risk: { en: 'Low',    ua: 'Низький'    } },
  { endpoint: '/v2/estimated',      limit: { en: '1 req/sec',  ua: '1 запит/сек'   }, risk: { en: 'Medium',  ua: 'Середній'  } },
  { endpoint: '/v2/fees',           limit: { en: '1 req/sec',  ua: '1 запит/сек'   }, risk: { en: 'Medium',  ua: 'Середній'  } },
  { endpoint: '/v2/validateaddress',limit: { en: '10 req/sec', ua: '10 запитів/сек' }, risk: { en: 'Low',    ua: 'Низький'    } },
  { endpoint: '/v2/inrout',         limit: { en: '1 req/sec -- account blocked if exceeded', ua: '1 запит/сек -- акаунт блокується при перевищенні' }, risk: { en: 'Critical', ua: 'Критичний' } },
]

// Section 8 -- Checklist
interface CheckItem { text: I18n; severity: 'required' | 'recommended' }

const CHECKLIST: CheckItem[] = [
  { severity: 'required',    text: { en: 'PASSIMPAY_PLATFORM_ID and PASSIMPAY_API_SECRET are set in environment', ua: 'PASSIMPAY_PLATFORM_ID та PASSIMPAY_API_SECRET встановлені в середовищі' } },
  { severity: 'required',    text: { en: 'Server outbound IP is whitelisted in PassimPay platform settings', ua: 'Вихідний IP сервера додано до whitelist у налаштуваннях PassimPay' } },
  { severity: 'required',    text: { en: 'Webhook URL is set in PassimPay platform settings and publicly accessible', ua: 'Webhook URL встановлений у налаштуваннях PassimPay та публічно доступний' } },
  { severity: 'required',    text: { en: 'signRequest() correctly escapes forward slashes in JSON body', ua: 'signRequest() коректно екранує прямі слеші в JSON body' } },
  { severity: 'required',    text: { en: 'verifyWebhook() uses raw (unparsed) body string, not re-serialized JSON', ua: 'verifyWebhook() використовує сирий (нерозпарсений) рядок body, а не повторно серіалізований JSON' } },
  { severity: 'required',    text: { en: 'Webhook route uses express.raw() or equivalent -- NOT express.json()', ua: 'Webhook роут використовує express.raw() або еквівалент -- НЕ express.json()' } },
  { severity: 'required',    text: { en: 'Idempotency check on orderId / transactionId before any state change', ua: 'Перевірка ідемпотентності по orderId / transactionId перед будь-якою зміною стану' } },
  { severity: 'required',    text: { en: 'UTXO networks: balance credited only on confirmations >= 2, not on first webhook', ua: 'UTXO мережі: баланс зараховується тільки при confirmations >= 2, не при першому webhook' } },
  { severity: 'required',    text: { en: 'XRP / TON: destinationTag shown in UI with warning; formatted as address:tag in API calls', ua: 'XRP / TON: destinationTag показано в UI з попередженням; форматується як address:tag у API викликах' } },
  { severity: 'required',    text: { en: 'Deposits: amountReceive (not amount) converted to USD and credited to player', ua: 'Депозити: amountReceive (не amount) конвертується у USD та зараховується гравцю' } },
  { severity: 'required',    text: { en: 'Withdrawals: amount converted from USD to crypto using /v2/estimated before calling /v2/withdraw', ua: 'Виведення: сума конвертується з USD у крипту через /v2/estimated перед викликом /v2/withdraw' } },
  { severity: 'required',    text: { en: 'orderId is max 64 chars and only contains A-Za-z0-9+/=-:.,_ characters', ua: 'orderId максимум 64 символи та містить лише символи A-Za-z0-9+/=-:.,_' } },
  { severity: 'required',    text: { en: '/v2/withdraw is never called more than once per second', ua: '/v2/withdraw ніколи не викликається частіше одного разу на секунду' } },
  { severity: 'required',    text: { en: 'All PSP errors are caught and wrapped in UnifiedPaymentError before propagating', ua: 'Всі помилки PSP перехоплюються та загортаються у UnifiedPaymentError перед поширенням' } },
  { severity: 'required',    text: { en: 'All outbound PassimPay HTTP calls have explicit timeouts (10s for initiate, 5s for status)', ua: 'Всі вихідні HTTP виклики до PassimPay мають явні таймаути (10с для initiate, 5с для status)' } },
  { severity: 'required',    text: { en: 'Withdrawal webhook approve=2: player balance is rolled back and player is notified', ua: 'Withdrawal webhook approve=2: баланс гравця відкочується та гравець повідомляється' } },
  { severity: 'recommended', text: { en: '/v2/currencies response is cached per platformId for up to 5 minutes', ua: 'Відповідь /v2/currencies кешується по platformId до 5 хвилин' } },
  { severity: 'recommended', text: { en: 'psp_payment_id (PassimPay transactionId) is stored in transactions table for reconciliation', ua: 'psp_payment_id (PassimPay transactionId) зберігається в таблиці транзакцій для reconciliation' } },
  { severity: 'recommended', text: { en: 'Exchange rate used for USD -- crypto conversion is stored alongside the transaction for audit', ua: 'Курс обміну, використаний для конвертації USD -- крипта, зберігається разом з транзакцією для аудиту' } },
  { severity: 'recommended', text: { en: 'Reconciliation job calls /v2/withdrawstatus or /v3/orderstatus hourly for PROCESSING transactions', ua: 'Reconciliation job викликає /v2/withdrawstatus або /v3/orderstatus щогодини для PROCESSING транзакцій' } },
]

// ─── Components ───────────────────────────────────────────────────────────────

function QuirkCard({ quirk, lang }: { quirk: Quirk; lang: Lang }) {
  const { Icon } = quirk
  const severityStyle = quirk.severity === 'high'
    ? { badge: 'bg-destructive-bg text-destructive border-destructive/30', icon: 'text-destructive' }
    : quirk.severity === 'medium'
    ? { badge: 'bg-warning-bg text-warning border-warning/30', icon: 'text-warning' }
    : null
  const ua = lang === 'ua'

  return (
    <div className="border border-border bg-card rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Icon className="size-3.5" />
        </div>
        <div className="flex-1 flex items-start justify-between gap-2 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-snug">{quirk.title[lang]}</p>
          {severityStyle && (
            <Badge variant="outline" className={cn('pointer-events-none shrink-0 text-xs', severityStyle.badge)}>
              {quirk.severity === 'high' ? (ua ? 'Критично' : 'High') : (ua ? 'Середнє' : 'Medium')}
            </Badge>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed pl-10 whitespace-pre-line">{quirk.desc[lang]}</p>
      <div className="flex items-baseline gap-2 rounded-xl bg-muted px-3 py-2.5 ml-10">
        <span className="text-xs font-semibold text-foreground shrink-0">{ua ? 'Дія:' : 'Action:'}</span>
        <span className="text-xs text-muted-foreground leading-relaxed">{quirk.action[lang]}</span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en')
  const ua = lang === 'ua'

  return (
    <DocLayout
      title="PSP #1 Adapter -- PassimPay"
      breadcrumbLabel="Payment module"
      breadcrumbHref="/sandbox/payment-architecture"
      parentCrumb={{ label: 'Sandbox', href: '/sandbox' }}
      description={ua
        ? 'Реалізація IPaymentProvider для PassimPay. Повна спека для бекенд-розробника.'
        : 'IPaymentProvider implementation for PassimPay. Full spec for the backend developer.'}
      tags={[
        { label: 'Phase 1',   type: 'tag'    },
        { label: 'Spec',      type: 'status' },
        { label: 'Backend',   type: 'tag'    },
        { label: 'PassimPay', type: 'tag'    },
      ]}
      titleExtra={<LangSwitcher lang={lang} onChange={setLang} />}
      footnote="DEPO44 | PASSIMPAY ADAPTER SPEC v1 | PHASE 1 | VERIFY AGAINST PASSIMPAY DOCS BEFORE IMPLEMENTATION"
    >

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <InfoCard>
        {ua
          ? <><strong>PassimPay</strong> -- перший PSP-адаптер. Цей документ описує конкретну реалізацію інтерфейсу <code className="text-xs bg-muted rounded px-1.5 py-0.5">IPaymentProvider</code> для PassimPay API. Базовий URL: <code className="text-xs bg-muted rounded px-1.5 py-0.5">https://api.passimpay.io</code>. Акаунт: <a href="https://account.passimpay.io" target="_blank" rel="noopener noreferrer" className="underline text-brand">account.passimpay.io</a>.</>
          : <><strong>PassimPay</strong> is the first PSP adapter. This document describes the concrete implementation of the <code className="text-xs bg-muted rounded px-1.5 py-0.5">IPaymentProvider</code> interface for the PassimPay API. Base URL: <code className="text-xs bg-muted rounded px-1.5 py-0.5">https://api.passimpay.io</code>. Account: <a href="https://account.passimpay.io" target="_blank" rel="noopener noreferrer" className="underline text-brand">account.passimpay.io</a>.</>
        }
      </InfoCard>

      {/* ── Section 1: Config ─────────────────────────────────────────────── */}
      <DocSection num="1" title={ua ? 'Конфігурація' : 'Configuration'}>
        <DocTable>
          <DocTableHeader>
            <TableRow>
              <TableHead>{ua ? 'Змінна середовища' : 'Environment Variable'}</TableHead>
              <TableHead>{ua ? 'Обов\'язк.' : 'Required'}</TableHead>
              <TableHead>{ua ? 'Опис' : 'Description'}</TableHead>
            </TableRow>
          </DocTableHeader>
          <TableBody>
            {ENV_VARS.map(v => (
              <TableRow key={v.name}>
                <TableCell><code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">{v.name}</code></TableCell>
                <TableCell>
                  {v.required
                    ? <Badge variant="outline" className="text-xs bg-destructive-bg text-destructive border-destructive/30 pointer-events-none">{ua ? 'Так' : 'Yes'}</Badge>
                    : <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border pointer-events-none">{ua ? 'Ні' : 'No'}</Badge>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{v.desc[lang]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DocTable>
      </DocSection>

      {/* ── Section 2: Signature ──────────────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="2" title={ua ? 'Автентифікація та підпис' : 'Authentication & Signature'}>
          <InfoCard>
            {ua
              ? <>Кожен запит до PassimPay підписується заголовком <code className="text-xs bg-muted rounded px-1.5 py-0.5">x-signature</code>. Контракт: <code className="text-xs bg-muted rounded px-1.5 py-0.5">HMAC-SHA256(platformId + ";" + jsonBody + ";" + secret, secret)</code>. JSON тіло повинно екранувати прямі слеші як <code className="text-xs bg-muted rounded px-1.5 py-0.5">\/</code>.</>
              : <>Every request to PassimPay is signed with the <code className="text-xs bg-muted rounded px-1.5 py-0.5">x-signature</code> header. Contract: <code className="text-xs bg-muted rounded px-1.5 py-0.5">HMAC-SHA256(platformId + ";" + jsonBody + ";" + secret, secret)</code>. The JSON body must escape forward slashes as <code className="text-xs bg-muted rounded px-1.5 py-0.5">\/</code>.</>
            }
          </InfoCard>
          <CodeBlock label="C# -- SignRequest + VerifyWebhook" code={CS_SIGNATURE} />
        </DocSection>
      </div>

      {/* ── Section 3: Method mapping ─────────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="3" title={ua ? 'Маппінг методів інтерфейсу → PassimPay API' : 'Interface Method → PassimPay API Mapping'}>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Метод інтерфейсу' : 'Interface Method'}</TableHead>
                <TableHead>{ua ? 'Ендпоінт PassimPay' : 'PassimPay Endpoint'}</TableHead>
                <TableHead>{ua ? 'Коли' : 'When'}</TableHead>
                <TableHead>{ua ? 'Ключові поля' : 'Key Fields'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              {METHOD_MAP.map((m, i) => (
                <TableRow key={i}>
                  <TableCell><code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">{m.unified}</code></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={cn('pointer-events-none text-xs font-mono font-bold shrink-0',
                        m.httpMethod === 'GET' ? 'bg-sky-500/10 text-sky-500 border-sky-500/30' : 'bg-success-bg text-success border-success/30'
                      )}>{m.httpMethod}</Badge>
                      <code className="text-xs text-foreground font-mono">{m.passimpayEndpoint}</code>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.when[lang]}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.keyFields[lang]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </DocSection>
      </div>

      {/* ── Section 4: Status mapping ─────────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="4" title={ua ? 'Маппінг статусів PassimPay → UnifiedStatus' : 'PassimPay Status → UnifiedStatus Mapping'}>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Подія / Тригер' : 'Event / Trigger'}</TableHead>
                <TableHead>{ua ? 'Поле' : 'Field'}</TableHead>
                <TableHead>{ua ? 'Значення' : 'Value'}</TableHead>
                <TableHead>→ UnifiedStatus</TableHead>
                <TableHead>{ua ? 'Примітка' : 'Note'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              {STATUS_MAP.map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm text-muted-foreground">{s.trigger[lang]}</TableCell>
                  <TableCell><code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">{s.field}</code></TableCell>
                  <TableCell>
                    {s.value !== '--'
                      ? <code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">{s.value}</code>
                      : <span className="text-xs text-muted-foreground">--</span>}
                  </TableCell>
                  <TableCell>
                    <span className={cn('text-xs border rounded px-2 py-0.5 font-mono', s.unifiedColor, s.unifiedBg, s.unifiedBorder)}>
                      {s.unified}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.note?.[lang] ?? '--'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DocTable>
        </DocSection>
      </div>

      {/* ── Section 5: Webhook verification ──────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="5" title={ua ? 'Обробка webhook' : 'Webhook Handling'}>
          <WarnCard>
            {ua
              ? <>Webhook контролер <strong>зобов\'язаний</strong> читати сире (непарсоване) тіло запиту для верифікації підпису. Не використовувати <code className="text-xs bg-muted rounded px-1.5 py-0.5">[FromBody]</code> — ASP.NET Core десеріалізує тіло і підпис не збіжиться. Читати <code className="text-xs bg-muted rounded px-1.5 py-0.5">Request.Body</code> вручну через <code className="text-xs bg-muted rounded px-1.5 py-0.5">StreamReader</code>.</>
              : <>The webhook controller <strong>must</strong> read the raw (unparsed) request body for signature verification. Do not use <code className="text-xs bg-muted rounded px-1.5 py-0.5">[FromBody]</code> — ASP.NET Core will deserialize the body and the signature will not match. Read <code className="text-xs bg-muted rounded px-1.5 py-0.5">Request.Body</code> manually via <code className="text-xs bg-muted rounded px-1.5 py-0.5">StreamReader</code>.</>
            }
          </WarnCard>
          <CodeBlock label="C# -- webhook controller (ASP.NET Core)" code={CS_WEBHOOK} />
        </DocSection>
      </div>

      {/* ── Section 6: PassimPay quirks ───────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="6" title={ua ? 'Особливості PassimPay' : 'PassimPay Specifics'}>
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
            {QUIRKS.map((q, i) => (
              <QuirkCard key={i} quirk={q} lang={lang} />
            ))}
          </div>
        </DocSection>
      </div>

      {/* ── Section 7: Rate limits ────────────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="7" title={ua ? 'Rate Limits' : 'Rate Limits'}>
          <DocTable>
            <DocTableHeader>
              <TableRow>
                <TableHead>{ua ? 'Ендпоінт' : 'Endpoint'}</TableHead>
                <TableHead>{ua ? 'Ліміт' : 'Limit'}</TableHead>
                <TableHead>{ua ? 'Ризик' : 'Risk'}</TableHead>
              </TableRow>
            </DocTableHeader>
            <TableBody>
              {RATE_LIMITS.map((r, i) => {
                const riskStyle =
                  r.risk.en === 'Critical' ? 'text-destructive' :
                  r.risk.en === 'Medium'   ? 'text-warning'     :
                  'text-muted-foreground'
                return (
                  <TableRow key={i}>
                    <TableCell><code className="text-xs bg-muted rounded px-1.5 py-0.5 font-mono">{r.endpoint}</code></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.limit[lang]}</TableCell>
                    <TableCell className={cn('text-sm font-semibold', riskStyle)}>{r.risk[lang]}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </DocTable>
        </DocSection>
      </div>

      {/* ── Section 8: Checklist ──────────────────────────────────────────── */}
      <div className="mt-8">
        <DocSection num="8" title={ua ? 'Чеклист реалізації' : 'Implementation Checklist'}>
          <InfoCard>
            {ua
              ? 'Всі пункти зі статусом Required мають бути виконані до sign-off Phase 1. Перевіряти проти актуальної документації PassimPay перед фінальним деплоєм.'
              : 'All Required items must be complete before Phase 1 sign-off. Verify against the latest PassimPay documentation before final deployment.'}
          </InfoCard>
          <div className="flex flex-col gap-2">
            {CHECKLIST.map((item, i) => {
              const badgeStyle = item.severity === 'required'
                ? 'bg-destructive-bg text-destructive border-destructive/30'
                : 'bg-warning-bg text-warning border-warning/30'
              return (
                <div key={i} className="flex items-start gap-3 border border-border bg-card rounded-2xl px-4 py-3">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-muted-foreground/40" />
                  <p className="text-sm text-foreground leading-snug flex-1">{item.text[lang]}</p>
                  <Badge variant="outline" className={cn('pointer-events-none shrink-0 text-xs', badgeStyle)}>
                    {item.severity === 'required' ? (ua ? 'Обов\'язково' : 'Required') : (ua ? 'Рекомендовано' : 'Recommended')}
                  </Badge>
                </div>
              )
            })}
          </div>
        </DocSection>
      </div>

    </DocLayout>
  )
}
