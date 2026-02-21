# Pesa-Bridge — M-PESA B2C & C2B (Node.js + TypeScript)

Pesa-Bridge is a minimal **M-PESA (Daraja) integration** built with Node.js, TypeScript, and Vercel Serverless Functions.

It supports:

- ✅ B2C (Business to Customer)
- ✅ C2B (Customer to Business)
- ✅ C2B URL Registration
- ✅ Webhook handling (Result, Timeout, Validation, Confirmation)
- ✅ Security Credential generation script

Designed for personal automation (OpenClaw) and controlled payout systems.

---

## Requirements

- Node.js 18+
- pnpm
- Vercel CLI (installed globally)

```bash
pnpm add -g vercel
vercel --version
```

---

## Project Structure

```
tuma-doo/
├── api/
│   ├── b2c/
│   │   ├── pay.ts
│   │   ├── result.ts
│   │   └── timeout.ts
│   ├── c2b/
│   │   ├── register.ts
│   │   ├── validation.ts
│   │   └── confirmation.ts
│   └── utils/
│       └── mpesa.ts
├── scripts/
│   └── generateCredential.js
├── certs/
│   └── sandbox_cert.cer
├── package.json
├── tsconfig.json
├── vercel.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Abdullahi254/Pesa-Bridge.git
cd tuma-doo
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `MPESA_BASE_URL` | Daraja API base URL (sandbox or production) |
| `MPESA_CONSUMER_KEY` | Consumer key from Safaricom Developer Portal |
| `MPESA_CONSUMER_SECRET` | Consumer secret |
| `MPESA_INITIATOR_NAME` | Initiator username for B2C |
| `MPESA_SECURITY_CREDENTIAL` | Encrypted initiator password (generated below) |
| `MPESA_SHORTCODE` | Organization shortcode |
| `BASE_URL` | Public callback base URL (e.g. ngrok URL) |
| `INITIATOR_PASSWORD` | Plain initiator password (used only for generating credential locally) |

---

## 🔐 Generating `MPESA_SECURITY_CREDENTIAL`

Place the Safaricom certificate inside:

```
certs/sandbox_cert.cer
```

Ensure your `.env` contains:

```env
INITIATOR_PASSWORD=your_initiator_password
```

Run:

```bash
node scripts/generateCredential.js
```

Copy the generated value into:

```env
MPESA_SECURITY_CREDENTIAL=PASTE_GENERATED_VALUE_HERE
```

> After generating, you may remove the certificate and script. Never commit `.env` or credentials.

---

## Run Locally

```bash
vercel dev
```

API available at `http://localhost:3000`

To expose publicly for Daraja callbacks:

```bash
ngrok http 3000
```

Then update `.env`:

```env
BASE_URL=https://your-ngrok-url.ngrok-free.app
```

---

## B2C — Business to Customer

### Initiate a Payment

```bash
curl -X POST http://localhost:3000/api/b2c/pay \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "254712345678",
    "amount": 100,
    "remarks": "Test payout"
  }'
```

**Response:**

```json
{
  "message": "B2C request sent successfully",
  "ConversationID": "AG_XXXX",
  "OriginatorConversationID": "XXXX"
}
```

> ⚠️ This only means the request was accepted by Daraja. The final result will be delivered to `POST /api/b2c/result`. Timeouts go to `POST /api/b2c/timeout`.

### Test Result Callback Manually

**Success:**

```bash
curl -X POST http://localhost:3000/api/b2c/result \
  -H "Content-Type: application/json" \
  -d '{
    "Result": {
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully."
    }
  }'
```

**Failure:**

```bash
curl -X POST http://localhost:3000/api/b2c/result \
  -H "Content-Type: application/json" \
  -d '{
    "Result": {
      "ResultCode": 2001,
      "ResultDesc": "The initiator information is invalid."
    }
  }'
```

---

## C2B — Customer to Business

### Register C2B URLs

```bash
curl -X POST http://localhost:3000/api/c2b/register \
  -H "Content-Type: application/json" \
  -d '{
    "confirmationURL": "https://your-ngrok-url.ngrok-free.app/api/c2b/confirmation",
    "validationURL": "https://your-ngrok-url.ngrok-free.app/api/c2b/validation"
  }'
```

**Response:**

```json
{
  "ConversationID": "AG_XXXX",
  "OriginatorConversationID": "XXXX",
  "ResponseDescription": "Success"
}
```

### Validation Webhook — `POST /api/c2b/validation`

Daraja calls this before accepting a payment. Your endpoint must respond with:

**Accept:**

```json
{ "ResultCode": 0, "ResultDesc": "Accepted" }
```

**Reject:**

```json
{ "ResultCode": 1, "ResultDesc": "Rejected" }
```

**Test manually:**

```bash
curl -X POST http://localhost:3000/api/c2b/validation \
  -H "Content-Type: application/json" \
  -d '{
    "TransID": "TEST123",
    "MSISDN": "254712345678",
    "TransAmount": "100"
  }'
```

### Confirmation Webhook — `POST /api/c2b/confirmation`

Daraja sends final payment details after a successful transaction.

**Test manually:**

```bash
curl -X POST http://localhost:3000/api/c2b/confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "TransID": "TEST123",
    "TransAmount": "100",
    "MSISDN": "254712345678"
  }'
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/b2c/pay` | Initiate a B2C payment |
| `POST` | `/api/b2c/result` | Webhook — B2C payment result |
| `POST` | `/api/b2c/timeout` | Webhook — B2C timeout notification |
| `POST` | `/api/c2b/register` | Register C2B validation & confirmation URLs |
| `POST` | `/api/c2b/validation` | Webhook — C2B payment validation |
| `POST` | `/api/c2b/confirmation` | Webhook — C2B payment confirmation |

---

## Production Notes

- Sandbox and Production credentials are different — do not mix them.
- Production requires the **production certificate** for credential generation.
- All webhook URLs must be **HTTPS**.
- Shortcode must match your registered organization on the Safaricom portal.
- Never commit `.env`, certificates, or credentials.

---

## License

MIT