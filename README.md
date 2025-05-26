
# Multilingual Voice Chatbot with Groq API

A comprehensive multilingual voice chatbot that implements the complete STT → Translation → AI → Translation → TTS workflow using Groq API for intelligent responses and Google Cloud services for speech processing.

## 🎯 Project Overview

This project fulfills all the requirements for a multilingual voice chatbot:

### ✅ Core Functionality Implemented
- **Groq Model API Integration**: Uses llama3-8b-8192 model for natural language understanding
- **Speech-to-Text (STT)**: Google Cloud Speech API with multi-language support
- **Text-to-Speech (TTS)**: Google Cloud Text-to-Speech with natural voices
- **Language Translation**: Google Cloud Translate API for seamless communication
- **Real-time Voice Processing**: Complete workflow automation

### 🗣️ Supported Languages
- **English** (en) 🇺🇸 - Primary language
- **Spanish** (es) 🇪🇸 - Full translation support
- **French** (fr) 🇫🇷 - Full translation support

### 🔄 Complete Workflow
1. **User speaks** in their preferred language
2. **STT converts** voice to text using Google Cloud Speech
3. **Translation** (if needed) to English for Groq processing
4. **Groq AI** generates intelligent response
5. **Translation back** to user's language (if needed)
6. **TTS converts** response to speech using Google Cloud
7. **Audio playback** to user

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Groq API Key (provided: `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`)
- Google Cloud Account (optional - has fallback mode)

### Backend Setup (Django)

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Start backend server:**
   ```bash
   python manage.py runserver
   ```
   
   Backend runs on `http://localhost:8000`

### Frontend Setup (React)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Frontend runs on `http://localhost:5173`

## 🔧 Configuration

### API Keys Required

1. **Groq API** (Already configured):
   - API Key: `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`
   - Used for: AI response generation

2. **Google Cloud APIs** (Optional - has fallback):
   - Speech-to-Text API
   - Text-to-Speech API  
   - Translation API
   - Setup: Download service account JSON and set `GOOGLE_APPLICATION_CREDENTIALS`

### Environment Variables
```bash
# backend/.env
GROQ_API_KEY=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
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credentials.json  # Optional
DEBUG=True
SECRET_KEY=your-secret-key
```

## 🎮 Usage

1. **Start both servers** (backend:8000, frontend:5173)
2. **Check status** - Green indicator shows backend connection
3. **Select language** from dropdown (English/Spanish/French)  
4. **Record voice** - Hold microphone button and speak
5. **Get AI response** - Automatic processing through full workflow
6. **Listen to response** - AI speaks back in your language

## 🏗️ Architecture

### Backend Components
- **VoiceChatbotService**: Core service handling complete workflow
- **ChatbotAPIView**: REST API endpoints for voice processing
- **LanguageTestAPIView**: Testing endpoint for language features
- **Google Cloud Integration**: STT, TTS, and Translation services
- **Groq Integration**: AI response generation

### Frontend Components
- **VoiceChatbot**: Main chat interface
- **VoiceRecorder**: Audio recording with visualization
- **ChatMessage**: Message display with audio playback
- **BackendStatus**: Real-time backend health monitoring
- **AudioPlayer**: Audio playback controls

### API Endpoints
- `GET /api/chatbot/` - Health check and feature status
- `POST /api/chatbot/` - Process voice message (complete workflow)
- `POST /api/test-language/` - Test translation and TTS features

## 🔍 Features

### Complete STT/TTS/Translation Workflow
- Automatic language detection
- Real-time speech processing
- Intelligent response generation
- Natural voice synthesis

### Backend Health Monitoring
- Real-time connection status
- API configuration validation
- Feature availability checking
- Automatic fallback modes

### Multi-language Support
- Native speech recognition per language
- Intelligent translation between languages
- Language-specific voice synthesis
- Cultural context awareness

### Advanced Audio Processing
- High-quality audio recording (16kHz, mono)
- Real-time audio level visualization
- Noise suppression and echo cancellation
- Optimized audio compression

## 🧪 Testing

### Voice Message Testing
1. Select different languages
2. Record voice messages
3. Verify transcription accuracy
4. Check translation quality
5. Test TTS voice quality

### Language Feature Testing
Use the test endpoint:
```bash
curl -X POST http://localhost:8000/api/test-language/ \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, how are you?",
    "source_language": "en",
    "target_language": "es"
  }'
```

## 🔧 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Ensure Django server is running on port 8000
   - Check firewall and CORS settings

2. **Groq API Errors**
   - Verify API key is correct and active
   - Check API quota and rate limits

3. **Google Cloud Issues**
   - Download and configure service account JSON
   - Enable required APIs in Google Cloud Console
   - App works in fallback mode without Google Cloud

4. **Audio Recording Problems**
   - Grant microphone permissions in browser
   - Use HTTPS in production for audio access
   - Check audio device settings

### Backend Status Indicators
- 🟢 **Green**: All systems operational
- 🟡 **Yellow**: Partial functionality (Groq only)
- 🔴 **Red**: Backend disconnected

## 📝 Development Notes

### Technology Stack
- **Backend**: Django 4+, Django REST Framework
- **AI Model**: Groq llama3-8b-8192
- **Speech Services**: Google Cloud Speech/TTS APIs
- **Translation**: Google Cloud Translate API
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Audio**: Web Audio API, MediaRecorder API

### Performance Optimizations
- Efficient audio encoding (WebM Opus)
- Streaming audio processing
- Intelligent caching
- Optimized API calls

## 🎯 Next Steps

1. **Add more languages** (German, Italian, Portuguese)
2. **Implement conversation memory** for context awareness
3. **Add voice cloning** for personalized responses
4. **Deploy to cloud** with scalable infrastructure
5. **Add real-time translation** during conversation

## 📄 License

MIT License - Feel free to use and modify for your projects.

---

**Ready to use!** Your Groq API key is configured and the system supports the complete multilingual voice workflow. Start both servers and begin conversing in multiple languages! 🌍🎙️
