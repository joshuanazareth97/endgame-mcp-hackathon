import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

/**
 * Loads environment variables from .env file or existing process.env
 * @param customPath Optional custom path to .env file
 */
export function loadEnvironment(customPath?: string): void {
  const envPath = customPath || path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment from ${envPath}`);
    dotenv.config({ path: envPath });
  } else {
    console.warn('No .env file found, using existing environment variables');
    dotenv.config();
  }
}
