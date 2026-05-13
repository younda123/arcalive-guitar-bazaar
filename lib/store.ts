import { mkdirSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import type { DeliveryMethod, Item, ItemStatus, Store, Winner } from "./types";

type DbItem = {
  id: string;
  title: string;
  description: string;
  condition: string;
  imageUrl: string | null;
  deliveryMethod: string;
  status: string;
  donorContact: string;
  selectedByWinnerId: string | null;
  createdAt: string;
  updatedAt: string;
};

type DbWinner = {
  id: string;
  name: string;
  rank: number;
  code: string;
  canSelect: number;
  selectedItemId: string | null;
  createdAt: string;
  updatedAt: string;
};

const dbPath = path.resolve(process.cwd(), process.env.DATABASE_PATH ?? "data/bazaar.db");
const now = () => new Date().toISOString();

let db: DatabaseSync | undefined;
let initialized = false;

function getDb() {
  if (!db) {
    mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new DatabaseSync(dbPath);
    db.exec("PRAGMA busy_timeout = 5000");
    db.exec("PRAGMA foreign_keys = ON");
  }

  if (!initialized) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        condition TEXT NOT NULL,
        imageUrl TEXT,
        deliveryMethod TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        donorContact TEXT NOT NULL,
        selectedByWinnerId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS winners (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        rank INTEGER NOT NULL,
        code TEXT NOT NULL UNIQUE,
        canSelect INTEGER NOT NULL DEFAULT 1,
        selectedItemId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
    seedData(db);
    initialized = true;
  }

  return db;
}

function seedData(database: DatabaseSync) {
  const itemCount = database.prepare("SELECT COUNT(*) as count FROM items").get() as {
    count: number;
  };
  const winnerCount = database.prepare("SELECT COUNT(*) as count FROM winners").get() as {
    count: number;
  };

  if (itemCount.count === 0) {
    const insertItem = database.prepare(`
      INSERT INTO items (
        id, title, description, condition, imageUrl, deliveryMethod, status,
        donorContact, selectedByWinnerId, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertItem.run(
      "item-demo-1",
      "스트랩과 케이블 세트",
      "집에서만 사용한 기타 스트랩 1개와 3m 케이블 1개입니다.",
      "사용감 적음",
      null,
      "shipping",
      "approved",
      "example-donor@example.com",
      null,
      "2026-05-01T09:00:00.000Z",
      "2026-05-01T09:00:00.000Z"
    );
    insertItem.run(
      "item-demo-2",
      "입문용 튜너",
      "클립형 튜너입니다. 정상 작동 확인했습니다.",
      "정상 작동",
      null,
      "direct",
      "approved",
      "openchat.example/demo",
      null,
      "2026-05-02T09:00:00.000Z",
      "2026-05-02T09:00:00.000Z"
    );
  }

  if (winnerCount.count === 0) {
    database.prepare(`
      INSERT INTO winners (
        id, name, rank, code, canSelect, selectedItemId, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "winner-demo-1",
      "1등 당첨자",
      1,
      "DEMO-1",
      1,
      null,
      "2026-05-01T10:00:00.000Z",
      "2026-05-01T10:00:00.000Z"
    );
  }
}

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function toItem(item: DbItem): Item {
  return {
    ...item,
    imageUrl: item.imageUrl ?? undefined,
    deliveryMethod: item.deliveryMethod as DeliveryMethod,
    status: item.status as ItemStatus,
    selectedByWinnerId: item.selectedByWinnerId ?? undefined
  };
}

function toWinner(winner: DbWinner): Winner {
  return {
    ...winner,
    canSelect: Boolean(winner.canSelect),
    selectedItemId: winner.selectedItemId ?? undefined
  };
}

function allItems() {
  return getDb().prepare("SELECT * FROM items").all() as DbItem[];
}

const publicOrder: Record<ItemStatus, number> = {
  approved: 0,
  selected: 1,
  completed: 2,
  pending: 3,
  hidden: 4,
  deleted: 5
};

export function sortItems(items: Item[]) {
  return [...items].sort((a, b) => {
    const statusDiff = publicOrder[a.status] - publicOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export async function readStore(): Promise<Store> {
  const database = getDb();
  const winners = database
    .prepare("SELECT * FROM winners ORDER BY rank ASC, createdAt ASC")
    .all() as DbWinner[];

  return {
    items: allItems().map(toItem),
    winners: winners.map(toWinner)
  };
}

export async function listPublicItems() {
  const items = getDb()
    .prepare(
      "SELECT * FROM items WHERE status IN ('approved', 'selected', 'completed')"
    )
    .all() as DbItem[];

  return sortItems(items.map(toItem));
}

export async function listSelectableItems() {
  const items = getDb()
    .prepare("SELECT * FROM items WHERE status = 'approved' ORDER BY createdAt ASC")
    .all() as DbItem[];

  return sortItems(items.map(toItem));
}

export async function getItem(id: string) {
  const item = getDb().prepare("SELECT * FROM items WHERE id = ?").get(id) as
    | DbItem
    | undefined;

  return item ? toItem(item) : undefined;
}

export async function createItem(input: {
  title: string;
  description: string;
  condition: string;
  imageUrl?: string;
  deliveryMethod: DeliveryMethod;
  donorContact: string;
}) {
  const timestamp = now();
  const item: DbItem = {
    id: makeId("item"),
    ...input,
    imageUrl: input.imageUrl || null,
    status: "pending",
    selectedByWinnerId: null,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  getDb().prepare(`
    INSERT INTO items (
      id, title, description, condition, imageUrl, deliveryMethod, status,
      donorContact, selectedByWinnerId, createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    item.id,
    item.title,
    item.description,
    item.condition,
    item.imageUrl,
    item.deliveryMethod,
    item.status,
    item.donorContact,
    item.selectedByWinnerId,
    item.createdAt,
    item.updatedAt
  );

  return toItem(item);
}

export async function updateItemStatus(id: string, status: ItemStatus) {
  const timestamp = now();

  if (status === "approved") {
    getDb().prepare("UPDATE winners SET selectedItemId = NULL, updatedAt = ? WHERE selectedItemId = ?").run(
      timestamp,
      id
    );
    getDb().prepare(
      "UPDATE items SET status = ?, selectedByWinnerId = NULL, updatedAt = ? WHERE id = ?"
    ).run(status, timestamp, id);
  } else {
    getDb().prepare("UPDATE items SET status = ?, updatedAt = ? WHERE id = ?").run(
      status,
      timestamp,
      id
    );
  }

  return getItem(id);
}

export async function updateItem(input: {
  id: string;
  title: string;
  description: string;
  condition: string;
  deliveryMethod: DeliveryMethod;
  donorContact: string;
}) {
  getDb().prepare(`
    UPDATE items
    SET title = ?,
        description = ?,
        condition = ?,
        deliveryMethod = ?,
        donorContact = ?,
        updatedAt = ?
    WHERE id = ?
  `).run(
    input.title,
    input.description,
    input.condition,
    input.deliveryMethod,
    input.donorContact,
    now(),
    input.id
  );

  return getItem(input.id);
}

export async function getWinnerByCode(code: string) {
  const winner = getDb()
    .prepare("SELECT * FROM winners WHERE lower(code) = lower(?)")
    .get(code) as DbWinner | undefined;

  return winner ? toWinner(winner) : undefined;
}

export async function createWinner(input: {
  name: string;
  rank: number;
  code: string;
  canSelect: boolean;
}) {
  const timestamp = now();
  const winner: DbWinner = {
    id: makeId("winner"),
    name: input.name,
    rank: input.rank,
    code: input.code.trim(),
    canSelect: input.canSelect ? 1 : 0,
    selectedItemId: null,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  getDb().prepare(`
    INSERT INTO winners (
      id, name, rank, code, canSelect, selectedItemId, createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    winner.id,
    winner.name,
    winner.rank,
    winner.code,
    winner.canSelect,
    winner.selectedItemId,
    winner.createdAt,
    winner.updatedAt
  );

  return toWinner(winner);
}

export async function updateWinnerCanSelect(id: string, canSelect: boolean) {
  getDb().prepare("UPDATE winners SET canSelect = ?, updatedAt = ? WHERE id = ?").run(
    canSelect ? 1 : 0,
    now(),
    id
  );

  const winner = getDb().prepare("SELECT * FROM winners WHERE id = ?").get(id) as
    | DbWinner
    | undefined;

  return winner ? toWinner(winner) : undefined;
}

export async function updateWinner(input: {
  id: string;
  name: string;
  rank: number;
  code: string;
  canSelect: boolean;
}) {
  getDb().prepare(`
    UPDATE winners
    SET name = ?,
        rank = ?,
        code = ?,
        canSelect = ?,
        updatedAt = ?
    WHERE id = ?
  `).run(
    input.name,
    input.rank,
    input.code.trim(),
    input.canSelect ? 1 : 0,
    now(),
    input.id
  );

  const winner = getDb().prepare("SELECT * FROM winners WHERE id = ?").get(input.id) as
    | DbWinner
    | undefined;

  return winner ? toWinner(winner) : undefined;
}

export async function deleteWinner(id: string) {
  const database = getDb();
  database.exec("BEGIN IMMEDIATE");
  try {
    database.prepare(
      "UPDATE items SET status = 'approved', selectedByWinnerId = NULL, updatedAt = ? WHERE selectedByWinnerId = ?"
    ).run(now(), id);
    database.prepare("DELETE FROM winners WHERE id = ?").run(id);
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export async function selectItemForWinner(code: string, itemId: string) {
  const database = getDb();
  database.exec("BEGIN IMMEDIATE");
  try {
    const winner = database
      .prepare("SELECT * FROM winners WHERE lower(code) = lower(?)")
      .get(code) as DbWinner | undefined;
    const item = database.prepare("SELECT * FROM items WHERE id = ?").get(itemId) as
      | DbItem
      | undefined;

    if (!winner) throw new Error("유효하지 않은 당첨자 코드입니다.");
    if (!winner.canSelect) throw new Error("현재 선택 권한이 없습니다.");
    if (winner.selectedItemId) throw new Error("이미 상품을 선택했습니다.");
    if (!item || item.status !== "approved") {
      throw new Error("선택할 수 없는 상품입니다.");
    }

    const timestamp = now();
    database.prepare("UPDATE winners SET selectedItemId = ?, updatedAt = ? WHERE id = ?").run(
      item.id,
      timestamp,
      winner.id
    );
    database.prepare(
      "UPDATE items SET status = 'selected', selectedByWinnerId = ?, updatedAt = ? WHERE id = ?"
    ).run(winner.id, timestamp, item.id);

    const updatedWinner = database
      .prepare("SELECT * FROM winners WHERE id = ?")
      .get(winner.id) as DbWinner;
    const updatedItem = database
      .prepare("SELECT * FROM items WHERE id = ?")
      .get(item.id) as DbItem;

    database.exec("COMMIT");

    return {
      winner: toWinner(updatedWinner),
      item: toItem(updatedItem)
    };
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
