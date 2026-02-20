import fs from "fs";
import crypto from "crypto";
import "dotenv/config";


// Load certificate
// for Production, use the production certificate and for sandbox, use the sandbox certificate
const certificate = fs.readFileSync("./certs/SandboxCertificate.cer");

// Get password from env
const password = process.env.INITIATOR_PASSWORD;

if (!password) {
  throw new Error("INITIATOR_PASSWORD not found in .env");
}

// Encrypt
const encrypted = crypto.publicEncrypt(
  {
    key: certificate,
    padding: crypto.constants.RSA_PKCS1_PADDING,
  },
  Buffer.from(password)
);

const securityCredential = encrypted.toString("base64");

console.log("\nMPESA_SECURITY_CREDENTIAL\n");
console.log(securityCredential);