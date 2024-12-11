import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class TranscriptionService {
  constructor() {
    this.transcriptionCache = new Map();
  }

  estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  async transcribeChunk(audioChunk) {
    if (this.transcriptionCache.has(audioChunk.id)) {
      return this.transcriptionCache.get(audioChunk.id);
    }

    try {
      const formData = new FormData();
      formData.append('file', audioChunk.blob);
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'json');
      formData.append('timestamp_granularities', ['segment', 'word']);

      const result = await openai.audio.transcriptions.create({
        file: audioChunk.blob,
        model: 'whisper-1',
        response_format: 'verbose_json',
      });
      
      const transcription = {
        text: result.text,
        segments: result.segments,
        words: result.words,
        metadata: {
          chunkId: audioChunk.id,
          startTime: audioChunk.startTime,
          endTime: audioChunk.endTime,
          index: audioChunk.index,
        },
      };

      this.transcriptionCache.set(audioChunk.id, transcription);
      return transcription;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  async mergeTranscripts(transcripts) {
    // Sort transcripts by chunk index
    const sortedTranscripts = transcripts.sort(
      (a, b) => a.metadata.index - b.metadata.index
    );

    // Merge text and adjust timestamps
    const mergedText = sortedTranscripts.map(t => t.text).join(' ');
    
    // Merge segments and adjust timestamps
    const mergedSegments = sortedTranscripts.flatMap(transcript => {
      const timeOffset = transcript.metadata.startTime;
      return transcript.segments.map(segment => ({
        ...segment,
        start: segment.start + timeOffset,
        end: segment.end + timeOffset,
      }));
    });

    // Merge words and adjust timestamps
    const mergedWords = sortedTranscripts.flatMap(transcript => {
      const timeOffset = transcript.metadata.startTime;
      return transcript.words.map(word => ({
        ...word,
        start: word.start + timeOffset,
        end: word.end + timeOffset,
      }));
    });

    return {
      text: mergedText,
      segments: mergedSegments,
      words: mergedWords,
    };
  }

  splitTranscriptForAnalysis(transcript, model = 'gpt-3.5-turbo') {
    const tokenLimits = {
      'gpt-3.5-turbo': 4096,
      'gpt-4': 8192,
      'gpt-4-32k': 32768,
    };

    const maxTokens = tokenLimits[model] || 4096;
    const chunks = [];
    let currentChunk = '';
    let currentTokens = 0;

    const words = transcript.words;
    let currentIndex = 0;

    while (currentIndex < words.length) {
      const word = words[currentIndex];
      const wordTokens = this.estimateTokens(word.text);

      if (currentTokens + wordTokens > maxTokens) {
        // Add chunk with metadata
        chunks.push({
          text: currentChunk,
          startTime: words[0].start,
          endTime: words[currentIndex - 1].end,
          tokenCount: currentTokens,
        });

        // Reset for next chunk
        currentChunk = '';
        currentTokens = 0;
      }

      currentChunk += (currentChunk ? ' ' : '') + word.text;
      currentTokens += wordTokens;
      currentIndex++;
    }

    // Add final chunk
    if (currentChunk) {
      chunks.push({
        text: currentChunk,
        startTime: words[0].start,
        endTime: words[words.length - 1].end,
        tokenCount: currentTokens,
      });
    }

    return chunks;
  }

  clearCache() {
    this.transcriptionCache.clear();
  }
}

export default new TranscriptionService(); 