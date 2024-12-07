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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Error accessing microphone. Please ensure microphone permissions are granted.');
      console.error('Error starting recording:', err);
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
    if (!audioBlob) return;

    setProcessing(true);
    setError(null);

    try {
      const result = await analyzeFeedback(audioBlob);
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
      setError('Error analyzing feedback. Please try again.');
      console.error('Error analyzing feedback:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handlePlayerMatch = (detectedPlayer, matchedPlayer) => {
    setDetectedPlayers(current =>
      current.map(p =>
        p.name === detectedPlayer.name
          ? { ...p, confirmed: true, matchedPlayer }
          : p
      )
    );
  };

  const handleSaveFeedback = () => {
    try {
      // Save feedback for each confirmed player
      detectedPlayers.forEach(player => {
        if (player.confirmed && player.matchedPlayer) {
          const playerFeedback = {
            ...feedback,
            playerName: player.matchedPlayer.name,
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
          addFeedback(player.matchedPlayer.id, playerFeedback);
        }
      });

      setShowConfirmation(false);
      setAudioBlob(null);
      setFeedback(null);
      setDetectedPlayers([]);
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

  const canSaveFeedback = detectedPlayers.every(player => player.matchedPlayer);

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

                  <Autocomplete
                    options={existingPlayers}
                    getOptionLabel={(option) => option.name}
                    value={player.matchedPlayer}
                    onChange={(_, newValue) => handlePlayerMatch(player, newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Match to Existing Player"
                        variant="outlined"
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    )}
                  />

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