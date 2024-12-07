import OpenAI from 'openai';

// Test mode from environment variable
const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true';

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Mock response generator for test mode
const generateMockResponse = () => {
  const sessionTypes = ['Practice', 'Game', 'Scrimmage', 'Training'];
  const skills = ['Ball Handling', 'Shooting', 'Defense', 'Passing', 'Court Vision', 'Speed', 'Agility'];
  const improvements = ['Consistency', 'Left Hand', 'Three-Point Range', 'Free Throws', 'Help Defense'];
  const names = ['John', 'Michael', 'Sarah', 'David', 'Emma'];
  
  const generatePlayer = () => {
    const randomSkills = skills.sort(() => 0.5 - Math.random()).slice(0, 3);
    const randomImprovements = improvements.sort(() => 0.5 - Math.random()).slice(0, 2);
    const name = names[Math.floor(Math.random() * names.length)];
    
    return {
      name: name,
      skills_demonstrated: randomSkills,
      areas_for_improvement: randomImprovements,
      observations: [
        `${name} showed good effort in practice`,
        `${name} needs to work on consistency`
      ]
    };
  };

  const numPlayers = Math.floor(Math.random() * 3) + 2; // 2-4 players
  const players = Array(numPlayers).fill(null).map(generatePlayer);
  
  return {
    transcript: `[Test Mode] Voice recording captured at ${new Date().toLocaleTimeString()}.`,
    analysis: {
      session_type: sessionTypes[Math.floor(Math.random() * sessionTypes.length)],
      session_summary: "Test session with multiple players.",
      players: players,
      team_feedback: {
        strengths: ["Team communication", "Fast break execution"],
        improvements: ["Half-court offense", "Defensive rotation"],
        chemistry: "Good overall team chemistry"
      },
      key_takeaways: [
        "Multiple players showing improvement",
        "Team concepts are developing well",
        "Individual skills need continued focus"
      ]
    }
  };
};

// Helper function to handle API errors
const handleAPIError = (error) => {
  console.error('API Error:', error);
  if (error.status === 429) {
    throw new Error('API rate limit exceeded. Please try again later.');
  } else if (error.status === 401) {
    throw new Error('Invalid API key. Please check your configuration.');
  } else {
    throw new Error(error.message || 'An error occurred while processing your request.');
  }
};

// Simulate network delay for test mode
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 1500));

export const analyzeFeedback = async (audioBlob) => {
  try {
    if (!audioBlob) {
      throw new Error('No audio recording provided.');
    }

    if (TEST_MODE) {
      await mockDelay();
      return generateMockResponse();
    }

    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured. Please check your .env file.');
    }

    // Step 1: Transcribe audio using Whisper API
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'text');

    const transcriptionResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: formData
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`Transcription failed: ${transcriptionResponse.statusText}`);
    }

    const transcript = await transcriptionResponse.text();

    if (!transcript.trim()) {
      throw new Error('No speech detected in the recording.');
    }

    // Step 2: Analyze transcript using GPT-4 Turbo
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: `You are a basketball analysis expert. Analyze the following session feedback and extract information about all players mentioned. 
Return ONLY a JSON object with the following structure, no additional text:
{
  "session_type": "string (Practice/Game/Training)",
  "session_summary": "string",
  "players": [
    {
      "name": "string",
      "skills_demonstrated": ["string"],
      "areas_for_improvement": ["string"],
      "observations": ["string"]
    }
  ],
  "team_feedback": {
    "strengths": ["string"],
    "improvements": ["string"],
    "chemistry": "string"
  },
  "key_takeaways": ["string"]
}`
        },
        {
          role: 'user',
          content: transcript
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500
    });

    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('Failed to analyze the feedback. Please try again.');
    }

    const analysis = JSON.parse(completion.choices[0].message.content);

    return {
      transcript,
      analysis
    };
  } catch (error) {
    handleAPIError(error);
  }
}; 