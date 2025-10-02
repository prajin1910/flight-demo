// Major airports and cities worldwide for flight search autocomplete
export const airports = [
  // United States
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', region: 'North America', coordinates: { lat: 40.6413, lng: -73.7781 } },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', region: 'North America', coordinates: { lat: 33.9425, lng: -118.4081 } },
  { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States', region: 'North America', coordinates: { lat: 41.9742, lng: -87.9073 } },
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States', region: 'North America', coordinates: { lat: 25.7959, lng: -80.2870 } },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', region: 'North America', coordinates: { lat: 37.6213, lng: -122.3790 } },
  { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'United States', region: 'North America', coordinates: { lat: 47.4502, lng: -122.3088 } },
  { code: 'LAS', name: 'McCarran International Airport', city: 'Las Vegas', country: 'United States', region: 'North America', coordinates: { lat: 36.0840, lng: -115.1537 } },
  { code: 'BOS', name: 'Logan International Airport', city: 'Boston', country: 'United States', region: 'North America', coordinates: { lat: 42.3656, lng: -71.0096 } },
  { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States', region: 'North America', coordinates: { lat: 33.6407, lng: -84.4277 } },
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States', region: 'North America', coordinates: { lat: 32.8975, lng: -97.0398 } },
  { code: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'United States', region: 'North America', coordinates: { lat: 39.8561, lng: -104.6737 } },
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'United States', region: 'North America', coordinates: { lat: 33.4484, lng: -112.0740 } },

  // Europe
  { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', region: 'Europe', coordinates: { lat: 51.4700, lng: -0.4543 } },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', region: 'Europe', coordinates: { lat: 49.0097, lng: 2.5479 } },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', region: 'Europe', coordinates: { lat: 50.0379, lng: 8.5622 } },
  { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', region: 'Europe', coordinates: { lat: 52.3105, lng: 4.7683 } },
  { code: 'FCO', name: 'Leonardo da Vinci International Airport', city: 'Rome', country: 'Italy', region: 'Europe', coordinates: { lat: 41.8003, lng: 12.2389 } },
  { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', region: 'Europe', coordinates: { lat: 40.4839, lng: -3.5680 } },
  { code: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain', region: 'Europe', coordinates: { lat: 41.2974, lng: 2.0833 } },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', region: 'Europe', coordinates: { lat: 48.3537, lng: 11.7751 } },
  { code: 'ZUR', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', region: 'Europe', coordinates: { lat: 47.4647, lng: 8.5492 } },
  { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', region: 'Europe', coordinates: { lat: 48.1103, lng: 16.5697 } },

  // Asia
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', region: 'Asia', coordinates: { lat: 35.7647, lng: 140.3864 } },
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', region: 'Asia', coordinates: { lat: 37.4602, lng: 126.4407 } },
  { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', region: 'Asia', coordinates: { lat: 40.0801, lng: 116.5846 } },
  { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', region: 'Asia', coordinates: { lat: 31.1443, lng: 121.8083 } },
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong SAR', region: 'Asia', coordinates: { lat: 22.3080, lng: 113.9185 } },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', region: 'Asia', coordinates: { lat: 1.3644, lng: 103.9915 } },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', region: 'Asia', coordinates: { lat: 13.6900, lng: 100.7501 } },
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', region: 'Asia', coordinates: { lat: 28.5562, lng: 77.1000 } },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', region: 'Asia', coordinates: { lat: 19.0896, lng: 72.8656 } },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', region: 'Middle East', coordinates: { lat: 25.2532, lng: 55.3657 } },

  // Australia & Oceania
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', region: 'Oceania', coordinates: { lat: -33.9399, lng: 151.1753 } },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', region: 'Oceania', coordinates: { lat: -37.6690, lng: 144.8410 } },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', region: 'Oceania', coordinates: { lat: -37.0082, lng: 174.7850 } },

  // South America
  { code: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil', region: 'South America', coordinates: { lat: -23.4356, lng: -46.4731 } },
  { code: 'EZE', name: 'Ezeiza International Airport', city: 'Buenos Aires', country: 'Argentina', region: 'South America', coordinates: { lat: -34.8222, lng: -58.5358 } },
  { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', region: 'South America', coordinates: { lat: 4.7016, lng: -74.1469 } },

  // Africa
  { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', region: 'Africa', coordinates: { lat: -33.9690, lng: 18.6021 } },
  { code: 'JNB', name: 'OR Tambo International Airport', city: 'Johannesburg', country: 'South Africa', region: 'Africa', coordinates: { lat: -26.1367, lng: 28.2411 } },
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', region: 'Africa', coordinates: { lat: 30.1219, lng: 31.4056 } },

  // Canada
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', region: 'North America', coordinates: { lat: 43.6777, lng: -79.6248 } },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', region: 'North America', coordinates: { lat: 49.1967, lng: -123.1815 } },
  { code: 'YUL', name: 'Montréal-Pierre Elliott Trudeau International Airport', city: 'Montreal', country: 'Canada', region: 'North America', coordinates: { lat: 45.4706, lng: -73.7408 } }
];

// Helper function to search airports
export const searchAirports = (query) => {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  
  return airports.filter(airport => 
    airport.city.toLowerCase().includes(searchTerm) ||
    airport.country.toLowerCase().includes(searchTerm) ||
    airport.code.toLowerCase().includes(searchTerm) ||
    airport.name.toLowerCase().includes(searchTerm)
  ).slice(0, 8); // Limit to 8 results
};

// Helper function to format airport display
export const formatAirportDisplay = (airport) => {
  return `${airport.city}, ${airport.country} (${airport.code})`;
};