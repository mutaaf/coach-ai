import { useState, useRef } from 'react';
import {
  Container,
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { transcribeAudio, analyzeSessionTranscript } from '../services/aiService.jsx';
import { saveRecording } from '../services/storageService.jsx';
import { v4 as uuidv4 } from 'uuid';

const RecordFeedback = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [processingStep, setProcessingStep] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        try {
          setIsProcessing(true);
          setError(null);
          
          // Create audio blob from chunks
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
          const audioUrl = URL.createObjectURL(audioBlob);

          // Transcribe audio
          setProcessingStep('Transcribing audio...');
          const transcript = await transcribeAudio(audioBlob);
          
          if (!transcript) {
            throw new Error('Failed to transcribe audio. Please try again.');
          }

          // Analyze session transcript
          setProcessingStep('Analyzing session...');
          const analysis = await analyzeSessionTranscript(transcript);
          
          if (!analysis) {
            throw new Error('Failed to analyze transcript. Please try again.');
          }

          // Create recording data
          const recordingData = {
            id: uuidv4(),
            url: audioUrl,
            timestamp: new Date().toISOString(),
            transcript,
            analysis
          };

          // Save to storage
          const saved = saveRecording(recordingData);
          if (!saved) {
            throw new Error('Failed to save recording. Please try again.');
          }

          setRecordings(prev => [...prev, recordingData]);

        } catch (err) {
          console.error('Processing error:', err);
          setError(err.message || 'Failed to process recording. Please try again.');
        } finally {
          setIsProcessing(false);
          setProcessingStep('');
          chunksRef.current = [];
        }
      };

      // Start recording with 1-second timeslices
      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Error accessing microphone. Please ensure you have granted microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Session Feedback Recording
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          }
        >
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          {!isRecording ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<MicIcon />}
              onClick={startRecording}
              disabled={isProcessing}
              size="large"
            >
              Start Session Recording
            </Button>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<StopIcon />}
              onClick={stopRecording}
              size="large"
            >
              Stop Recording
            </Button>
          )}
        </Box>
        
        {isProcessing && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography>{processingStep || 'Processing recording...'}</Typography>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          {isRecording ? 
            'Recording in progress... Click stop when finished.' :
            'Click the button above to start recording your session feedback.'
          }
        </Typography>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Session Recordings
      </Typography>
      
      <Box>
        {recordings.map((recording, index) => (
          <Paper key={index} sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Session Recording - {new Date(recording.timestamp).toLocaleString()}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <audio controls src={recording.url} style={{ width: '100%' }} />
            </Box>

            {recording.analysis.key_takeaways?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Key Takeaways
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {recording.analysis.key_takeaways.map((point, idx) => (
                    <Chip
                      key={idx}
                      label={point}
                      color="primary"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Session Details</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Session Type: {recording.analysis.session_type}
                </Typography>
                <Typography paragraph>{recording.analysis.session_summary}</Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Player Analysis</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {recording.analysis.players.map((player) => (
                  <Box key={player.name}>
                    <Typography variant="h6" gutterBottom>
                      {player.name}
                    </Typography>
                    <List dense>
                      {player.observations.map((obs, idx) => (
                        <ListItem key={idx}>
                          <ListItemText primary={obs} />
                        </ListItem>
                      ))}
                    </List>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {player.skills.map((skill, idx) => (
                        <Chip
                          key={idx}
                          label={skill}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                    <Divider sx={{ my: 2 }} />
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Team Analysis</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" gutterBottom>
                  Performance
                </Typography>
                <Typography paragraph>{recording.analysis.team_analysis.performance}</Typography>
                
                <Typography variant="subtitle1" gutterBottom>
                  Chemistry
                </Typography>
                <Typography paragraph>{recording.analysis.team_analysis.chemistry}</Typography>
                
                <Typography variant="subtitle1" gutterBottom>
                  Offense
                </Typography>
                <Typography paragraph>{recording.analysis.team_analysis.offense}</Typography>
                
                <Typography variant="subtitle1" gutterBottom>
                  Defense
                </Typography>
                <Typography paragraph>{recording.analysis.team_analysis.defense}</Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Raw Transcript</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body2"
                  sx={{ fontStyle: 'italic' }}
                >
                  {recording.transcript}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Paper>
        ))}
      </Box>
    </Container>
  );
};

export default RecordFeedback; 