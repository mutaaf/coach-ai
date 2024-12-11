import { v4 as uuidv4 } from 'uuid';

// Constants for audio constraints
export const CHUNK_DURATION_MS = 25 * 60 * 1000; // 25 minutes in milliseconds
export const MAX_CHUNK_SIZE_BYTES = 25 * 1024 * 1024; // 25MB in bytes
export const AUDIO_CONFIG = {
  mimeType: 'audio/webm',
  audioBitsPerSecond: 128000, // 128 kbps
};

class AudioChunk {
  constructor(blob, startTime, endTime, index) {
    this.id = uuidv4();
    this.blob = blob;
    this.startTime = startTime;
    this.endTime = endTime;
    this.index = index;
    this.size = blob.size;
  }
}

export class AudioRecordingService {
  constructor() {
    this.mediaRecorder = null;
    this.chunks = [];
    this.currentChunkStartTime = 0;
    this.chunkIndex = 0;
    this.worker = null;
    this.currentChunk = [];
    this.chunkStartTime = Date.now();
    this.onChunkReady = null;
    this.initializeWorker();
  }

  initializeWorker() {
    const workerCode = `
      self.onmessage = async (e) => {
        const { chunk, config } = e.data;
        try {
          // Process audio chunk in background
          const processedChunk = await self.processAudioChunk(chunk, config);
          self.postMessage({ type: 'success', chunk: processedChunk });
        } catch (error) {
          self.postMessage({ type: 'error', error: error.message });
        }
      };

      self.processAudioChunk = async (chunk, config) => {
        // Implement audio processing logic here
        return chunk;
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));
  }

  async startRecording(onChunkReady) {
    try {
      this.onChunkReady = onChunkReady;
      this.currentChunk = [];
      this.chunkStartTime = Date.now();
      this.chunkIndex = 0;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, AUDIO_CONFIG);
      
      this.mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          this.currentChunk.push(event.data);
          
          // Check if current chunk duration exceeds limit
          const currentDuration = Date.now() - this.chunkStartTime;
          if (currentDuration >= CHUNK_DURATION_MS) {
            await this.processCurrentChunk();
          }
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  async processCurrentChunk() {
    if (this.currentChunk.length === 0) return;

    const blob = new Blob(this.currentChunk, { type: AUDIO_CONFIG.mimeType });
    const audioChunk = new AudioChunk(
      blob,
      this.chunkStartTime,
      Date.now(),
      this.chunkIndex++
    );

    // Process chunk in web worker
    this.worker.postMessage({
      chunk: audioChunk,
      config: AUDIO_CONFIG
    });

    // Reset for next chunk
    this.currentChunk = [];
    this.chunkStartTime = Date.now();
    
    if (this.onChunkReady) {
      this.onChunkReady(audioChunk);
    }
  }

  async stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      return new Promise((resolve) => {
        this.mediaRecorder.onstop = async () => {
          // Process the final chunk
          await this.processCurrentChunk();
          
          const tracks = this.mediaRecorder.stream.getTracks();
          tracks.forEach(track => track.stop());
          
          // Clean up
          this.currentChunk = [];
          this.onChunkReady = null;
          
          resolve();
        };
        this.mediaRecorder.stop();
      });
    }
  }

  async compressAudioChunk(chunk) {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (e) => {
        if (e.data.type === 'success') {
          resolve(e.data.chunk);
        } else {
          reject(new Error(e.data.error));
        }
      };

      this.worker.postMessage({
        chunk,
        config: AUDIO_CONFIG
      });
    });
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.currentChunk = [];
    this.onChunkReady = null;
  }
}

export default new AudioRecordingService(); 