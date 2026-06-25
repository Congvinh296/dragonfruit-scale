// @ts-ignore
import * as SQLite from 'expo-sqlite';

export const db =
  SQLite.openDatabaseSync(
    'dragonfruit.db'
  );

export const initDatabase =
  async () => {

    await db.execAsync(`
  CREATE TABLE IF NOT EXISTS lots(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gardenName TEXT,
    totalExport REAL,
    totalReject REAL,
    totalAll REAL,
    status TEXT,
    createdAt TEXT
  );
`);

await db.execAsync(`
  CREATE TABLE IF NOT EXISTS weights(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gardenName TEXT,
    kg REAL,
    type TEXT,
    createdAt TEXT
  );
`);
await db.execAsync(`
CREATE TABLE IF NOT EXISTS lot_payments(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lotId INTEGER,
  lossPerTon REAL,
  lossKg REAL,
  remainKg REAL,
  pricePerKg REAL,
  totalMoney REAL,
  createdAt TEXT
);
`);

  
  };