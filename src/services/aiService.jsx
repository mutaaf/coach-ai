import OpenAI from 'openai';

// Test mode flag
const TEST_MODE = true; // Set to false for production

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Mock responses for test mode
const MOCK_RESPONSES = {
  transcript: `During today's practice session, John Smith showed excellent ball handling skills. 
His crossover dribble has improved significantly, and he managed to consistently break through defensive pressure. 
Mike Johnson's defensive positioning was outstanding, particularly in pick-and-roll situations. 
The team's overall chemistry in transition plays was notable, though we need to work on spacing in half-court sets.`,

  analysis: {
    session_type: "Practice",
    session_summary: "Focused training session with emphasis on individual skills and team dynamics",
    players: [
      {
        name: "John Smith",
        observations: [
          "Excellent ball handling skills",
          "Improved crossover dribble",
          "Good at breaking through defense"
        ],
        skills: [
          "Ball handling",
          "Dribbling",
          "Offensive pressure"
        ],
        improvements: [
          "Three-point shooting consistency",
          "Left-hand finishing"
        ],
        highlights: [
          "Successfully executed multiple crossover moves",
          "Led fast break opportunities"
        ]
      },
      {
        name: "Mike Johnson",
        observations: [
          "Outstanding defensive positioning",
          "Strong pick-and-roll defense",
          "Good communication on switches"
        ],
        skills: [
          "Defensive IQ",
          "Pick-and-roll defense",
          "Team communication"
        ],
        improvements: [
          "Offensive rebounding",
          "Post moves variety"
        ],
        highlights: [
          "Multiple defensive stops in pick-and-roll",
          "Excellent help defense rotations"
        ]
      }
    ],
    team_analysis: {
      performance: "Strong showing in transition plays with room for improvement in half-court execution",
      chemistry: "Good communication and understanding between players, particularly on defense",
      offense: "Effective in transition but needs work on half-court spacing",
      defense: "Solid pick-and-roll coverage and help rotations",
      improvements: [
        "Half-court offensive spacing",
        "Transition defense communication",
        "Free throw shooting consistency"
      ]
    },
    key_takeaways: [
      "Individual skill development showing positive results",
      "Strong defensive fundamentals",
      "Need to focus on half-court offensive execution",
      "Team chemistry building well"
    ]
  }
};

// Helper function to handle API errors
const handleAPIError = (error) => {
  if (error.status === 429) {
    throw new Error('API rate limit exceeded or quota reached. Please check your OpenAI account settings.');
  } else if (error.status === 401) {
    throw new Error('Invalid API key. Please check your OpenAI API key configuration.');
  } else if (error.status === 400) {
    throw new Error('Invalid request format. Please try recording again.');
  } else {
    throw new Error(`API Error: ${error.message}`);
  }
};

// Simulate network delay for test mode
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 1500));

export const transcribeAudio = async (audioBlob) => {
  try {
    // Validate API key if not in test mode
    if (!TEST_MODE && !import.meta.env.VITE_OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured.');
    }

    // Validate audio blob
    if (!audioBlob || audioBlob.size === 0) {
      throw new Error('Invalid audio recording.');
    }

    if (TEST_MODE) {
      await mockDelay();
      return MOCK_RESPONSES.transcript;
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'text');

    // Make raw fetch request to handle FormData properly
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const transcript = await response.text();

    if (!transcript) {
      throw new Error('Failed to get transcript from API.');
    }

    return transcript;
  } catch (error) {
    console.error('Transcription error:', error);
    if (error.message.includes('Please wait')) {
      throw error; // Pass through rate limit errors
    }
    handleAPIError(error);
  }
};

export const analyzeSessionTranscript = async (transcript) => {
  try {
    if (!transcript) {
      throw new Error('No transcript provided for analysis.');
    }

    if (TEST_MODE) {
      await mockDelay();
      return MOCK_RESPONSES.analysis;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: SESSION_ANALYSIS_PROMPT,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    if (!completion.choices || !completion.choices[0]?.message?.content) {
      throw new Error('Invalid response from API.');
    }

    // Parse the response into structured data
    const content = completion.choices[0].message.content;
    const sections = content.split('\n\n');
    
    return {
      session_type: sections[0]?.replace('Session Type:', '').trim() || 'Unknown',
      session_summary: sections[1] || '',
      players: extractPlayers(content),
      team_analysis: extractTeamAnalysis(content),
      key_takeaways: extractKeyTakeaways(content)
    };
  } catch (error) {
    console.error('Analysis error:', error);
    handleAPIError(error);
  }
};

// Helper functions to parse GPT-4 response
const extractPlayers = (content) => {
  const players = [];
  const playerSections = content.split(/Player Analysis:|Team Analysis/)[0].split(/\n(?=[A-Za-z]+ \()/);
  
  for (const section of playerSections) {
    if (!section.trim()) continue;
    
    const name = section.split('\n')[0].trim();
    const observations = extractListItems(section, 'Observations:');
    const skills = extractListItems(section, 'Skills:');
    const improvements = extractListItems(section, 'Improvements:');
    const highlights = extractListItems(section, 'Highlights:');
    
    players.push({ name, observations, skills, improvements, highlights });
  }
  
  return players;
};

const extractTeamAnalysis = (content) => {
  const teamSection = content.split('Team Analysis:')[1]?.split('Key Takeaways:')[0] || '';
  
  return {
    performance: extractSection(teamSection, 'Performance:'),
    chemistry: extractSection(teamSection, 'Chemistry:'),
    offense: extractSection(teamSection, 'Offense:'),
    defense: extractSection(teamSection, 'Defense:'),
    improvements: extractListItems(teamSection, 'Improvements:')
  };
};

const extractKeyTakeaways = (content) => {
  const takeawaysSection = content.split('Key Takeaways:')[1] || '';
  return takeawaysSection
    .split('\n')
    .map(item => item.replace(/^-\s*/, '').trim())
    .filter(item => item.length > 0);
};

const extractListItems = (text, header) => {
  const section = text.split(header)[1]?.split(/\n(?=[A-Z])/)[0] || '';
  return section
    .split('\n')
    .map(item => item.replace(/^-\s*/, '').trim())
    .filter(item => item.length > 0);
};

const extractSection = (text, header) => {
  const section = text.split(header)[1]?.split(/\n(?=[A-Z])/)[0] || '';
  return section.trim();
}; 