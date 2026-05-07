import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { DeliveryMethod, Item, ItemStatus, Store, Winner } from "./types";

const dataDir = path.join(process.cwd(), "data");
const storePath = path.join(dataDir, "store.json");

const now = () => new Date().toISOString();

const seedStore: Store = {
  items: [
    {
      id: "item-demo-1",
      title: "스트랩과 케이블 세트",
      description: "집에서만 사용한 기타 스트랩 1개와 3m 케이블 1개입니다.",
      condition: "사용감 적음",
      imageUrl: "",
      deliveryMethod: "shipping",
      status: "approved",
      donorContact: "example-donor@example.com",
      createdAt: "2026-05-01T09:00:00.000Z",
      updatedAt: "2026-05-01T09:00:00.000Z"
    },
    {
      id: "item-demo-2",
      title: "입문용 튜너",
      description: "클립형 튜너입니다. 정상 작동 확인했습니다.",
      condition: "정상 작동",
      imageUrl: "",
      deliveryMethod: "direct",
      status: "approved",
      donorContact: "openchat.example/demo",
      createdAt: "2026-05-02T09:00:00.000Z",
      updatedAt: "2026-05-02T09:00:00.000Z"
    }
  ],
  winners: [
    {
      id: "winner-demo-1",
      name: "1등 당첨자",
      rank: 1,
      code: "DEMO-1",
      canSelect: true,
      createdAt: "2026-05-01T10:00:00.000Z",
      updatedAt: "2026-05-01T10:00:00.000Z"
    }
  ]
};

async function ensureStore() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(storePath, "utf8");
  } catch {
    await writeFile(storePath, JSON.stringify(seedStore, null, 2), "utf8");
  }
}

export async function readStore(): Promise<Store> {
  await ensureStore();
  const raw = await readFile(storePath, "utf8");
  return JSON.parse(raw) as Store;
}

async function writeStore(store: Store) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
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

export async function listPublicItems() {
  const store = await readStore();
  return sortItems(
    store.items.filter((item) =>
      ["approved", "selected", "completed"].includes(item.status)
    )
  );
}

export async function listSelectableItems() {
  const store = await readStore();
  return sortItems(store.items.filter((item) => item.status === "approved"));
}

export async function getItem(id: string) {
  const store = await readStore();
  return store.items.find((item) => item.id === id);
}

export async function createItem(input: {
  title: string;
  description: string;
  condition: string;
  imageUrl?: string;
  deliveryMethod: DeliveryMethod;
  donorContact: string;
}) {
  const store = await readStore();
  const timestamp = now();
  const item: Item = {
    id: makeId("item"),
    ...input,
    status: "pending",
    createdAt: timestamp,
    updatedAt: timestamp
  };
  store.items.push(item);
  await writeStore(store);
  return item;
}

export async function updateItemStatus(id: string, status: ItemStatus) {
  const store = await readStore();
  const item = store.items.find((candidate) => candidate.id === id);
  if (!item) return undefined;
  item.status = status;
  item.updatedAt = now();
  if (status === "approved") {
    item.selectedByWinnerId = undefined;
    for (const winner of store.winners) {
      if (winner.selectedItemId === id) winner.selectedItemId = undefined;
    }
  }
  await writeStore(store);
  return item;
}

export async function getWinnerByCode(code: string) {
  const store = await readStore();
  return store.winners.find(
    (winner) => winner.code.toLowerCase() === code.toLowerCase()
  );
}

export async function createWinner(input: {
  name: string;
  rank: number;
  code: string;
  canSelect: boolean;
}) {
  const store = await readStore();
  const timestamp = now();
  const winner: Winner = {
    id: makeId("winner"),
    ...input,
    code: input.code.trim(),
    createdAt: timestamp,
    updatedAt: timestamp
  };
  store.winners.push(winner);
  await writeStore(store);
  return winner;
}

export async function updateWinnerCanSelect(id: string, canSelect: boolean) {
  const store = await readStore();
  const winner = store.winners.find((candidate) => candidate.id === id);
  if (!winner) return undefined;
  winner.canSelect = canSelect;
  winner.updatedAt = now();
  await writeStore(store);
  return winner;
}

export async function selectItemForWinner(code: string, itemId: string) {
  const store = await readStore();
  const winner = store.winners.find(
    (candidate) => candidate.code.toLowerCase() === code.toLowerCase()
  );
  const item = store.items.find((candidate) => candidate.id === itemId);

  if (!winner) throw new Error("유효하지 않은 당첨자 코드입니다.");
  if (!winner.canSelect) throw new Error("현재 선택 권한이 없습니다.");
  if (winner.selectedItemId) throw new Error("이미 상품을 선택했습니다.");
  if (!item || item.status !== "approved") {
    throw new Error("선택할 수 없는 상품입니다.");
  }

  const timestamp = now();
  winner.selectedItemId = item.id;
  winner.updatedAt = timestamp;
  item.status = "selected";
  item.selectedByWinnerId = winner.id;
  item.updatedAt = timestamp;
  await writeStore(store);
  return { winner, item };
}
