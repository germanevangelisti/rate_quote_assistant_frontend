import { useState } from 'react';
import useQuoteWebSocket from '../hooks/useQuoteWebSocket';

interface FormData {
  origin: string;
  destination: string;
  weight: number;
  shipmentType: string;
}

export default function StreamingQuoteForm() {
  const [formData, setFormData] = useState<FormData>({
    origin: '',
    destination: '',
    weight: 0,
    shipmentType: 'standard',
  });
  
  const { messages, isConnected, sendQuoteRequest, reconnect, environment, changeEnvironment } = useQuoteWebSocket();
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'weight' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      // Try to reconnect first
      reconnect();
      return;
    }
    setShowResults(true);
    sendQuoteRequest(formData);
  };

  const handleEnvironmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeEnvironment(e.target.value as 'local' | 'testing');
  };

  // Filter out the [END] message and check if streaming is complete
  const filteredMessages = messages.filter(msg => msg !== '[END]');
  const isStreamingComplete = messages.includes('[END]');

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Real-time Streaming Quote</h2>
      
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
            <span className="text-sm text-gray-600">
              {isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
            </span>
          </div>
          
          <div className="flex items-center ml-auto">
            <label htmlFor="environment" className="text-sm mr-2">Environment:</label>
            <select 
              id="environment" 
              value={environment}
              onChange={handleEnvironmentChange}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="local">Local</option>
              <option value="testing">Testing</option>
            </select>
          </div>
        </div>
        
        {!isConnected && (
          <div className="flex items-center justify-between">
            <div className="text-xs text-red-600">
              {environment === 'local' 
                ? 'La conexión al servidor local no se pudo establecer. Asegúrate de que el backend esté ejecutándose en http://127.0.0.1:8000.'
                : 'La conexión al servidor de testing no se pudo establecer. Verifica tu conexión a Internet.'}
            </div>
            <button 
              onClick={reconnect}
              className="ml-2 text-sm text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
            >
              Reconectar
            </button>
          </div>
        )}
      </div>
      
      {!showResults ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="origin" className="block text-sm font-medium text-gray-700">Origin</label>
            <input
              type="text"
              id="origin"
              name="origin"
              value={formData.origin}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Destination</label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight || ''}
              onChange={handleInputChange}
              required
              min="0.1"
              step="0.1"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="shipmentType" className="block text-sm font-medium text-gray-700">Shipment Type</label>
            <select
              id="shipmentType"
              name="shipmentType"
              value={formData.shipmentType}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="standard">Standard</option>
              <option value="express">Express</option>
              <option value="priority">Priority</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isConnected ? 'Get Real-time Quote' : 'Reconnect & Try Again'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-semibold mb-2">Quote Processing</h3>
            <div className="text-xs text-gray-500 mb-2">
              Environment: <span className="font-medium">{environment === 'local' ? 'Local' : 'Testing'}</span>
            </div>
            <div className="space-y-2 font-mono text-sm bg-black text-green-400 p-4 rounded overflow-auto max-h-96">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message, index) => (
                  <div key={index}>
                    {message.startsWith('\n') ? <div className="my-2"></div> : null}
                    {message}
                  </div>
                ))
              ) : (
                <div>Waiting for response from server...</div>
              )}
              {!isStreamingComplete && (
                <div className="animate-pulse">▌</div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowResults(false)}
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Start New Quote
          </button>
        </div>
      )}
    </div>
  );
} 