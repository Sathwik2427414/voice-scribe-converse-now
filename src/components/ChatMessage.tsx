
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, User, Bot } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  audio?: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <Card className={`p-4 max-w-xs lg:max-w-md ${
        isUser 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`rounded-full p-2 ${
            isUser ? 'bg-white/20' : 'bg-gray-100'
          }`}>
            {isUser ? (
              <User className={`h-4 w-4 ${isUser ? 'text-white' : 'text-gray-600'}`} />
            ) : (
              <Bot className={`h-4 w-4 ${isUser ? 'text-white' : 'text-gray-600'}`} />
            )}
          </div>
          
          <div className="flex-1">
            <p className={`text-sm ${isUser ? 'text-white' : 'text-gray-800'}`}>
              {message.text}
            </p>
            
            {message.audio && (
              <div className="mt-2">
                <AudioPlayer audioSrc={message.audio} isUser={isUser} />
              </div>
            )}
            
            <p className={`text-xs mt-2 ${
              isUser ? 'text-white/70' : 'text-gray-500'
            }`}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatMessage;
