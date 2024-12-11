import OpenAI from 'openai';
import transcriptionService from './transcriptionService';

// Create a function to get a new OpenAI instance with the current API key
const getOpenAIClient = () => {
  return new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });
};

const ANALYSIS_PROMPT = `You are a sports analysis expert. Analyze the following session feedback and extract information about all players mentioned. 
Return ONLY a JSON object with the following structure, no additional text:
{
  "session_type": "string (must be one of: Training/Practice/Game/Assessment)",
  "session_summary": "string",
  "players": [
    {
      "name": "string",
      "skills_demonstrated": ["string"],
      "areas_for_improvement": ["string"],
      "observations": ["string"],
      "suggested_drills": ["string"]
    }
  ],
  "team_feedback": {
    "strengths": ["string"],
    "improvements": ["string"],
    "chemistry": "string",
    "suggested_team_drills": ["string"]
  },
  "key_takeaways": ["string"]
}

For each player:
1. List specific skills they demonstrated well
2. Note areas needing improvement
3. Include detailed observations
4. Recommend specific drills tailored to their needs

For team feedback:
1. Identify team strengths
2. List areas for team improvement
3. Assess team chemistry
4. Suggest team drills that address the areas for improvement

Ensure all drill recommendations are specific and actionable.
The session_type MUST be one of: Training, Practice, Game, or Assessment.`;

