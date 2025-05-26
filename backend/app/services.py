
import base64
import io
import json
from google.cloud import speech
from google.cloud import texttospeech
from google.cloud import translate_v2 as translate
from groq import Groq
from django.conf import settings

class VoiceChatbotService:
    def __init__(self):
        self.groq_client = None
        self.speech_client = None
        self.tts_client = None
        self.translate_client = None
        
        # Initialize Groq client
        if settings.GROQ_API_KEY:
            self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
            print("Groq API configured successfully")
        else:
            print("Warning: GROQ_API_KEY not found")
            
        # Initialize Google Cloud clients (if credentials available)
        try:
            self.speech_client = speech.SpeechClient()
            self.tts_client = texttospeech.TextToSpeechClient()
            self.translate_client = translate.Client()
            print("Google Cloud APIs configured successfully")
        except Exception as e:
            print(f"Google Cloud APIs not configured: {e}")
    
    def speech_to_text(self, audio_data, language_code="en-US"):
        """Convert speech to text using Google Cloud Speech-to-Text"""
        if not self.speech_client:
            # Fallback: simulate STT for demo purposes
            return "Hello, I sent you a voice message. Please respond appropriately."
        
        try:
            # Configure speech recognition
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
                sample_rate_hertz=48000,
                language_code=language_code,
                alternative_language_codes=["es-ES", "fr-FR"],
                enable_automatic_punctuation=True,
            )
            
            audio = speech.RecognitionAudio(content=audio_data)
            
            # Perform speech recognition
            response = self.speech_client.recognize(config=config, audio=audio)
            
            if response.results:
                transcript = response.results[0].alternatives[0].transcript
                confidence = response.results[0].alternatives[0].confidence
                print(f"Speech-to-Text: {transcript} (confidence: {confidence})")
                return transcript
            else:
                return "Sorry, I couldn't understand what you said."
                
        except Exception as e:
            print(f"Speech-to-Text error: {e}")
            return "I had trouble processing your voice message."
    
    def text_to_speech(self, text, language_code="en-US", voice_name=None):
        """Convert text to speech using Google Cloud Text-to-Speech"""
        if not self.tts_client:
            # Return empty audio for demo purposes
            return ""
        
        try:
            # Set voice parameters based on language
            voice_params = {
                "en-US": {"name": "en-US-Wavenet-D", "ssml_gender": texttospeech.SsmlVoiceGender.NEUTRAL},
                "es-ES": {"name": "es-ES-Wavenet-B", "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE},
                "fr-FR": {"name": "fr-FR-Wavenet-C", "ssml_gender": texttospeech.SsmlVoiceGender.FEMALE},
            }
            
            voice_config = voice_params.get(language_code, voice_params["en-US"])
            
            synthesis_input = texttospeech.SynthesisInput(text=text)
            voice = texttospeech.VoiceSelectionParams(
                language_code=language_code,
                name=voice_config["name"],
                ssml_gender=voice_config["ssml_gender"]
            )
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3
            )
            
            response = self.tts_client.synthesize_speech(
                input=synthesis_input, voice=voice, audio_config=audio_config
            )
            
            # Convert to base64 for frontend
            audio_base64 = base64.b64encode(response.audio_content).decode('utf-8')
            return audio_base64
            
        except Exception as e:
            print(f"Text-to-Speech error: {e}")
            return ""
    
    def translate_text(self, text, target_language="en", source_language=None):
        """Translate text using Google Translate"""
        if not self.translate_client:
            # Return original text if translation not available
            return text
        
        try:
            if source_language:
                result = self.translate_client.translate(
                    text, 
                    target_language=target_language,
                    source_language=source_language
                )
            else:
                result = self.translate_client.translate(
                    text, 
                    target_language=target_language
                )
            
            translated_text = result['translatedText']
            detected_language = result.get('detectedSourceLanguage', source_language)
            
            print(f"Translation: '{text}' -> '{translated_text}' ({detected_language} -> {target_language})")
            return translated_text
            
        except Exception as e:
            print(f"Translation error: {e}")
            return text
    
    def get_groq_response(self, text, language="en"):
        """Get response from Groq API"""
        if not self.groq_client:
            return "Groq API service not available. Please check your API key configuration."
        
        try:
            # Language-specific prompts
            language_prompts = {
                "en": f"You are a helpful AI assistant. Respond naturally and conversationally in English to: {text}",
                "es": f"Eres un asistente de IA útil. Responde de forma natural y conversacional en español a: {text}",
                "fr": f"Vous êtes un assistant IA utile. Répondez de manière naturelle et conversationnelle en français à: {text}"
            }
            
            prompt = language_prompts.get(language, language_prompts["en"])
            
            response = self.groq_client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama3-8b-8192",
                max_tokens=200,
                temperature=0.7,
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Groq API error: {e}")
            return f"I'm sorry, I encountered an error while processing your request: {str(e)}"
    
    def process_voice_message(self, audio_data, user_language="en"):
        """Complete workflow: STT -> Translation -> Groq -> Translation -> TTS"""
        try:
            # Language mapping
            lang_mapping = {
                "en": {"speech": "en-US", "translate": "en"},
                "es": {"speech": "es-ES", "translate": "es"},
                "fr": {"speech": "fr-FR", "translate": "fr"}
            }
            
            user_lang_config = lang_mapping.get(user_language, lang_mapping["en"])
            
            # Step 1: Speech to Text
            print(f"Step 1: Converting speech to text (language: {user_lang_config['speech']})")
            user_text = self.speech_to_text(audio_data, user_lang_config["speech"])
            
            # Step 2: Translate to English for Groq (if needed)
            if user_language != "en":
                print(f"Step 2: Translating '{user_text}' to English")
                english_text = self.translate_text(user_text, "en", user_lang_config["translate"])
            else:
                english_text = user_text
            
            # Step 3: Get Groq response
            print(f"Step 3: Getting Groq response for '{english_text}'")
            groq_response = self.get_groq_response(english_text, "en")
            
            # Step 4: Translate response back to user language (if needed)
            if user_language != "en":
                print(f"Step 4: Translating response back to {user_language}")
                final_response = self.translate_text(groq_response, user_lang_config["translate"], "en")
            else:
                final_response = groq_response
            
            # Step 5: Text to Speech
            print(f"Step 5: Converting response to speech")
            response_audio = self.text_to_speech(final_response, user_lang_config["speech"])
            
            return {
                "user_text": user_text,
                "response_text": final_response,
                "response_audio": response_audio
            }
            
        except Exception as e:
            print(f"Error in voice processing workflow: {e}")
            return {
                "user_text": "Error processing voice",
                "response_text": f"Sorry, I encountered an error: {str(e)}",
                "response_audio": ""
            }
