
import base64
import io
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from google.cloud import speech_v1p1beta1 as speech
from google.cloud import texttospeech
from google.cloud import translate_v2 as translate
import google.generativeai as genai
from django.conf import settings

# Initialize clients
try:
    speech_client = speech.SpeechClient()
    tts_client = texttospeech.TextToSpeechClient()
    translate_client = translate.Client()
    genai.configure(api_key=settings.GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-pro')
except Exception as e:
    print(f"Warning: Could not initialize all clients: {e}")
    speech_client = None
    tts_client = None
    translate_client = None
    gemini_model = None

class ChatbotAPIView(APIView):
    def post(self, request):
        try:
            audio_b64 = request.data.get("audio")
            user_lang = request.data.get("language", "en")
            
            if not audio_b64:
                return Response({"error": "No audio provided."}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Decode audio
            audio_content = base64.b64decode(audio_b64)
            
            # Speech-to-Text
            text = self.speech_to_text(audio_content, user_lang)
            
            if not text:
                return Response({"error": "Could not transcribe audio."}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Translate user input to English for Gemini API if needed
            text_for_gemini = text if user_lang == "en" else self.translate_text(text, "en")
            
            # Call Gemini API for response generation
            response_text_en = self.call_gemini_api(text_for_gemini)
            
            # Translate response back to user language if needed
            response_text = response_text_en if user_lang == "en" else self.translate_text(response_text_en, user_lang)
            
            # Text-to-Speech
            audio_response_b64 = self.text_to_speech(response_text, user_lang)
            
            return Response({
                "response_audio": audio_response_b64,
                "response_text": response_text
            })
            
        except Exception as e:
            print(f"Error in ChatbotAPIView: {e}")
            return Response({"error": str(e)}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def speech_to_text(self, audio_content, language_code):
        if not speech_client:
            return "Speech-to-text service not available"
        
        try:
            audio = speech.RecognitionAudio(content=audio_content)
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
                language_code=language_code,
                audio_channel_count=1,
                sample_rate_hertz=48000,
                alternative_language_codes=[language_code + "-US"] if language_code == "en" else [],
            )
            
            response = speech_client.recognize(config=config, audio=audio)
            transcripts = [result.alternatives[0].transcript for result in response.results if result.alternatives]
            
            return " ".join(transcripts) if transcripts else "Could not transcribe audio"
            
        except Exception as e:
            print(f"Speech-to-text error: {e}")
            return f"Error in speech recognition: {str(e)}"
    
    def translate_text(self, text, target_lang):
        if not translate_client:
            return text
        
        try:
            result = translate_client.translate(text, target_language=target_lang)
            return result['translatedText']
        except Exception as e:
            print(f"Translation error: {e}")
            return text
    
    def call_gemini_api(self, prompt):
        if not gemini_model:
            return "Gemini API service not available"
        
        try:
            response = gemini_model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=150,
                    temperature=0.7,
                )
            )
            
            return response.text
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            return f"I'm sorry, I encountered an error: {str(e)}"
    
    def text_to_speech(self, text, language_code):
        if not tts_client:
            return ""
        
        try:
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            voice = texttospeech.VoiceSelectionParams(
                language_code=language_code,
                ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
            )
            
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3
            )
            
            response = tts_client.synthesize_speech(
                input=synthesis_input, 
                voice=voice, 
                audio_config=audio_config
            )
            
            return base64.b64encode(response.audio_content).decode("utf-8")
            
        except Exception as e:
            print(f"Text-to-speech error: {e}")
            return ""
