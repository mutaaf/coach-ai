import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import { MicNone, Stop, Refresh, Save, FitnessCenter } from '@mui/icons-material';
import audioService from '../services/audioService';
import uploadService from '../services/uploadService';
import { analyzeFeedback, generateSummary } from '../services/aiService';
import { addFeedback } from '../services/storageService';

const RecordFeedback = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [chunks, setChunks] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleChunkReady = useCallback((chunk) => {
    setChunks(prev => [...prev, chunk]);
  }, []);

  const reset = () => {
    setIsRecording(false);
    setRecordingDuration(0);
    setChunks([]);
    setUploadProgress({});
    setTranscriptionProgress(0);
    setError(null);
    setStatus('idle');
    setFeedback(null);
    setShowConfirmation(false);
  };

  const startRecording = async () => {
    try {
      setError(null);
      setStatus('recording');
      setIsRecording(true);
      setRecordingDuration(0);
      setChunks([]);
      await audioService.startRecording(handleChunkReady);
    } catch (err) {
      console.error('Recording error:', err);
      setError('Failed to start recording: ' + err.message);
      reset();
    }
  };

  const stopRecording = async () => {
    try {
      setStatus('processing');
      await audioService.stopRecording();
      setIsRecording(false);
      
      // Wait a short moment for any final chunks to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      if (!chunks || chunks.length === 0) {
        setError('No audio was recorded. Please try again and speak into your microphone.');
        reset();
        return;
      }

      // Upload and analyze the chunks
      try {
        // Upload chunks
        setStatus('uploading');
        await uploadService.uploadChunksSequentially(
          chunks,
          (progress) => {
            setUploadProgress(prev => ({
              ...prev,
              [progress.chunkId]: progress.progress,
            }));
          }
        );

        // Analyze feedback
        setStatus('analyzing');
        const result = await analyzeFeedback(chunks);
        
        // Validate the analysis result
        if (!result || !result.analysis) {
          throw new Error('Invalid analysis result received');
        }

        // Set default session type if not provided
        if (!result.analysis.session_type) {
          result.analysis.session_type = 'Training';
        }

        setFeedback(result);
        setShowConfirmation(true);
        setStatus('completed');
      } catch (analysisError) {
        console.error('Analysis error:', analysisError);
        setError(analysisError.message || 'Failed to analyze recording');
        reset();
      }
    } catch (err) {
      console.error('Stop recording error:', err);
      setError(err.message);
      reset();
    }
  };

  const processRecording = async () => {
    try {
      // Upload chunks
      setStatus('uploading');
      await uploadService.uploadChunksSequentially(
        chunks,
        (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [progress.chunkId]: progress.progress,
          }));
        }
      );

      // Analyze feedback
      setStatus('analyzing');
      const result = await analyzeFeedback(chunks);
      
      // Validate the analysis result
      if (!result || !result.analysis) {
        throw new Error('Invalid analysis result received');
      }

      // Set default session type if not provided
      if (!result.analysis.session_type) {
        result.analysis.session_type = 'Training';
      }

      setFeedback(result);
      setShowConfirmation(true);
      setStatus('completed');
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message || 'Failed to process recording');
      reset();
    }
  };

  const handleSaveFeedback = async () => {
    try {
      if (!feedback || !feedback.analysis || !feedback.analysis.players) {
        throw new Error('Invalid feedback data');
      }

      setStatus('saving');
      
      // Generate a summary for each player
      for (const player of feedback.analysis.players) {
        if (!player || !player.name) {
          console.warn('Skipping invalid player data');
          continue;
        }

        const playerFeedback = {
          ...feedback,
          playerName: player.name,
          analysis: {
            ...feedback.analysis,
            session_type: feedback.analysis.session_type || 'Training',
            skills_demonstrated: player.skills_demonstrated || [],
            areas_for_improvement: player.areas_for_improvement || [],
            observations: player.observations || [],
          }
        };

        await addFeedback(null, playerFeedback);
      }

      setShowConfirmation(false);
      reset();
    } catch (err) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save feedback');
      setStatus('idle');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderProgress = () => {
    switch (status) {
      case 'recording':
        return (
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <Typography variant="h6" color="primary">
              Recording: {formatDuration(recordingDuration)}
            </Typography>
            <CircularProgress color="primary" />
          </Box>
        );
      case 'uploading':
        return (
          <Box sx={{ my: 2 }}>
            <Typography variant="h6">Uploading Chunks</Typography>
            {chunks.map(chunk => (
              <Box key={chunk.id} sx={{ my: 1 }}>
                <Typography variant="body2">
                  Chunk {chunk.index + 1}: {Math.round(uploadProgress[chunk.id] || 0)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress[chunk.id] || 0} 
                />
              </Box>
            ))}
          </Box>
        );
      case 'analyzing':
        return (
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <Typography variant="h6">Analyzing Feedback</Typography>
            <CircularProgress />
          </Box>
        );
      default:
        return null;
    }
  };

  const renderDrills = (drills, title) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FitnessCenter fontSize="small" />
        {title}:
      </Typography>
      <List dense>
        {drills.map((drill, idx) => (
          <ListItem key={idx}>
            <ListItemText 
              primary={drill}
              sx={{ 
                '& .MuiListItemText-primary': { 
                  color: 'primary.main',
                  fontWeight: 500
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Record Feedback
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          color={isRecording ? 'error' : 'primary'}
          startIcon={isRecording ? <Stop /> : <MicNone />}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={status !== 'idle' && status !== 'recording'}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={reset}
          disabled={status === 'recording'}
        >
          Reset
        </Button>
      </Box>

      {renderProgress()}

      <Dialog 
        open={showConfirmation} 
        onClose={() => setShowConfirmation(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Confirm Feedback</DialogTitle>
        <DialogContent>
          {feedback && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Session Information
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Chip 
                  label={feedback.analysis.session_type}
                  color="primary"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {feedback.analysis.session_summary}
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>
                Team Feedback
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Strengths:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {feedback.analysis.team_feedback.strengths.map((strength, idx) => (
                      <Chip key={idx} label={strength} size="small" color="success" />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Areas for Improvement:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {feedback.analysis.team_feedback.improvements.map((improvement, idx) => (
                      <Chip key={idx} label={improvement} size="small" color="warning" />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Team Chemistry:
                  </Typography>
                  <Typography variant="body2">
                    {feedback.analysis.team_feedback.chemistry}
                  </Typography>
                </Box>

                {renderDrills(feedback.analysis.team_feedback.suggested_team_drills, 'Suggested Team Drills')}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Individual Player Feedback
              </Typography>
              <List>
                {feedback.analysis.players.map((player, index) => (
                  <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {player.name}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Skills Demonstrated:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {player.skills_demonstrated.map((skill, idx) => (
                          <Chip key={idx} label={skill} size="small" color="success" />
                        ))}
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Areas for Improvement:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {player.areas_for_improvement.map((area, idx) => (
                          <Chip key={idx} label={area} size="small" color="warning" />
                        ))}
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Observations:
                      </Typography>
                      <List dense>
                        {player.observations.map((obs, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={obs} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    {renderDrills(player.suggested_drills, 'Recommended Drills')}

                    {index < feedback.analysis.players.length - 1 && (
                      <Divider sx={{ my: 2 }} />
                    )}
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Key Takeaways
              </Typography>
              <List dense>
                {feedback.analysis.key_takeaways.map((takeaway, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={takeaway} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmation(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveFeedback} 
            variant="contained" 
            color="primary"
            startIcon={<Save />}
          >
            Save Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecordFeedback; 