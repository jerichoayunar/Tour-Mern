#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

if (process.argv.length < 5) {
  console.error('Usage: node decrypt.cjs <key (min 32 chars)> <input.enc> <output.zip>');
  process.exit(2);
}

const keyInput = process.argv[2];
const inPath = path.resolve(process.argv[3]);
const outPath = path.resolve(process.argv[4]);

if (!fs.existsSync(inPath)) {
  console.error('Input file not found:', inPath);
  process.exit(3);
}

if (!keyInput || keyInput.length < 32) {
  console.error('Encryption key must be at least 32 characters');
  process.exit(4);
}

const key = Buffer.from(keyInput.slice(0, 32), 'utf8');

try {
  const fd = fs.openSync(inPath, 'r');
  const iv = Buffer.alloc(16);
  fs.readSync(fd, iv, 0, 16, 0);
  fs.closeSync(fd);

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const input = fs.createReadStream(inPath, { start: 16 });
  const output = fs.createWriteStream(outPath);
  input.pipe(decipher).pipe(output).on('finish', () => {
    console.log('Decrypted to', outPath);
  }).on('error', (err) => {
    console.error('Decryption failed:', err.message);
    process.exit(5);
  });
} catch (err) {
  console.error('Error during decryption:', err.message);
  process.exit(6);
}
