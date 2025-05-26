
const BACKEND_URL = 'http://localhost:8000/api';

export interface ChatbotRequest {
  audio: string;
  language: string;
}

export interface ChatbotResponse {
  user_text: string;
  response_audio: string;
  response_text: string;
  language: string;
  workflow_completed: boolean;
}

export interface LanguageTestRequest {
  text: string;
  source_language: string;
  target_language: string;
}

export interface BackendStatus {
  status: string;
  groq_configured: boolean;
  google_cloud_configured: boolean;
  supported_languages: string[];
  features: string[];
}

export const chatbotService = {
  async getBackendStatus(): Promise<BackendStatus> {
    const response = await fetch(`${BACKEND_URL}/chatbot/`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Backend status check failed: ${response.status}`);
    }
    
    return await response.json();
  },

  async sendVoiceMessage(audioBlob: Blob, language: string): Promise<ChatbotResponse> {
    // Convert blob to base64
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64Audio = reader.result as string;
          const audioBase64 = base64Audio.split(',')[1];
          
          const payload: ChatbotRequest = {
            audio: audioBase64,
            language: language,
          };
          
          console.log('Sending voice message to backend:', `${BACKEND_URL}/chatbot/`);
          console.log('Language:', language);
          console.log('Audio size:', audioBlob.size, 'bytes');
          
          const response = await fetch(`${BACKEND_URL}/chatbot/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          
          console.log('Backend response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend error response:', errorText);
            throw new Error(`Backend error (${response.status}): ${errorText}`);
          }
          
          const data: ChatbotResponse = await response.json();
          console.log('Received response:', {
            user_text: data.user_text,
            response_text: data.response_text,
            language: data.language,
            workflow_completed: data.workflow_completed,
            has_audio: !!data.response_audio
          });
          
          resolve(data);
        } catch (error) {
          console.error('Error in chatbot service:', error);
          if (error instanceof TypeError && error.message.includes('fetch')) {
            reject(new Error('Cannot connect to backend server. Make sure Django is running on localhost:8000'));
          } else {
            reject(error);
          }
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsDataURL(audioBlob);
    });
  },

  async testLanguageFeatures(text: string, sourceLang: string, targetLang: string) {
    const payload: LanguageTestRequest = {
      text,
      source_language: sourceLang,
      target_language: targetLang,
    };
    
    const response = await fetch(`${BACKEND_URL}/test-language/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Language test failed: ${response.status}`);
    }
    
    return await response.json();
  }
};
