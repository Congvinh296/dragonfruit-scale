import { db } from './database';

export const saveLot =
  async (
    gardenName: string,
    totalExport: number,
    totalReject: number,
    totalAll: number
  ) => {
    await db.runAsync(
      `
      INSERT INTO lots(
        gardenName,
        totalExport,
        totalReject,
        totalAll,
        status,
        createdAt
      )
      VALUES(?,?,?,?,?,?)
      `,
      [
        gardenName,
        totalExport,
        totalReject,
        totalAll,
        'CLOSED',
        new Date().toISOString(),
      ]
    );
  };

export const loadLots = async () => {
  return await db.getAllAsync(
    'SELECT * FROM lots ORDER BY id DESC'
  );
};