export const analyzeFeedback = async (audioChunks) => {
  try {
    console.log('Starting analysis with chunks:', audioChunks);
    if (!audioChunks || audioChunks.length === 0) {
      throw new Error('No audio chunks provided for analysis');
    }

    // First, transcribe all chunks
    const transcriptions = [];
    console.log('Transcribing chunks...');
    for (const chunk of audioChunks) {
      console.log('Transcribing chunk:', chunk.id);
      const transcription = await transcriptionService.transcribeChunk(chunk);
      console.log('Transcription result:', transcription);
      transcriptions.push(transcription);
    }

    if (transcriptions.length === 0) {
      throw new Error('No transcriptions generated from audio');
    }

    // Merge all transcriptions
    console.log('Merging transcriptions...');
    const mergedTranscript = await transcriptionService.mergeTranscripts(transcriptions);
    console.log('Merged transcript:', mergedTranscript);

    if (!mergedTranscript || !mergedTranscript.text) {
      throw new Error('Failed to merge transcriptions');
    }

    // Split transcript for analysis based on token limits
    console.log('Splitting transcript for analysis...');
    const analysisChunks = transcriptionService.splitTranscriptForAnalysis(
      mergedTranscript,
      'gpt-4'
    );
    console.log('Analysis chunks:', analysisChunks);

    if (analysisChunks.length === 0) {
      throw new Error('No analysis chunks generated');
    }

    // Analyze each chunk
    const analysisResults = [];
    const client = getOpenAIClient();
    console.log('Analyzing chunks with OpenAI...');
    
    for (const chunk of analysisChunks) {
      console.log('Analyzing chunk:', chunk);
      const completion = await client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: ANALYSIS_PROMPT },
          { role: 'user', content: chunk.text }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      if (!completion.choices?.[0]?.message?.content) {
        throw new Error('No analysis content received from OpenAI');
      }

      try {
        const analysis = JSON.parse(completion.choices[0].message.content);
        console.log('Analysis result:', analysis);
        
        // Validate session type
        if (!analysis) {
          throw new Error('Invalid analysis format received');
        }

        // Ensure valid session type
        const validSessionTypes = ['Training', 'Practice', 'Game', 'Assessment'];
        analysis.session_type = analysis.session_type && validSessionTypes.includes(analysis.session_type)
          ? analysis.session_type
          : 'Training';

        // Ensure other required fields
        analysis.session_summary = analysis.session_summary || 'Session summary not provided';
        analysis.players = analysis.players || [];
        analysis.team_feedback = analysis.team_feedback || {
          strengths: [],
          improvements: [],
          chemistry: 'Not specified',
          suggested_team_drills: []
        };
        analysis.key_takeaways = analysis.key_takeaways || [];

        analysisResults.push({
          ...analysis,
          startTime: chunk.startTime,
          endTime: chunk.endTime,
        });
      } catch (parseError) {
        console.error('Failed to parse analysis:', parseError);
        throw new Error('Failed to parse analysis response');
      }
    }

    if (analysisResults.length === 0) {
      throw new Error('No valid analysis results generated');
    }

    // Merge analysis results with validation
    console.log('Merging analysis results...');
    const mergedAnalysis = {
      session_type: analysisResults[0].session_type,
      session_summary: analysisResults[0].session_summary,
      players: [],
      team_feedback: {
        strengths: new Set(),
        improvements: new Set(),
        chemistry: analysisResults[0].team_feedback?.chemistry || 'Not specified',
        suggested_team_drills: new Set()
      },
      key_takeaways: [],
    };

    // Combine results from all chunks with validation
    analysisResults.forEach(result => {
      // Merge players with validation
      result.players?.forEach(player => {
        if (!player || !player.name) return;
        
        const existingPlayer = mergedAnalysis.players.find(p => p.name === player.name);
        if (existingPlayer) {
          existingPlayer.skills_demonstrated = [
            ...new Set([...existingPlayer.skills_demonstrated, ...(player.skills_demonstrated || [])])
          ].filter(Boolean);
          existingPlayer.areas_for_improvement = [
            ...new Set([...existingPlayer.areas_for_improvement, ...(player.areas_for_improvement || [])])
          ].filter(Boolean);
          existingPlayer.observations = [
            ...existingPlayer.observations,
            ...(player.observations || [])
          ].filter(Boolean);
          existingPlayer.suggested_drills = [
            ...new Set([...existingPlayer.suggested_drills, ...(player.suggested_drills || [])])
          ].filter(Boolean);
        } else {
          mergedAnalysis.players.push({
            name: player.name,
            skills_demonstrated: (player.skills_demonstrated || []).filter(Boolean),
            areas_for_improvement: (player.areas_for_improvement || []).filter(Boolean),
            observations: (player.observations || []).filter(Boolean),
            suggested_drills: (player.suggested_drills || []).filter(Boolean)
          });
        }
      });

      // Merge team feedback with validation
      result.team_feedback?.strengths?.forEach(strength => 
        strength && mergedAnalysis.team_feedback.strengths.add(strength)
      );
      result.team_feedback?.improvements?.forEach(improvement => 
        improvement && mergedAnalysis.team_feedback.improvements.add(improvement)
      );
      result.team_feedback?.suggested_team_drills?.forEach(drill => 
        drill && mergedAnalysis.team_feedback.suggested_team_drills.add(drill)
      );

      // Merge key takeaways with validation
      if (result.key_takeaways?.length > 0) {
        mergedAnalysis.key_takeaways.push(...result.key_takeaways.filter(Boolean));
      }
    });

    // Convert Sets back to arrays
    mergedAnalysis.team_feedback.strengths = Array.from(mergedAnalysis.team_feedback.strengths);
    mergedAnalysis.team_feedback.improvements = Array.from(mergedAnalysis.team_feedback.improvements);
    mergedAnalysis.team_feedback.suggested_team_drills = Array.from(mergedAnalysis.team_feedback.suggested_team_drills);

    console.log('Final analysis result:', mergedAnalysis);
    return {
      transcript: mergedTranscript.text,
      analysis: mergedAnalysis,
    };
  } catch (error) {
    console.error('Error in analyzeFeedback:', error);
    throw new Error(`Failed to process recording: ${error.message}`);
  }
};

export const generateSummary = async (feedback) => {
  try {
    if (!feedback) {
      throw new Error('No feedback provided for summary');
    }

    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a basketball coach. Summarize the feedback in a concise, actionable way, including specific drill recommendations.'
        },
        {
          role: 'user',
          content: JSON.stringify(feedback)
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    if (!completion.choices?.[0]?.message?.content) {
      throw new Error('No summary content received');
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}; 