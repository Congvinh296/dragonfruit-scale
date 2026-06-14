import { db } from './database';

export const saveLot = async (
  gardenName: string,
  totalExport: number,
  totalReject: number,
  totalAll: number,
  status: 'OPEN' | 'CLOSED' = 'OPEN'
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
      status,
      new Date().toISOString(),
    ]
  );
};

export const updateLot = async (
  gardenName: string,
  totalExport: number,
  totalReject: number,
  totalAll: number,
  status: 'OPEN' | 'CLOSED'
) => {
  await db.runAsync(
    `
    UPDATE lots
    SET
      totalExport = ?,
      totalReject = ?,
      totalAll = ?,
      status = ?
    WHERE gardenName = ?
    `,
    [
      totalExport,
      totalReject,
      totalAll,
      status,
      gardenName,
    ]
  );
};

export const loadLots = async () => {
  return await db.getAllAsync(
    `
    SELECT *
    FROM lots
    ORDER BY id DESC
    `
  );
};

export const getLotByGarden = async (
  gardenName: string
) => {
  return await db.getFirstAsync(
    `
    SELECT *
    FROM lots
    WHERE gardenName = ?
    `,
    [gardenName]
  );
};