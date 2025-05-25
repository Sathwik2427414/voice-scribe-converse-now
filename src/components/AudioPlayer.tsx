
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioPlayerProps {
  audioSrc: string;
  isUser: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc, isUser }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-2 mt-2">
      <audio ref={audioRef} src={audioSrc} preload="metadata" />
      
      <Button
        size="sm"
        variant="ghost"
        onClick={togglePlayPause}
        className={`h-8 w-8 p-0 ${
          isUser ? 'hover:bg-white/20' : 'hover:bg-gray-100'
        }`}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      
      <div className="flex-1 min-w-0">
        <div className={`h-1 rounded-full ${
          isUser ? 'bg-white/30' : 'bg-gray-200'
        } relative overflow-hidden`}>
          <div
            className={`h-full rounded-full transition-all duration-100 ${
              isUser ? 'bg-white' : 'bg-blue-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      <div className={`text-xs ${
        isUser ? 'text-white/70' : 'text-gray-500'
      }`}>
        {formatTime(duration)}
      </div>
      
      <Volume2 className={`h-3 w-3 ${
        isUser ? 'text-white/70' : 'text-gray-500'
      }`} />
    </div>
  );
};

export default AudioPlayer;
