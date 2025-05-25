
# Multilingual Voice Chatbot with Groq API

A modern voice chatbot that supports multilingual conversations using Groq API for language processing, Google Cloud services for speech recognition and synthesis, and real-time voice interaction.

## Features

- 🎙️ Real-time voice recording and playback
- 🌍 Multilingual support (English, Spanish, French)
- 🤖 Powered by Groq API for intelligent responses
- 🎵 High-quality text-to-speech synthesis
- 📱 Responsive modern UI with gradient backgrounds
- 🔄 Real-time translation between languages

## Architecture

### Frontend (React + TypeScript)
- Modern voice recording interface
- Real-time audio visualization
- Chat message history with audio playback
- Language selection and management

### Backend (Django REST API)
- Speech-to-Text using Google Cloud Speech API
- Text-to-Speech using Google Cloud TTS API
- Language translation using Google Translate API
- Groq API integration for intelligent responses
- RESTful API for frontend communication

## Setup Instructions

### Prerequisites
- Node.js (v16+) and npm
- Python 3.8+
- Google Cloud account with Speech, TTS, and Translate APIs enabled
- Groq API key

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and credentials
   ```

5. **Configure Google Cloud credentials:**
   - Download your Google Cloud service account JSON file
   - Set the path in your .env file or export as environment variable:
     ```bash
     export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/credentials.json"
     ```

6. **Run Django migrations:**
   ```bash
   python manage.py migrate
   ```

7. **Start the backend server:**
   ```bash
   python manage.py runserver
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## API Configuration

### Required API Keys

1. **Groq API Key:**
   - Sign up at [https://console.groq.com](https://console.groq.com)
   - Create an API key
   - Add to your backend .env file

2. **Google Cloud APIs:**
   - Enable Speech-to-Text API
   - Enable Text-to-Speech API  
   - Enable Cloud Translation API
   - Create service account and download JSON credentials

### Environment Variables

```bash
# Backend .env file
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_APPLICATION_CREDENTIALS=path/to/google-credentials.json
DEBUG=True
SECRET_KEY=your-django-secret-key
```

## Usage

1. **Start both servers** (backend on :8000, frontend on :5173)
2. **Select your preferred language** from the dropdown
3. **Click the microphone button** to start recording
4. **Speak your message** clearly
5. **Click stop** to send your message to the AI
6. **Listen to the AI response** which will be played automatically

## Supported Languages

- English (en) 🇺🇸
- Spanish (es) 🇪🇸  
- French (fr) 🇫🇷

The system automatically translates between languages, so you can speak in your preferred language and receive responses in the same language.

## Technology Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- Web Audio API for recording
- Lucide React for icons

### Backend
- Django 4+ with Django REST Framework
- Google Cloud Speech-to-Text API
- Google Cloud Text-to-Speech API
- Google Cloud Translation API
- Groq API for language model
- CORS support for frontend communication

## Troubleshooting

### Common Issues

1. **Microphone not working:**
   - Ensure browser permissions for microphone access
   - Check if HTTPS is required in production

2. **Backend connection errors:**
   - Verify Django server is running on port 8000
   - Check CORS settings in Django settings.py

3. **Google Cloud API errors:**
   - Verify API keys and credentials are correctly set
   - Ensure all required APIs are enabled in Google Cloud Console

4. **Groq API errors:**
   - Check your API key is valid and has sufficient quota
   - Verify the model name is correct

### Performance Tips

- Use a good quality microphone for better speech recognition
- Speak clearly and avoid background noise
- Ensure stable internet connection for API calls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
