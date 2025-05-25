
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
          
          console.log('Sending request to backend:', `${BACKEND_URL}/chatbot/`);
          console.log('Payload language:', language);
          
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
          console.log('Received response from backend:', data.response_text);
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
  }
};
