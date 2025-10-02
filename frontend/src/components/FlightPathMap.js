import { GoogleGenAI } from '@google/genai';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import moment from 'moment-timezone';
import { useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { airports } from '../data/airports';

// Fix for default markers in react-leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FlightPathMap = ({ flight }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Gemini AI
  const ai = new GoogleGenAI({
    apiKey: 'AIzaSyAargoUSTCvMDQyyMPtkq9Q6LGUQI1RQEY'
  });

  console.log('Gemini AI initialized:', ai);

  // Extract coordinates from flight data
  const departureCoords = useMemo(() => {
    if (!flight?.route?.departure?.airport?.code) {
      console.log('FlightPathMap: Missing departure airport code', flight);
      return null;
    }
    
    // Look up airport coordinates from our airports database
    const departureAirport = airports.find(airport => 
      airport.code === flight.route.departure.airport.code
    );
    
    console.log('FlightPathMap: Departure airport lookup', {
      code: flight.route.departure.airport.code,
      found: departureAirport,
      hasCoordinates: !!departureAirport?.coordinates
    });
    
    if (!departureAirport?.coordinates) return null;
    return [departureAirport.coordinates.lat, departureAirport.coordinates.lng];
  }, [flight]);

  const arrivalCoords = useMemo(() => {
    if (!flight?.route?.arrival?.airport?.code) {
      console.log('FlightPathMap: Missing arrival airport code', flight);
      return null;
    }
    
    // Look up airport coordinates from our airports database
    const arrivalAirport = airports.find(airport => 
      airport.code === flight.route.arrival.airport.code
    );
    
    console.log('FlightPathMap: Arrival airport lookup', {
      code: flight.route.arrival.airport.code,
      found: arrivalAirport,
      hasCoordinates: !!arrivalAirport?.coordinates
    });
    
    if (!arrivalAirport?.coordinates) return null;
    return [arrivalAirport.coordinates.lat, arrivalAirport.coordinates.lng];
  }, [flight]);

  // Calculate great circle route between two points
  const calculateFlightPath = (start, end, points = 50) => {
    if (!start || !end) return [];
    
    const [lat1, lon1] = start.map(deg => deg * Math.PI / 180);
    const [lat2, lon2] = end.map(deg => deg * Math.PI / 180);
    
    const path = [];
    
    for (let i = 0; i <= points; i++) {
      const f = i / points;
      const A = Math.sin((1 - f) * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1))) / Math.sin(Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)));
      const B = Math.sin(f * Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1))) / Math.sin(Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)));
      
      const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
      const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
      const z = A * Math.sin(lat1) + B * Math.sin(lat2);
      
      const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
      const lon = Math.atan2(y, x);
      
      path.push([lat * 180 / Math.PI, lon * 180 / Math.PI]);
    }
    
    return path;
  };

  // Calculate flight path
  const flightPath = useMemo(() => {
    if (departureCoords && arrivalCoords) {
      return calculateFlightPath(departureCoords, arrivalCoords);
    }
    return [];
  }, [departureCoords, arrivalCoords]);

  // AI Chatbot Functions
  const isFlightRelatedQuery = (query) => {
    const flightKeywords = [
      'flight', 'seat', 'window', 'aisle', 'travel', 'flying', 'airplane', 'aircraft', 
      'booking', 'ticket', 'airline', 'airport', 'departure', 'arrival', 'view', 
      'side', 'left', 'right', 'sun', 'scenery', 'landscape', 'wing', 'turbulence',
      'comfort', 'legroom', 'boarding', 'baggage', 'carry-on', 'check-in'
    ];
    
    return flightKeywords.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Check if query is flight-related
    if (!isFlightRelatedQuery(userInput)) {
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: "I'm a flight booking assistant and can only help with flight-related questions like seat selection, travel preferences, booking inquiries, and airline services. Please ask me something about flights or travel!"
      };
      
      setChatMessages(prev => [...prev, 
        { id: Date.now() - 1, type: 'user', content: userInput },
        errorMessage
      ]);
      setUserInput('');
      return;
    }

    const userMessage = { id: Date.now(), type: 'user', content: userInput };
    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      // Create context-aware prompt
      const flightContext = flight ? `
        Current flight: ${flight.route?.departure?.airport?.code || 'Unknown'} to ${flight.route?.arrival?.airport?.code || 'Unknown'}
        Departure: ${flight.route?.departure?.airport?.name || 'Unknown'} 
        Arrival: ${flight.route?.arrival?.airport?.name || 'Unknown'}
        Flight time: ${flight.route?.departure?.time ? moment(flight.route.departure.time).format('HH:mm') : 'Unknown'}
      ` : '';

      const prompt = `You are a helpful flight booking assistant specializing in seat selection and travel advice. 
      ${flightContext}
      
      User question: "${userInput}"
      
      Please provide a helpful response in this exact professional format:

      For seat selection, I recommend: [left/right side window seat]

      Key recommendations:

      1. [First key point with detailed explanation]

      2. [Second key point with detailed explanation]  

      3. [Third key point with detailed explanation]

      Additional travel tips:
      • [Practical tip 1]
      • [Practical tip 2]
      • [Practical tip 3]

      IMPORTANT FORMATTING RULES:
      - No asterisks (*) or markdown formatting
      - Use simple bullet points (•) for lists
      - Keep each point concise and professional
      - No bold/italic text formatting
      - Use numbered points (1. 2. 3.) for main recommendations
      - Focus on practical, actionable advice about seat selection, views, comfort, and travel tips.`;

      console.log('Sending request to Gemini API...');
      console.log('Prompt:', prompt);

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      
      console.log('Raw response:', response);
      console.log('Response text:', response.text);
      
      const botMessage = {
        id: Date.now(),
        type: 'bot',
        content: response.text
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Detailed error with Gemini AI:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      const errorMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Connection error: ${error.message}. Please check the console for more details.`
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Map center and bounds
  const mapCenter = useMemo(() => {
    if (!departureCoords || !arrivalCoords) return [20, 0];
    return [
      (departureCoords[0] + arrivalCoords[0]) / 2,
      (departureCoords[1] + arrivalCoords[1]) / 2
    ];
  }, [departureCoords, arrivalCoords]);

  if (!departureCoords || !arrivalCoords) {
    return (
      <div className="bg-secondary-100 dark:bg-secondary-800 rounded-lg p-6 sm:p-8 text-center">
        <p className="text-secondary-600 dark:text-secondary-300">
          Flight path information not available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 relative">
      {/* AI Chatbot Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 sm:p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          title="Flight Assistant"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Chat Modal */}
      {chatOpen && (
        <div className="fixed bottom-16 right-4 sm:bottom-20 sm:right-6 md:bottom-24 md:right-6 w-80 sm:w-96 h-80 sm:h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
              <h3 className="font-semibold text-secondary-900 dark:text-white text-sm sm:text-base">Flight Assistant</h3>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-center text-secondary-500 dark:text-secondary-400 text-xs sm:text-sm">
                <p>👋 Hi! I'm your flight assistant.</p>
                <p className="mt-2">Ask me about:</p>
                <ul className="mt-2 text-xs space-y-1">
                  <li>• Window seat recommendations</li>
                  <li>• Best views during flight</li>
                  <li>• Seat selection tips</li>
                  <li>• Travel comfort advice</li>
                </ul>
              </div>
            )}
            
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-900 dark:text-white'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary-100 dark:bg-secondary-700 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-secondary-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-secondary-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-secondary-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleChatSubmit} className="p-3 sm:p-4 border-t dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask about seat selection..."
                className="flex-1 px-2.5 py-1.5 sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Map Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
        <div className="p-3 sm:p-4 border-b dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-semibold text-secondary-900 dark:text-white">
            Flight Path
          </h3>
          <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-300">
            Interactive map showing your flight route
          </p>
        </div>
        
        <div className="h-64 sm:h-80 md:h-96 relative">
          <MapContainer
            center={mapCenter}
            zoom={3}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Flight Path */}
            <Polyline
              positions={flightPath}
              color="#2563eb"
              weight={3}
              opacity={0.8}
            />
            
            {/* Departure Airport */}
            <Marker position={departureCoords}>
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-secondary-900 dark:text-white">{flight.route.departure.airport.code}</h4>
                  <p className="text-sm text-secondary-600 dark:text-secondary-300">{flight.route.departure.airport.name}</p>
                  <p className="text-xs text-secondary-600 dark:text-secondary-400">
                    Departure: {moment(flight.route.departure.time).format('MMM DD, HH:mm')}
                  </p>
                </div>
              </Popup>
            </Marker>
            
            {/* Arrival Airport */}
            <Marker position={arrivalCoords}>
              <Popup>
                <div className="text-center">
                  <h4 className="font-semibold text-secondary-900 dark:text-white">{flight.route.arrival.airport.code}</h4>
                  <p className="text-sm text-secondary-600 dark:text-secondary-300">{flight.route.arrival.airport.name}</p>
                  <p className="text-xs text-secondary-600 dark:text-secondary-400">
                    Arrival: {moment(flight.route.arrival.time).format('MMM DD, HH:mm')}
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default FlightPathMap;