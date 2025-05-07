import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { QuizState } from '@/types';

export function useQuizState(sessionId: string | undefined) {
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !sessionId) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'QUIZ_STATE_UPDATE' && data.payload.sessionId === sessionId) {
          setQuizState(data.payload);
          setIsLoading(false);
        } else if (data.type === 'ERROR') {
          setError(data.payload.message);
          setIsLoading(false);
        }
      } catch (e) {
        console.error('Failed to parse websocket message', e);
        setError('Failed to parse server response');
        setIsLoading(false);
      }
    };

    socket.addEventListener('message', handleMessage);

    // Request current quiz state
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'GET_QUIZ_STATE',
        payload: { sessionId }
      }));
    } else {
      socket.addEventListener('open', () => {
        socket.send(JSON.stringify({
          type: 'GET_QUIZ_STATE',
          payload: { sessionId }
        }));
      });
    }

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [sessionId, socket]);

  return { quizState, isLoading, error };
}
