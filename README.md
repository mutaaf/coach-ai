# Basketball Scout Hub 🏀

A modern web application for basketball coaches and scouts to record, analyze, and track player development through AI-powered voice notes.

## Features

- 🎙️ **Voice Recording**: Capture session feedback in real-time
- 🤖 **AI Analysis**: Automatic extraction of player insights and team dynamics
- 📊 **Player Dashboard**: Track progress and development over time
- 📈 **Team Analytics**: Understand team dynamics and patterns
- 💾 **Local Storage**: All data persisted locally for privacy

## Prerequisites

- Node.js version 18.0.0 or higher
- npm version 8.0.0 or higher
- Modern web browser with microphone support
- OpenAI API key (for production use)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd basketball-scout-hub
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

## Development

### Running in Test Mode (No API Key Required)

1. Open `src/services/aiService.jsx`
2. Ensure `TEST_MODE = true` at the top of the file
3. Start the development server:
```bash
npm run dev
```

### Running in Production Mode

1. Set up your OpenAI API key in `.env`
2. Open `src/services/aiService.jsx`
3. Set `TEST_MODE = false`
4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
basketball-scout-hub/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.jsx      # Main layout with navigation
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Players.jsx     # Player table and details
│   │   ├── RecordFeedback.jsx  # Voice recording interface
│   │   └── ...
│   ├── services/           # Business logic and API calls
│   │   ├── aiService.jsx   # OpenAI integration
│   │   └── storageService.jsx  # Local storage management
│   ├── App.jsx            # Main application component
│   └── index.css          # Global styles
├── .env                   # Environment variables
├── package.json          # Dependencies and scripts
└── README.md            # Documentation
```

## Features in Detail

### Voice Recording
- Start/stop recording with a single click
- Automatic transcription (using OpenAI Whisper in production)
- Progress indicators during processing

### AI Analysis
- Player identification from speech
- Skill assessment and categorization
- Team dynamics analysis
- Key takeaways extraction

### Player Dashboard
- Individual player cards
- Progress tracking
- Skill frequency analysis
- Recent highlights

### Data Storage
- Local storage for privacy
- Structured data format
- Easy export/import (coming soon)

## Development Guidelines

### Adding New Features
1. Create feature branch: `git checkout -b feature/your-feature`
2. Implement changes
3. Test in both test and production modes
4. Create pull request

### Testing
- Test voice recording in different environments
- Verify data persistence
- Check mobile responsiveness
- Test with and without API key

### Code Style
- Use functional components
- Follow Material-UI patterns
- Implement proper error handling
- Add JSDoc comments for complex functions

## Troubleshooting

### Common Issues

1. **Microphone Access**
   - Ensure browser has microphone permissions
   - Check browser compatibility
   - Verify no other apps are using microphone

2. **API Rate Limits**
   - Switch to test mode for development
   - Implement proper error handling
   - Check OpenAI quota and billing

3. **Storage Issues**
   - Clear browser cache if needed
   - Check localStorage quota
   - Export data before clearing

## Future Enhancements

- [ ] Cloud sync capabilities
- [ ] Advanced analytics dashboard
- [ ] Video recording integration
- [ ] Team collaboration features
- [ ] Custom AI model training
- [ ] Data export/import tools

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - See LICENSE file for details
