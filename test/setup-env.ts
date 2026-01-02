import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.resolve(__dirname, '../.env.test');

if (fs.existsSync(envPath)) {
  dotenv.config({
    path: envPath
  });
} else {
  console.log('⚠️ .env.test file not found. Using system environment variables.');
}