import { useState } from 'react'
import QuoteForm from './components/QuoteForm'
import StreamingQuoteForm from './components/StreamingQuoteForm'

function App() {
  const [activeTab, setActiveTab] = useState<'regular' | 'streaming'>('regular')

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Shipping Quote Assistant</h1>
      
      <div className="mb-6 flex space-x-2 bg-white rounded-md overflow-hidden shadow-sm">
        <button 
          className={`px-4 py-2 ${activeTab === 'regular' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
          onClick={() => setActiveTab('regular')}
        >
          Regular Quote
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'streaming' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
          onClick={() => setActiveTab('streaming')}
        >
          Streaming Quote
        </button>
      </div>
      
      {activeTab === 'regular' ? <QuoteForm /> : <StreamingQuoteForm />}
    </div>
  )
}

export default App
