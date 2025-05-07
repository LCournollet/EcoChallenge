import { useState, useEffect } from 'react';
import { WS_URL } from "@/lib/config";

export function useSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.addEventListener('open', () => {
      console.log('WebSocket connection established');
    });

    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.addEventListener('close', (event) => {
      if (event.wasClean) {
        console.log(`WebSocket closed cleanly: code=${event.code}, reason=${event.reason}`);
      } else {
        console.warn('WebSocket connection died unexpectedly');
      }
    });

    setSocket(ws);

    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);

  return socket;
}
