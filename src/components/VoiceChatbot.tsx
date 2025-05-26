
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import VoiceRecorder from './VoiceRecorder';
import BackendStatus from './BackendStatus';
import { useToast } from '@/hooks/use-toast';
import { chatbotService } from '../services/chatbotService';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  audio?: string;
  timestamp: Date;
  language?: string;
}

const VoiceChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert blob to base64 for user message display
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
          language: selectedLanguage,
        };
        
        setMessages(prev => [...prev, userMessage]);
      };
      reader.readAsDataURL(audioBlob);
      
      // Send to backend for full processing
      console.log('Sending voice message for processing...');
      const response = await chatbotService.sendVoiceMessage(audioBlob, selectedLanguage);
      
      // Update user message with transcribed text
      setMessages(prev => prev.map(msg => 
        msg.id === Date.now().toString() 
          ? { ...msg, text: response.user_text || 'Voice message processed' }
          : msg
      ));
      
      // Create audio URL from base64 if available
      const audioUrl = response.response_audio 
        ? `data:audio/mp3;base64,${response.response_audio}` 
        : undefined;
      
      // Add bot response
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: response.response_text,
        audio: audioUrl,
        timestamp: new Date(),
        language: response.language,
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsProcessing(false);
      
      toast({
        title: "Response Ready",
        description: `AI responded in ${selectedLanguage.toUpperCase()}`,
      });
      
    } catch (error) {
      console.error('Error processing voice message:', error);
      setIsProcessing(false);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure the Django backend is running with proper API configuration.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Processing Error",
        description: "Failed to process voice message",
        variant: "destructive",
      });
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "All messages have been removed",
    });
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
            <p className="text-gray-600 mt-1">Powered by Groq API with Speech-to-Text & Text-to-Speech</p>
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

      {/* Backend Status */}
      <div className="mb-4">
        <BackendStatus />
      </div>

      {/* Chat Messages */}
      <Card className="flex-1 mb-4 p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
        <div className="h-full overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">🎙️</div>
                <p className="text-lg">Start a multilingual conversation</p>
                <p className="text-sm mt-2">Press and hold the microphone to record in {languages.find(l => l.code === selectedLanguage)?.name}</p>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <p className="font-medium text-blue-800">Workflow:</p>
                  <p className="text-blue-700">Speech → Text → Translation → Groq AI → Translation → Speech</p>
                </div>
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
                  <span className="text-sm text-gray-600">Processing voice message...</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">STT → Translation → Groq → TTS</p>
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
