import {openDB} from 'idb';
import type {ReportDraftValues} from '@/lib/report/schema';

const DB_NAME = 'igel-suedtirol';
const STORE_NAME = 'report-drafts';
const DRAFT_KEY = 'active-report';

export type StoredDraft = {
  values: ReportDraftValues;
  step: number;
  updatedAt: string;
  mediaFiles?: File[];
};

async function getDatabase() {
  return openDB(DB_NAME, 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    }
  });
}

export async function saveDraft(draft: StoredDraft) {
  const db = await getDatabase();
  await db.put(STORE_NAME, draft, DRAFT_KEY);
}

export async function loadDraft(): Promise<StoredDraft | undefined> {
  const db = await getDatabase();
  return db.get(STORE_NAME, DRAFT_KEY);
}

export async function clearDraft() {
  const db = await getDatabase();
  await db.delete(STORE_NAME, DRAFT_KEY);
}
