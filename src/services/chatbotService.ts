
const BACKEND_URL = 'http://localhost:8000/api';

export interface ChatbotRequest {
  audio: string;
  language: string;
}

export interface ChatbotResponse {
  response_audio: string;
  response_text: string;
}

export const chatbotService = {
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
          
          const response = await fetch(`${BACKEND_URL}/chatbot/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data: ChatbotResponse = await response.json();
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsDataURL(audioBlob);
    });
  }
};
