import { openDB } from 'idb';

const DB_NAME = 'audioUploads';
const STORE_NAME = 'chunks';
const DB_VERSION = 1;

export class UploadService {
  constructor() {
    this.db = null;
    this.initDB();
  }

  async initDB() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }

  async saveChunkProgress(chunk, status = 'pending') {
    await this.db.put(STORE_NAME, {
      id: chunk.id,
      index: chunk.index,
      status,
      timestamp: Date.now(),
    });
  }

  async getChunkProgress(chunkId) {
    return await this.db.get(STORE_NAME, chunkId);
  }

  async retryWithBackoff(fn, retries = 3, baseDelay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === retries - 1) throw error;
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async uploadChunk(chunk, onProgress) {
    try {
      await this.saveChunkProgress(chunk, 'uploading');

      const upload = async () => {
        const formData = new FormData();
        formData.append('file', chunk.blob);
        formData.append('metadata', JSON.stringify({
          startTime: chunk.startTime,
          endTime: chunk.endTime,
          index: chunk.index,
        }));

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          onUploadProgress: (progressEvent) => {
            if (onProgress) {
              onProgress({
                chunkId: chunk.id,
                progress: (progressEvent.loaded / progressEvent.total) * 100,
              });
            }
          },
        });

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        return await response.json();
      };

      const result = await this.retryWithBackoff(upload);
      await this.saveChunkProgress(chunk, 'completed');
      return result;
    } catch (error) {
      await this.saveChunkProgress(chunk, 'failed');
      throw error;
    }
  }

  async uploadChunksSequentially(chunks, onProgress) {
    const results = [];
    for (const chunk of chunks) {
      const result = await this.uploadChunk(chunk, onProgress);
      results.push(result);
    }
    return results;
  }

  async getFailedUploads() {
    return await this.db.getAllFromIndex(STORE_NAME, 'status', 'failed');
  }

  async retryFailedUploads(onProgress) {
    const failedUploads = await this.getFailedUploads();
    return await this.uploadChunksSequentially(failedUploads, onProgress);
  }

  async clearUploadHistory() {
    await this.db.clear(STORE_NAME);
  }
}

export default new UploadService(); 