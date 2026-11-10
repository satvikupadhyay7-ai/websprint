const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const envPath = path.join(__dirname, '..', '.env');
const configured = key => Boolean(String(process.env[key] || '').trim());
const sender = String(process.env.FROM_EMAIL || '');
const recipient = String(process.env.TO_EMAIL || '');
const senderEmail = sender.match(/<([^>]+)>/)?.[1] || sender.trim();
const plausibleEmail = text => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
const report = (label, ok) => console.log(`${ok ? '✓' : '✗'} ${label}`);

console.log('WebSprint configuration check (secret values are never displayed)');
report('.env exists', fs.existsSync(envPath));
report('Resend API key present', configured('RESEND_API_KEY'));
report('Sender address valid', plausibleEmail(senderEmail));
report('Developer recipient valid', plausibleEmail(recipient));
report('OpenAI API key present (optional)', configured('OPENAI_API_KEY'));
if (senderEmail.toLowerCase() === 'onboarding@resend.dev') {
  console.log('! Resend test sender: outbound email is restricted. Verify your domain and use its sender address before sending to customers.');
}
console.log('! Keys pasted into a chat or public location must be revoked and replaced.');
const required = configured('RESEND_API_KEY') && plausibleEmail(senderEmail) && plausibleEmail(recipient);
if (!required) process.exitCode = 1;
