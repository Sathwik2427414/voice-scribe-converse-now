
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Send, Volume2, Loader2, AlertCircle } from 'lucide-react';
import ChatMessage from './ChatMessage';
import VoiceRecorder from './VoiceRecorder';
import AudioPlayer from './AudioPlayer';
import { useToast } from '@/hooks/use-toast';
import { chatbotService } from '../services/chatbotService';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  audio?: string;
  timestamp: Date;
}

const VoiceChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  // Check backend status on mount
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/chatbot/', {
          method: 'GET',
        });
        setBackendStatus('connected');
      } catch (error) {
        setBackendStatus('disconnected');
        console.error('Backend connection check failed:', error);
      }
    };

    checkBackendStatus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert blob to base64 for user message
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        
        // Add user message
        const userMessage: Message = {
          id: Date.now().toString(),
          type: 'user',
          text: 'Voice message...',
          audio: base64Audio,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, userMessage]);
      };
      reader.readAsDataURL(audioBlob);
      
      // Send to backend
      const response = await chatbotService.sendVoiceMessage(audioBlob, selectedLanguage);
      
      // Create audio URL from base64
      const audioUrl = `data:audio/mp3;base64,${response.response_audio}`;
      
      // Add bot response
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: response.response_text,
        audio: audioUrl,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsProcessing(false);
      setBackendStatus('connected');
      
      toast({
        title: "Response ready",
        description: "AI has responded to your message",
      });
      
    } catch (error) {
      console.error('Error processing audio:', error);
      setIsProcessing(false);
      setBackendStatus('disconnected');
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure the Django backend is running on localhost:8000 with proper API keys configured.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Failed to connect to backend. Check if Django server is running.",
        variant: "destructive",
      });
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast({
      title: "Chat cleared",
      description: "All messages have been removed",
    });
  };

  const BackendStatusIndicator = () => {
    switch (backendStatus) {
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Checking backend...</span>
          </div>
        );
      case 'connected':
        return (
          <div className="flex items-center gap-2 text-green-600">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Backend connected</span>
          </div>
        );
      case 'disconnected':
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Backend disconnected</span>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 h-screen flex flex-col">
      {/* Header */}
      <Card className="mb-4 p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Multilingual Voice AI Assistant
            </h1>
            <p className="text-gray-600 mt-1">Powered by Gemini API - Speak naturally in your preferred language</p>
            <BackendStatusIndicator />
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={clearChat} size="sm">
              Clear Chat
            </Button>
          </div>
        </div>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 mb-4 p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
        <div className="h-full overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Mic className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg">Start a conversation by recording your voice</p>
                <p className="text-sm mt-2">Press and hold the microphone button to record</p>
                {backendStatus === 'disconnected' && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">Backend Server Not Running</p>
                    <p className="text-red-600 text-sm mt-1">
                      Please start the Django backend on localhost:8000
                    </p>
                    <p className="text-red-600 text-xs mt-2">
                      Run: <code className="bg-red-100 px-1 rounded">cd backend && python manage.py runserver</code>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <Card className="p-4 bg-gray-100 max-w-xs">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">Gemini AI is thinking...</span>
                </div>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </Card>

      {/* Voice Controls */}
      <VoiceRecorder
        isRecording={isRecording}
        onRecordingChange={setIsRecording}
        onRecordingComplete={handleRecordingComplete}
        language={selectedLanguage}
      />
    </div>
  );
};

export default VoiceChatbot;
