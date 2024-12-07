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

The application can run in two modes: test mode and production mode.

### Test Mode (No API Key Required)

Test mode uses mock responses and doesn't require an OpenAI API key. This is perfect for development and UI testing.

```bash
# Run in test mode (default)
npm run dev

# Or explicitly specify test mode
npm run dev:test
```

### Production Mode (Requires API Key)

Production mode uses the actual OpenAI API for voice transcription and analysis.

1. Ensure your OpenAI API key is set in `.env`
2. Run the development server in production mode:
```bash
npm run dev:prod
```

### Building for Production

```bash
# Build with test mode
npm run build:test

# Build for production (requires API key)
npm run build:prod
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
