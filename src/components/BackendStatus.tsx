
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, AlertCircle, Zap, Mic, Volume2, Globe } from 'lucide-react';
import { chatbotService, BackendStatus as BackendStatusType } from '../services/chatbotService';
import { useToast } from '@/hooks/use-toast';

const BackendStatus = () => {
  const [status, setStatus] = useState<BackendStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const checkStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const statusData = await chatbotService.getBackendStatus();
      setStatus(statusData);
      toast({
        title: "Backend Connected",
        description: "All systems operational",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast({
        title: "Backend Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  if (loading) {
    return (
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
          <span className="text-sm text-yellow-700">Checking backend status...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 bg-red-50 border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">Backend Disconnected</span>
          </div>
          <Button size="sm" variant="outline" onClick={checkStatus}>
            Retry
          </Button>
        </div>
        <p className="text-xs text-red-600 mt-2">{error}</p>
        <div className="mt-3 p-2 bg-red-100 rounded text-xs text-red-800">
          <p><strong>To start the backend:</strong></p>
          <p>1. cd backend</p>
          <p>2. python -m venv venv</p>
          <p>3. source venv/bin/activate</p>
          <p>4. pip install -r requirements.txt</p>
          <p>5. python manage.py runserver</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-green-50 border-green-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">Backend Connected</span>
        </div>
        <Button size="sm" variant="outline" onClick={checkStatus}>
          Refresh
        </Button>
      </div>
      
      {status && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Zap className={`h-3 w-3 ${status.groq_configured ? 'text-green-600' : 'text-red-600'}`} />
              <span className="text-xs">Groq API</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className={`h-3 w-3 ${status.google_cloud_configured ? 'text-green-600' : 'text-yellow-600'}`} />
              <span className="text-xs">Google Cloud</span>
            </div>
            <div className="flex items-center gap-2">
              <Mic className="h-3 w-3 text-blue-600" />
              <span className="text-xs">Speech-to-Text</span>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="h-3 w-3 text-blue-600" />
              <span className="text-xs">Text-to-Speech</span>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-gray-600 mb-1">Supported Languages:</p>
            <div className="flex gap-1">
              {status.supported_languages?.map((lang) => (
                <span key={lang} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {lang.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
          
          {!status.google_cloud_configured && (
            <div className="p-2 bg-yellow-100 border border-yellow-300 rounded text-xs">
              <AlertCircle className="h-3 w-3 text-yellow-600 inline mr-1" />
              <span className="text-yellow-800">
                Google Cloud not configured. Using fallback mode for STT/TTS.
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default BackendStatus;
