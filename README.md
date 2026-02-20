# Pesa-Bridge — M-PESA B2C (Node.js + TypeScript)

A minimal **M-PESA B2C sandbox integration** built with Node.js, TypeScript, and Vercel serverless functions.
Designed for personal use, automation tools (like OpenClaw), or integration into larger systems.

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
│   └── utils/
│       └── mpesa.ts
├── scripts/
│   └── generateCredential.ts   # Generates encrypted M-PESA SecurityCredential
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
git clone https://github.com/Abdullahi254/tuma-doo.git
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

Fill in your credentials:

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

Safaricom requires the initiator password to be encrypted using their public certificate before sending B2C requests. This project includes a helper script to generate it.

### 1. Add the Safaricom Public Certificate

Download the M-PESA public certificate (Sandbox or Production) from the [Safaricom Developer Portal](https://developer.safaricom.co.ke) and place it inside the project folder certs:

```
cert.cer
```

> ⚠️ Never commit the production cert.

### 2. Run the generation script

Ensure your `.env` contains:

```env
INITIATOR_PASSWORD=your_initiator_password
```

Then run:

```bash
pnpm ts-node scripts/generateCredential.ts
```

You will see:

```
Encrypted Security Credential:
XXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Update `.env`

```env
MPESA_SECURITY_CREDENTIAL=PASTE_GENERATED_VALUE_HERE
```

> ⚠️ Never commit `.env` or credentials.

---

## Run Locally

```bash
vercel dev
```

API available at `http://localhost:3000`

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/b2c/pay` | Trigger a B2C payment |
| `POST` | `/api/b2c/result` | Webhook — receives payment result |
| `POST` | `/api/b2c/timeout` | Webhook — receives timeout notification |

---

## Triggering a Payment

```bash
curl -X POST http://localhost:3000/api/b2c/pay \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "254712345678",
    "amount": 100,
    "remarks": "Test payment"
  }'
```

**Expected response:**

```json
{
  "message": "B2C request sent successfully",
  "ConversationID": "AG_20240706_2010364430d9bbdaf872",
  "OriginatorConversationID": "53e3-4aa8-9fe0-8fb5e4092cdd3533373"
}
```

> ⚠️ This only means the request was accepted by Daraja. The final transaction result will be delivered to `/api/b2c/result`.

---

## Testing Webhooks Manually

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

---

## Notes

- Uses **Safaricom Sandbox** by default. To go live, update `MPESA_BASE_URL` and your credentials.
- `BASE_URL` must be publicly accessible for Daraja callbacks. Use [ngrok](https://ngrok.com) during development:

```bash
ngrok http 3000
```

- Sandbox and Production certificates are different — make sure you use the correct one.
- Never commit `.env`, certificates, or credentials.

---

## License

MIT