
import base64
import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .services import VoiceChatbotService

# Initialize the voice chatbot service
voice_service = VoiceChatbotService()

class ChatbotAPIView(APIView):
    def get(self, request):
        """Health check endpoint"""
        return Response({
            "status": "OK", 
            "message": "Multilingual Voice Chatbot API is running",
            "groq_configured": bool(voice_service.groq_client),
            "google_cloud_configured": bool(voice_service.speech_client and voice_service.tts_client),
            "supported_languages": ["en", "es", "fr"],
            "features": [
                "Speech-to-Text",
                "Text-to-Speech", 
                "Language Translation",
                "Groq AI Integration"
            ]
        })
    
    def post(self, request):
        """Process voice message with full STT/TTS/Translation workflow"""
        try:
            audio_b64 = request.data.get("audio")
            user_lang = request.data.get("language", "en")
            
            if not audio_b64:
                return Response({"error": "No audio provided."}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Validate language
            supported_languages = ["en", "es", "fr"]
            if user_lang not in supported_languages:
                return Response({"error": f"Unsupported language: {user_lang}. Supported: {supported_languages}"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Decode audio data
            try:
                audio_data = base64.b64decode(audio_b64)
            except Exception as e:
                return Response({"error": f"Invalid audio data: {str(e)}"}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            print(f"Processing voice message in language: {user_lang}")
            print(f"Audio data size: {len(audio_data)} bytes")
            
            # Process through complete workflow
            result = voice_service.process_voice_message(audio_data, user_lang)
            
            return Response({
                "user_text": result["user_text"],
                "response_text": result["response_text"],
                "response_audio": result["response_audio"],
                "language": user_lang,
                "workflow_completed": True
            })
            
        except Exception as e:
            print(f"Error in ChatbotAPIView: {e}")
            return Response({"error": str(e)}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LanguageTestAPIView(APIView):
    """Test endpoint for language capabilities"""
    def post(self, request):
        try:
            text = request.data.get("text", "Hello, how are you?")
            source_lang = request.data.get("source_language", "en")
            target_lang = request.data.get("target_language", "es")
            
            # Test translation
            translated = voice_service.translate_text(text, target_lang, source_lang)
            
            # Test Groq response
            groq_response = voice_service.get_groq_response(translated, target_lang)
            
            # Test TTS
            lang_mapping = {
                "en": "en-US",
                "es": "es-ES", 
                "fr": "fr-FR"
            }
            
            tts_audio = voice_service.text_to_speech(
                groq_response, 
                lang_mapping.get(target_lang, "en-US")
            )
            
            return Response({
                "original_text": text,
                "translated_text": translated,
                "ai_response": groq_response,
                "audio_generated": bool(tts_audio),
                "source_language": source_lang,
                "target_language": target_lang
            })
            
        except Exception as e:
            return Response({"error": str(e)}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
