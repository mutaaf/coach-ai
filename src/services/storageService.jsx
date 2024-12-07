// Local storage keys
const STORAGE_KEYS = {
  PLAYERS: 'basketball_scout_hub_players',
  FEEDBACK: 'basketball_scout_hub_feedback',
};

// Helper function to get data from localStorage
const getFromStorage = (key, defaultValue = {}) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${error}`);
    return defaultValue;
  }
};

// Helper function to save data to localStorage
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`);
  }
};

// Initialize storage if empty
const initializeStorage = () => {
  const players = getFromStorage(STORAGE_KEYS.PLAYERS);
  if (Object.keys(players).length === 0) {
    saveToStorage(STORAGE_KEYS.PLAYERS, {});
  }
};

// Call initialization
initializeStorage();

export const getAllPlayers = () => {
  return getFromStorage(STORAGE_KEYS.PLAYERS);
};

export const getPlayer = (playerId) => {
  const players = getAllPlayers();
  return players[playerId];
};

export const updatePlayer = (updatedPlayer) => {
  const players = getAllPlayers();
  
  // Ensure player has an ID
  if (!updatedPlayer.id) {
    updatedPlayer.id = updatedPlayer.name.toLowerCase().replace(/\s+/g, '-');
  }
  
  players[updatedPlayer.id] = {
    ...players[updatedPlayer.id],
    ...updatedPlayer,
    lastUpdated: new Date().toISOString(),
  };
  
  saveToStorage(STORAGE_KEYS.PLAYERS, players);
  return updatedPlayer;
};

export const addFeedback = (playerId, feedback) => {
  // Get current players
  const players = getAllPlayers();
  
  // Create player ID if not provided
  const playerIdentifier = playerId || feedback.playerName.toLowerCase().replace(/\s+/g, '-');
  
  // Get or initialize player
  const player = players[playerIdentifier] || {
    id: playerIdentifier,
    name: feedback.playerName,
    feedback: [],
    stats: {
      totalSessions: 0,
      lastFeedback: null,
      skillFrequency: {},
      sessionTypes: {},
      improvementAreas: {},
      recentHighlights: [],
    },
  };

  // Update player stats
  const stats = player.stats;
  stats.totalSessions++;
  stats.lastFeedback = new Date().toISOString();

  // Update skill frequency
  feedback.analysis.skills_demonstrated?.forEach(skill => {
    stats.skillFrequency[skill] = (stats.skillFrequency[skill] || 0) + 1;
  });

  // Update session types
  const sessionType = feedback.analysis.session_type;
  stats.sessionTypes[sessionType] = (stats.sessionTypes[sessionType] || 0) + 1;

  // Update improvement areas
  feedback.analysis.areas_for_improvement?.forEach(area => {
    stats.improvementAreas[area] = (stats.improvementAreas[area] || 0) + 1;
  });

  // Update recent highlights
  if (feedback.analysis.key_takeaways?.length > 0) {
    stats.recentHighlights.unshift({
      highlight: feedback.analysis.key_takeaways[0],
      timestamp: new Date().toISOString(),
    });
    stats.recentHighlights = stats.recentHighlights.slice(0, 5); // Keep only last 5 highlights
  }

  // Add feedback to player's history
  player.feedback = player.feedback || [];
  player.feedback.push({
    ...feedback,
    timestamp: new Date().toISOString(),
  });

  // Save updated player data
  players[playerIdentifier] = player;
  saveToStorage(STORAGE_KEYS.PLAYERS, players);

  return player;
};

export const getPlayerFeedbackHistory = (playerId) => {
  const player = getPlayer(playerId);
  return player ? player.feedback : [];
};

export const deletePlayer = (playerId) => {
  const players = getAllPlayers();
  if (players[playerId]) {
    delete players[playerId];
    saveToStorage(STORAGE_KEYS.PLAYERS, players);
    return true;
  }
  return false;
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.PLAYERS);
  localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
  initializeStorage();
}; 