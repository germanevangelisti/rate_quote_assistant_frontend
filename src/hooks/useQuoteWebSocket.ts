import { useState, useEffect, useCallback, useRef } from 'react';

interface QuoteRequest {
  origin: string;
  destination: string;
  weight: number;
  shipmentType: string;
}

// Configuración de WebSocket URLs por ambiente
const WS_URLS = {
  local: 'ws://127.0.0.1:8000/ws/quote',
  testing: 'wss://rate-quote-assistant-backend.onrender.com/ws/quote'
};

// Por defecto, usar ambiente local en desarrollo y testing en producción
const DEFAULT_ENV = import.meta.env.PROD ? 'testing' : 'local';

// Obtener ambiente de variables de entorno o localStorage
const getEnvironment = (): 'local' | 'testing' => {
  // Primero intentar obtener desde localStorage (para permitir cambios en tiempo de ejecución)
  const savedEnv = localStorage.getItem('quoteAssistantEnv');
  if (savedEnv && (savedEnv === 'local' || savedEnv === 'testing')) {
    return savedEnv;
  }
  
  // Si no hay valor guardado, usar el valor por defecto
  return DEFAULT_ENV;
};

// Función para cambiar el ambiente
export const setEnvironment = (env: 'local' | 'testing'): void => {
  localStorage.setItem('quoteAssistantEnv', env);
  // Forzar recarga para aplicar el cambio
  window.location.reload();
};

export const useQuoteWebSocket = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const [environment] = useState<'local' | 'testing'>(getEnvironment());

  const wsUrl = WS_URLS[environment];

  const connectWebSocket = useCallback(() => {
    // Close any existing connection
    if (socketRef.current) {
      socketRef.current.close();
    }

    // Use the environment-specific WebSocket URL
    console.log(`Connecting to WebSocket at ${wsUrl} (${environment} environment)`);
    const socket = new WebSocket(wsUrl);

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
  }, [wsUrl, environment]);

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

  // Function to change environment
  const changeEnvironment = useCallback((newEnv: 'local' | 'testing') => {
    setEnvironment(newEnv);
  }, []);

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
    reconnect,
    environment,
    changeEnvironment
  };
};

export default useQuoteWebSocket; 