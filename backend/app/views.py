
import base64
import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from groq import Groq
from django.conf import settings

# Initialize Groq client
try:
    if settings.GROQ_API_KEY:
        groq_client = Groq(api_key=settings.GROQ_API_KEY)
        print("Groq API configured successfully")
    else:
        print("Warning: GROQ_API_KEY not found in settings")
        groq_client = None
except Exception as e:
    print(f"Warning: Could not initialize Groq client: {e}")
    groq_client = None

class ChatbotAPIView(APIView):
    def get(self, request):
        """Health check endpoint"""
        return Response({
            "status": "OK", 
            "message": "Chatbot API is running",
            "groq_configured": bool(groq_client)
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
            text_for_groq = "Hello, I sent you a voice message. Please respond appropriately."
            
            # Call Groq API for response generation
            response_text = self.call_groq_api(text_for_groq, user_lang)
            
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
    
    def call_groq_api(self, prompt, language="en"):
        if not groq_client:
            return "Groq API service not available. Please check your API key configuration."
        
        try:
            # Create language-specific prompt
            language_names = {"en": "English", "es": "Spanish", "fr": "French"}
            lang_name = language_names.get(language, "English")
            
            full_prompt = f"Please respond in {lang_name} to this message: {prompt}"
            
            response = groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": full_prompt
                    }
                ],
                model="llama3-8b-8192",
                max_tokens=150,
                temperature=0.7,
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Groq API error: {e}")
            return f"I'm sorry, I encountered an error while processing your request: {str(e)}"
