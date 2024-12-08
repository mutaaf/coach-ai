import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import {
  Mic,
  Stop,
  Save,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { analyzeFeedback } from '../services/aiService';
import { getAllPlayers, addFeedback } from '../services/storageService';

const RecordFeedback = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [existingPlayers, setExistingPlayers] = useState([]);
  const [detectedPlayers, setDetectedPlayers] = useState([]);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editedSkill, setEditedSkill] = useState('');
  const [editedArea, setEditedArea] = useState('');
  const [editedObservation, setEditedObservation] = useState('');
  const [playerPositions, setPlayerPositions] = useState({});

  // Load existing players for name suggestions
  useEffect(() => {
    const players = getAllPlayers();
    setExistingPlayers(Object.values(players).map(p => ({
      id: p.id,
      name: p.name,
      position: p.position
    })));
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false // explicitly disable video
      });
      
      // Get supported MIME types
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : 'audio/wav';

      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000
      });
      
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: mimeType });
        setAudioBlob(audioBlob);
        console.log('Recording stopped, blob created:', {
          type: mimeType,
          size: audioBlob.size
        });
      };

      mediaRecorder.current.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setError(`Recording error: ${event.error.message || 'Unknown error'}`);
      };

      mediaRecorder.current.start(100); // collect data every 100ms
      setIsRecording(true);
      setError(null);
      console.log('Recording started with mime type:', mimeType);
    } catch (err) {
      console.error('Error starting recording:', {
        name: err.name,
        message: err.message,
        constraint: err.constraint
      });
      let errorMessage = 'Error accessing microphone. ';
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please ensure microphone permissions are granted.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No microphone found on your device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Your microphone is busy or unavailable.';
      } else {
        errorMessage += err.message || 'Please check your device settings.';
      }
      setError(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleAnalysis = async () => {
    if (!audioBlob) {
      setError('No audio recording found. Please record audio first.');
      return;
    }

    if (audioBlob.size === 0) {
      setError('Audio recording is empty. Please try recording again.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('Starting analysis with blob:', {
        type: audioBlob.type,
        size: audioBlob.size
      });
      const result = await analyzeFeedback(audioBlob);
      
      if (!result) {
        throw new Error('No analysis result received');
      }
      
      setFeedback(result);
      
      // Initialize detected players with names from analysis
      const initialPlayers = result.analysis.players.map(player => ({
        ...player,
        confirmed: false,
        matchedPlayer: null
      }));
      setDetectedPlayers(initialPlayers);
      setShowConfirmation(true);
    } catch (err) {
      console.error('Analysis error:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      setError(`Error analyzing feedback: ${err.message || 'Please try again.'}`);
    } finally {
      setProcessing(false);
    }
  };

  const handlePlayerMatch = (detectedPlayer, matchedPlayer) => {
    setDetectedPlayers(current =>
      current.map(p =>
        p.name === detectedPlayer.name
          ? { 
              ...p, 
              confirmed: true, 
              matchedPlayer,
              // If matching with existing player, use their position
              position: matchedPlayer?.position || playerPositions[p.name] || ''
            }
          : p
      )
    );
  };

  const handlePositionChange = (player, position) => {
    setPlayerPositions(prev => ({
      ...prev,
      [player.name]: position
    }));
    
    // Update detected players list
    setDetectedPlayers(current =>
      current.map(p =>
        p.name === player.name
          ? { ...p, position }
          : p
      )
    );
  };

  const handleSaveFeedback = () => {
    try {
      // Save feedback for each player (matched or new)
      detectedPlayers.forEach(player => {
        const playerFeedback = {
          ...feedback,
          playerName: player.matchedPlayer?.name || player.name,
          analysis: {
            ...feedback.analysis,
            session_type: feedback.analysis.session_type,
            skills_demonstrated: player.skills_demonstrated,
            areas_for_improvement: player.areas_for_improvement,
            key_takeaways: [
              ...player.observations,
              ...feedback.analysis.key_takeaways
            ]
          }
        };

        // If player is matched, use their ID, otherwise create new player
        const playerId = player.matchedPlayer?.id || null;
        addFeedback(playerId, {
          ...playerFeedback,
          position: player.matchedPlayer?.position || playerPositions[player.name] || ''
        });
      });

      setShowConfirmation(false);
      setAudioBlob(null);
      setFeedback(null);
      setDetectedPlayers([]);
      setPlayerPositions({});
    } catch (err) {
      setError('Error saving feedback. Please try again.');
      console.error('Error saving feedback:', err);
    }
  };

  const handleAddSkill = (player) => {
    if (!editedSkill.trim()) return;
    setDetectedPlayers(current =>
      current.map(p =>
        p.name === player.name
          ? { ...p, skills_demonstrated: [...p.skills_demonstrated, editedSkill.trim()] }
          : p
      )
    );
    setEditedSkill('');
  };

  const handleRemoveSkill = (player, skillToRemove) => {
    setDetectedPlayers(current =>
      current.map(p =>
        p.name === player.name
          ? { ...p, skills_demonstrated: p.skills_demonstrated.filter(skill => skill !== skillToRemove) }
          : p
      )
    );
  };

  const handleAddArea = (player) => {
    if (!editedArea.trim()) return;
    setDetectedPlayers(current =>
      current.map(p =>
        p.name === player.name
          ? { ...p, areas_for_improvement: [...p.areas_for_improvement, editedArea.trim()] }
          : p
      )
    );
    setEditedArea('');
  };

  const handleRemoveArea = (player, areaToRemove) => {
    setDetectedPlayers(current =>
      current.map(p =>
        p.name === player.name
          ? { ...p, areas_for_improvement: p.areas_for_improvement.filter(area => area !== areaToRemove) }
          : p
      )
    );
  };

  const handleAddObservation = (player) => {
    if (!editedObservation.trim()) return;
    setDetectedPlayers(current =>
      current.map(p =>
        p.name === player.name
          ? { ...p, observations: [...p.observations, editedObservation.trim()] }
          : p
      )
    );
    setEditedObservation('');
  };

  const handleRemoveObservation = (player, obsToRemove) => {
    setDetectedPlayers(current =>
      current.map(p =>
        p.name === player.name
          ? { ...p, observations: p.observations.filter(obs => obs !== obsToRemove) }
          : p
      )
    );
  };

  const canSaveFeedback = detectedPlayers.length > 0;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Record Feedback
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          {!isRecording ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Mic />}
              onClick={startRecording}
              disabled={processing}
              size="large"
            >
              Start Recording
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<Stop />}
              onClick={stopRecording}
              size="large"
            >
              Stop Recording
            </Button>
          )}
        </Box>

        {audioBlob && !processing && !feedback && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={handleAnalysis}
              size="large"
            >
              Analyze Feedback
            </Button>
          </Box>
        )}

        {processing && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Processing feedback...</Typography>
          </Box>
        )}
      </Paper>

      <Dialog 
        open={showConfirmation} 
        onClose={() => setShowConfirmation(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Confirm Players & Feedback</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Session Information
            </Typography>
            <Chip 
              label={feedback?.analysis.session_type}
              color="primary"
              sx={{ mb: 2 }}
            />

            <Typography variant="h6" gutterBottom>
              Detected Players
            </Typography>
            <List>
              {detectedPlayers.map((player, index) => (
                <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                      {player.name}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setEditingPlayer(editingPlayer === player ? null : player)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Autocomplete
                      options={existingPlayers}
                      getOptionLabel={(option) => option.name}
                      value={player.matchedPlayer}
                      onChange={(_, newValue) => handlePlayerMatch(player, newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Match to Existing Player (Optional)"
                          variant="outlined"
                          size="small"
                        />
                      )}
                      sx={{ flexGrow: 1 }}
                    />
                    
                    <TextField
                      label="Position"
                      variant="outlined"
                      size="small"
                      value={player.matchedPlayer?.position || playerPositions[player.name] || ''}
                      onChange={(e) => handlePositionChange(player, e.target.value)}
                      disabled={!!player.matchedPlayer}
                      sx={{ width: '150px' }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Skills Demonstrated:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {player.skills_demonstrated.map((skill, idx) => (
                        <Chip
                          key={idx}
                          label={skill}
                          size="small"
                          variant="outlined"
                          onDelete={() => handleRemoveSkill(player, skill)}
                        />
                      ))}
                    </Box>
                    {editingPlayer === player && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          size="small"
                          value={editedSkill}
                          onChange={(e) => setEditedSkill(e.target.value)}
                          placeholder="Add skill"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(player)}
                        />
                        <IconButton size="small" onClick={() => handleAddSkill(player)}>
                          <AddIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Areas for Improvement:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {player.areas_for_improvement.map((area, idx) => (
                        <Chip
                          key={idx}
                          label={area}
                          size="small"
                          color="secondary"
                          variant="outlined"
                          onDelete={() => handleRemoveArea(player, area)}
                        />
                      ))}
                    </Box>
                    {editingPlayer === player && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          size="small"
                          value={editedArea}
                          onChange={(e) => setEditedArea(e.target.value)}
                          placeholder="Add area for improvement"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddArea(player)}
                        />
                        <IconButton size="small" onClick={() => handleAddArea(player)}>
                          <AddIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Observations:
                    </Typography>
                    <List dense>
                      {player.observations.map((obs, idx) => (
                        <ListItem key={idx} disableGutters>
                          <ListItemText primary={obs} />
                          {editingPlayer === player && (
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={() => handleRemoveObservation(player, obs)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      ))}
                    </List>
                    {editingPlayer === player && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          size="small"
                          fullWidth
                          value={editedObservation}
                          onChange={(e) => setEditedObservation(e.target.value)}
                          placeholder="Add observation"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddObservation(player)}
                        />
                        <IconButton size="small" onClick={() => handleAddObservation(player)}>
                          <AddIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  {index < detectedPlayers.length - 1 && <Divider sx={{ my: 2 }} />}
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmation(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveFeedback} 
            variant="contained" 
            color="primary"
            disabled={!canSaveFeedback}
          >
            Save Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecordFeedback; 