import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TOTAL_ROWS = 1_000_000;
const OUTPUT_PATH = resolve(__dirname, '../public/transactions.json');

const merchants = [
  'TechCorp', 'Amazon', 'Walmart', 'Apple Store', 'Netflix',
  'Spotify', 'Uber', 'Lyft', 'DoorDash', 'Grubhub',
  'Delta Airlines', 'United Airlines', 'Marriott Hotels', 'Hilton',
  'Shell Gas', 'BP Fuel', 'Whole Foods', 'Trader Joes', 'Target',
  'Best Buy', 'Home Depot', 'Lowes', 'Starbucks', 'McDonalds',
  'PayPal', 'Stripe Payments', 'Square Inc', 'Shopify', 'eBay',
  'Google Play', 'Microsoft Store', 'Adobe Systems', 'Zoom Video',
  'Slack Technologies', 'Dropbox', 'Salesforce', 'Oracle Corp',
  'IBM Global', 'Cisco Systems', 'Intel Corp', 'NVIDIA Corp',
  'Tesla Motors', 'Ford Motor', 'General Motors', 'Toyota USA',
  'Chase Bank', 'Wells Fargo', 'Bank of America', 'Citibank'
];

const categories = [
  'Technology', 'Food & Dining', 'Travel', 'Shopping',
  'Entertainment', 'Healthcare', 'Education', 'Utilities',
  'Transportation', 'Finance', 'Groceries', 'Fuel',
  'Subscriptions', 'Insurance', 'Real Estate'
];

const statuses = ['Completed', 'Pending', 'Failed'];

const descriptions = [
  'Online purchase', 'In-store transaction', 'Recurring subscription',
  'Wire transfer', 'ACH payment', 'Refund processed',
  'Mobile payment', 'Contactless tap', 'Invoice payment',
  'Auto-debit', 'International wire', 'Point of sale',
  'E-commerce checkout', 'Crypto conversion', 'Peer-to-peer transfer'
];

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function randomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
}

function randomChoice(arr) {
  return arr[randomInt(0, arr.length - 1)];
}

console.log(`🚀 Generating ${TOTAL_ROWS.toLocaleString()} transaction records...`);
console.log(`📁 Output: ${OUTPUT_PATH}`);

const startDate = new Date('2020-01-01');
const endDate = new Date('2026-03-01');

// Create public directory if it doesn't exist
mkdirSync(resolve(__dirname, '../public'), { recursive: true });

// Build JSON manually with a stream-like approach for memory efficiency
const CHUNK_SIZE = 10_000;
let fileContent = '[\n';

const startTime = Date.now();

for (let i = 0; i < TOTAL_ROWS; i++) {
  const record = {
    id: i + 1,
    date: randomDate(startDate, endDate),
    merchant: randomChoice(merchants),
    category: randomChoice(categories),
    amount: parseFloat(randomBetween(0.99, 9999.99).toFixed(2)),
    status: randomChoice(statuses),
    description: randomChoice(descriptions)
  };

  fileContent += JSON.stringify(record);

  if (i < TOTAL_ROWS - 1) {
    fileContent += ',\n';
  }

  // Write in chunks to avoid memory overflow
  if ((i + 1) % CHUNK_SIZE === 0 || i === TOTAL_ROWS - 1) {
    if (i === TOTAL_ROWS - 1) {
      fileContent += '\n]';
    }
    writeFileSync(OUTPUT_PATH, fileContent, { flag: i < CHUNK_SIZE ? 'w' : 'a' });
    fileContent = '';

    const progress = (((i + 1) / TOTAL_ROWS) * 100).toFixed(1);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    process.stdout.write(`\r⏳ Progress: ${progress}% (${(i + 1).toLocaleString()} rows) — ${elapsed}s elapsed`);
  }
}

const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
console.log(`\n✅ Done! Generated ${TOTAL_ROWS.toLocaleString()} rows in ${totalTime}s`);
console.log(`📊 File saved to: ${OUTPUT_PATH}`);
