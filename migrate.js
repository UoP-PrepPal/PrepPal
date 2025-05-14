import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Required to resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
  const db = await open({
    filename: path.resolve(__dirname, 'db', 'database.sqlite'), // Make sure this matches your DB location
    driver: sqlite3.Database,
  });

  try {
    await db.exec(`ALTER TABLE recipes ADD COLUMN difficulty TEXT;`);
    console.log('✅ Migration complete: "difficulty" column added to recipes.');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('⚠️ Column "difficulty" already exists.');
    } else {
      console.error('❌ Migration failed:', error.message);
    }
  }
};

runMigration();