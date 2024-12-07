// Local storage keys
const STORAGE_KEYS = {
  RECORDINGS: 'basketball_scout_recordings',
  PLAYERS: 'basketball_scout_players'
};

// Helper to get player stats from feedback history
const calculatePlayerStats = (playerFeedback) => {
  const stats = {
    totalSessions: playerFeedback.length,
    skillFrequency: {},
    improvementAreas: {},
    recentHighlights: [],
    sessionTypes: {},
    lastFeedback: null
  };

  playerFeedback.forEach(feedback => {
    // Track session types
    stats.sessionTypes[feedback.analysis.session_type] = 
      (stats.sessionTypes[feedback.analysis.session_type] || 0) + 1;

    // Find player in the analysis
    const playerAnalysis = feedback.analysis.players.find(p => 
      p.name.toLowerCase() === playerFeedback[0].playerName.toLowerCase()
    );

    if (playerAnalysis) {
      // Track skills
      playerAnalysis.skills.forEach(skill => {
        stats.skillFrequency[skill] = (stats.skillFrequency[skill] || 0) + 1;
      });

      // Track improvements
      playerAnalysis.improvements.forEach(improvement => {
        stats.improvementAreas[improvement] = (stats.improvementAreas[improvement] || 0) + 1;
      });

      // Add highlights with timestamps
      playerAnalysis.highlights.forEach(highlight => {
        stats.recentHighlights.push({
          highlight,
          timestamp: feedback.timestamp
        });
      });
    }
  });

  // Sort highlights by timestamp and take most recent
  stats.recentHighlights.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  stats.recentHighlights = stats.recentHighlights.slice(0, 5);

  // Set last feedback date
  stats.lastFeedback = playerFeedback[playerFeedback.length - 1].timestamp;

  return stats;
};

// Save recording with enhanced player tracking
export const saveRecording = (recordingData) => {
  try {
    // Get existing recordings
    const existingRecordings = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDINGS) || '[]');
    
    // Add new recording
    existingRecordings.push(recordingData);
    localStorage.setItem(STORAGE_KEYS.RECORDINGS, JSON.stringify(existingRecordings));

    // Update player records
    const players = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYERS) || '{}');
    
    // Extract and update player data
    recordingData.analysis.players.forEach(player => {
      const playerName = player.name.toLowerCase();
      if (!players[playerName]) {
        players[playerName] = {
          name: player.name,
          feedback: []
        };
      }

      // Add feedback reference
      players[playerName].feedback.push({
        recordingId: recordingData.id,
        timestamp: recordingData.timestamp,
        playerName: player.name,
        analysis: recordingData.analysis
      });

      // Calculate updated stats
      players[playerName].stats = calculatePlayerStats(players[playerName].feedback);
    });

    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    return true;
  } catch (error) {
    console.error('Error saving recording:', error);
    return false;
  }
};

// Get all recordings
export const getAllRecordings = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDINGS) || '[]');
  } catch (error) {
    console.error('Error getting recordings:', error);
    return [];
  }
};

// Get all players with their feedback history
export const getAllPlayers = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYERS) || '{}');
  } catch (error) {
    console.error('Error getting players:', error);
    return {};
  }
};

// Get specific player data
export const getPlayerData = (playerName) => {
  try {
    const players = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYERS) || '{}');
    return players[playerName.toLowerCase()] || null;
  } catch (error) {
    console.error('Error getting player data:', error);
    return null;
  }
};

// Get feedback history for a specific player
export const getPlayerFeedbackHistory = (playerName) => {
  const playerData = getPlayerData(playerName);
  return playerData ? playerData.feedback : [];
};

// Delete a recording and update player records
export const deleteRecording = (recordingId) => {
  try {
    // Remove from recordings
    const recordings = getAllRecordings();
    const updatedRecordings = recordings.filter(r => r.id !== recordingId);
    localStorage.setItem(STORAGE_KEYS.RECORDINGS, JSON.stringify(updatedRecordings));

    // Update player records
    const players = getAllPlayers();
    Object.keys(players).forEach(playerName => {
      players[playerName].feedback = players[playerName].feedback.filter(
        f => f.recordingId !== recordingId
      );
      if (players[playerName].feedback.length > 0) {
        players[playerName].stats = calculatePlayerStats(players[playerName].feedback);
      } else {
        delete players[playerName]; // Remove player if no more feedback
      }
    });

    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    return true;
  } catch (error) {
    console.error('Error deleting recording:', error);
    return false;
  }
}; 