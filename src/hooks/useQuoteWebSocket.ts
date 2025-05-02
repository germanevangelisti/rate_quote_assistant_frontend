import { useState, useEffect, useCallback, useRef } from 'react';

interface QuoteRequest {
  origin: string;
  destination: string;
  weight: number;
  shipmentType: string;
}

export const useQuoteWebSocket = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connectWebSocket = useCallback(() => {
    // Close any existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Try both localhost and 127.0.0.1
    const socket = new WebSocket('ws://127.0.0.1:8000/ws/quote');

    socket.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
      
      // Clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    socket.onmessage = (event) => {
      const message = event.data;
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.onclose = (event) => {
      console.log('WebSocket connection closed', event.code, event.reason);
      setIsConnected(false);

      // Auto reconnect after a delay
      reconnectTimeoutRef.current = window.setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        connectWebSocket();
      }, 3000); // 3 second delay
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    socketRef.current = socket;
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connectWebSocket]);

  // Function to manually reconnect
  const reconnect = useCallback(() => {
    console.log('Manually reconnecting WebSocket...');
    connectWebSocket();
  }, [connectWebSocket]);

  // Function to send quote request through WebSocket
  const sendQuoteRequest = useCallback((quoteData: QuoteRequest) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      // Reset messages array before sending a new request
      setMessages([]);
      
      // Send the quote request as a JSON string
      socketRef.current.send(JSON.stringify(quoteData));
    } else {
      console.error('WebSocket is not connected');
      // Attempt to reconnect
      connectWebSocket();
      
      // Inform the user
      setMessages(['Attempting to reconnect, please try again in a moment...']);
    }
  }, [connectWebSocket]);

  // Reset the messages
  const resetMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isConnected,
    sendQuoteRequest,
    resetMessages,
    reconnect
  };
};

export default useQuoteWebSocket; 