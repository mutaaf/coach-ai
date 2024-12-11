import OpenAI from 'openai';
import transcriptionService from './transcriptionService';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const ANALYSIS_PROMPT = `You are a basketball analysis expert. Analyze the following session feedback and extract information about all players mentioned. 
Return ONLY a JSON object with the following structure, no additional text:
{
  "session_type": "string (Practice/Game/Training)",
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

Ensure all drill recommendations are specific and actionable.`;

export const analyzeFeedback = async (audioChunks) => {
  try {
    // First, transcribe all chunks
    const transcriptions = [];
    for (const chunk of audioChunks) {
      const transcription = await transcriptionService.transcribeChunk(chunk);
      transcriptions.push(transcription);
    }

    // Merge all transcriptions
    const mergedTranscript = await transcriptionService.mergeTranscripts(transcriptions);

    // Split transcript for analysis based on token limits
    const analysisChunks = transcriptionService.splitTranscriptForAnalysis(
      mergedTranscript,
      'gpt-4'
    );

    // Analyze each chunk
    const analysisResults = [];
    for (const chunk of analysisChunks) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: ANALYSIS_PROMPT },
          { role: 'user', content: chunk.text }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(completion.choices[0].message.content);
      analysisResults.push({
        ...analysis,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
      });
    }

    // Merge analysis results
    const mergedAnalysis = {
      session_type: analysisResults[0].session_type,
      session_summary: analysisResults[0].session_summary,
      players: [],
      team_feedback: {
        strengths: new Set(),
        improvements: new Set(),
        chemistry: analysisResults[0].team_feedback.chemistry,
        suggested_team_drills: new Set()
      },
      key_takeaways: [],
    };

    // Combine results from all chunks
    analysisResults.forEach(result => {
      // Merge players
      result.players?.forEach(player => {
        const existingPlayer = mergedAnalysis.players.find(p => p.name === player.name);
        if (existingPlayer) {
          existingPlayer.skills_demonstrated = [
            ...new Set([...existingPlayer.skills_demonstrated, ...(player.skills_demonstrated || [])])
          ];
          existingPlayer.areas_for_improvement = [
            ...new Set([...existingPlayer.areas_for_improvement, ...(player.areas_for_improvement || [])])
          ];
          existingPlayer.observations = [
            ...existingPlayer.observations,
            ...(player.observations || [])
          ];
          existingPlayer.suggested_drills = [
            ...new Set([...existingPlayer.suggested_drills, ...(player.suggested_drills || [])])
          ];
        } else {
          mergedAnalysis.players.push({
            ...player,
            skills_demonstrated: player.skills_demonstrated || [],
            areas_for_improvement: player.areas_for_improvement || [],
            observations: player.observations || [],
            suggested_drills: player.suggested_drills || []
          });
        }
      });

      // Merge team feedback
      result.team_feedback?.strengths?.forEach(strength => 
        mergedAnalysis.team_feedback.strengths.add(strength)
      );
      result.team_feedback?.improvements?.forEach(improvement => 
        mergedAnalysis.team_feedback.improvements.add(improvement)
      );
      result.team_feedback?.suggested_team_drills?.forEach(drill => 
        mergedAnalysis.team_feedback.suggested_team_drills.add(drill)
      );

      // Merge key takeaways
      if (result.key_takeaways) {
        mergedAnalysis.key_takeaways.push(...result.key_takeaways);
      }
    });

    // Convert Sets back to arrays
    mergedAnalysis.team_feedback.strengths = Array.from(mergedAnalysis.team_feedback.strengths);
    mergedAnalysis.team_feedback.improvements = Array.from(mergedAnalysis.team_feedback.improvements);
    mergedAnalysis.team_feedback.suggested_team_drills = Array.from(mergedAnalysis.team_feedback.suggested_team_drills);

    return {
      transcript: mergedTranscript.text,
      analysis: mergedAnalysis,
    };
  } catch (error) {
    console.error('Error in analyzeFeedback:', error);
    throw error;
  }
};

export const generateSummary = async (feedback) => {
  try {
    const completion = await openai.chat.completions.create({
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

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}; 