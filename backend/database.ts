import { StoredUser, InterviewRecord } from '../types';

interface Document {
  _id?: string;
  [key: string]: any;
}

const matches = (doc: Document, query: Partial<Document>): boolean => {
  for (const key in query) {
    if (doc[key] !== query[key]) {
      return false;
    }
  }
  return true;
};

const createCollection = <T extends Document>(name: string) => {
  const DB_KEY = `db_${name}`;

  const getAll = (): T[] => {
    try {
      const data = localStorage.getItem(DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error(`Error reading collection ${name}`, e);
      return [];
    }
  };

  const saveAll = (data: T[]): void => {
    localStorage.setItem(DB_KEY, JSON.stringify(data, null, 2));
  };

  return {
    async find(query: Partial<T> = {}): Promise<T[]> {
      const allItems = getAll();
      const results = allItems.filter(item => matches(item, query));
      return Promise.resolve(results);
    },

    async findOne(query: Partial<T>): Promise<T | null> {
      const allItems = getAll();
      const result = allItems.find(item => matches(item, query)) || null;
      return Promise.resolve(result);
    },

    async insertOne(doc: Omit<T, '_id'>): Promise<T> {
      const allItems = getAll();
      const newDoc = { ...doc, _id: crypto.randomUUID() } as T;
      allItems.push(newDoc);
      saveAll(allItems);
      return Promise.resolve(newDoc);
    },
    
    async updateOne(query: Partial<T>, update: { $set: Partial<T> }): Promise<{ matchedCount: number; modifiedCount: number; }> {
        const allItems = getAll();
        let matchedCount = 0;
        let modifiedCount = 0;
        const updatedItems = allItems.map(item => {
            if (matches(item, query) && matchedCount === 0) { // Only update first match
                matchedCount++;
                const updatedItem = { ...item, ...update.$set };
                if (JSON.stringify(item) !== JSON.stringify(updatedItem)) {
                    modifiedCount++;
                }
                return updatedItem;
            }
            return item;
        });

        if (modifiedCount > 0) {
            saveAll(updatedItems);
        }
        return Promise.resolve({ matchedCount, modifiedCount });
    },

    async deleteOne(query: Partial<T>): Promise<{ deletedCount: number }> {
        const allItems = getAll();
        const indexToDelete = allItems.findIndex(item => matches(item, query));
        if (indexToDelete > -1) {
            allItems.splice(indexToDelete, 1);
            saveAll(allItems);
            return Promise.resolve({ deletedCount: 1 });
        }
        return Promise.resolve({ deletedCount: 0 });
    },
    
    async deleteMany(query: Partial<T>): Promise<{ deletedCount: number }> {
        const allItems = getAll();
        const itemsToKeep = allItems.filter(item => !matches(item, query));
        const deletedCount = allItems.length - itemsToKeep.length;

        if (deletedCount > 0) {
            saveAll(itemsToKeep);
        }
        return Promise.resolve({ deletedCount });
    }
  };
};

export const collections = {
  users: createCollection<StoredUser>('users'),
  interviewHistories: createCollection<InterviewRecord & { userEmail: string }>('interviewHistories')
};
