
import base64
import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import google.generativeai as genai
from django.conf import settings

# Initialize Gemini client
try:
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel('gemini-pro')
        print("Gemini API configured successfully")
    else:
        print("Warning: GEMINI_API_KEY not found in settings")
        gemini_model = None
except Exception as e:
    print(f"Warning: Could not initialize Gemini client: {e}")
    gemini_model = None

class ChatbotAPIView(APIView):
    def get(self, request):
        """Health check endpoint"""
        return Response({
            "status": "OK", 
            "message": "Chatbot API is running",
            "gemini_configured": bool(gemini_model)
        })
    
    def post(self, request):
        try:
            audio_b64 = request.data.get("audio")
            user_lang = request.data.get("language", "en")
            
            if not audio_b64:
                return Response({"error": "No audio provided."}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # For now, simulate speech-to-text with a placeholder
            # In a full implementation, you'd use Google Cloud Speech-to-Text
            text_for_gemini = "Hello, I sent you a voice message. Please respond appropriately."
            
            # Call Gemini API for response generation
            response_text = self.call_gemini_api(text_for_gemini, user_lang)
            
            # For now, return empty audio (in a full implementation, use Google Cloud TTS)
            audio_response_b64 = ""
            
            return Response({
                "response_audio": audio_response_b64,
                "response_text": response_text
            })
            
        except Exception as e:
            print(f"Error in ChatbotAPIView: {e}")
            return Response({"error": str(e)}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def call_gemini_api(self, prompt, language="en"):
        if not gemini_model:
            return "Gemini API service not available. Please check your API key configuration."
        
        try:
            # Create language-specific prompt
            language_names = {"en": "English", "es": "Spanish", "fr": "French"}
            lang_name = language_names.get(language, "English")
            
            full_prompt = f"Please respond in {lang_name} to this message: {prompt}"
            
            response = gemini_model.generate_content(
                full_prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=150,
                    temperature=0.7,
                )
            )
            
            return response.text
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            return f"I'm sorry, I encountered an error while processing your request: {str(e)}"
