import { useState } from 'react';
import axios from 'axios';

interface FormData {
  origin: string;
  destination: string;
  weight: number;
  shipmentType: string;
}

interface Quote {
  basePrice: number;
  weightPrice: number;
  totalPrice: number;
  estimatedDelivery: string;
}

export default function QuoteForm() {
  const [formData, setFormData] = useState<FormData>({
    origin: '',
    destination: '',
    weight: 0,
    shipmentType: 'standard',
  });
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'weight' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setQuote(null);

    try {
      const response = await axios.post('http://localhost:8000/quote', formData);
      setQuote(response.data);
    } catch (err) {
      setError('Failed to get quote. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-4">Shipping Quote Calculator</h2>
      
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
          disabled={loading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Getting Quote...' : 'Get Quote'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {quote && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-semibold mb-2">Quote Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Price:</span>
              <span>${quote.basePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Weight Cost:</span>
              <span>${quote.weightPrice.toFixed(2)}</span>
            </div>
            <div className="h-px bg-gray-300 my-2"></div>
            <div className="flex justify-between font-bold">
              <span>Total Price:</span>
              <span>${quote.totalPrice.toFixed(2)}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Estimated Delivery: {quote.estimatedDelivery}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 