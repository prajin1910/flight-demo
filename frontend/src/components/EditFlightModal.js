import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiX } from 'react-icons/fi';
import { airports } from '../data/airports';

const EditFlightModal = ({ flight, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    flightNumber: flight?.flightNumber || '',
    airline: {
      name: flight?.airline?.name || flight?.airline || '',
      code: flight?.airline?.code || ''
    },
    aircraft: {
      type: flight?.aircraft?.type || '',
      totalSeats: flight?.aircraft?.totalSeats || 180
    },
    route: {
      departure: {
        airport: {
          code: flight?.route?.departure?.airport?.code || '',
          name: flight?.route?.departure?.airport?.name || '',
          city: flight?.route?.departure?.airport?.city || ''
        },
        time: flight?.route?.departure?.time ? 
          new Date(flight.route.departure.time).toISOString().slice(0, 16) : ''
      },
      arrival: {
        airport: {
          code: flight?.route?.arrival?.airport?.code || '',
          name: flight?.route?.arrival?.airport?.name || '',
          city: flight?.route?.arrival?.airport?.city || ''
        },
        time: flight?.route?.arrival?.time ? 
          new Date(flight.route.arrival.time).toISOString().slice(0, 16) : ''
      }
    },
    pricing: {
      economy: {
        price: flight?.pricing?.economy?.price || 200,
        availableSeats: flight?.pricing?.economy?.availableSeats || 150
      },
      business: {
        price: flight?.pricing?.business?.price || 500,
        availableSeats: flight?.pricing?.business?.availableSeats || 30
      },
      firstClass: {
        price: flight?.pricing?.firstClass?.price || 800,
        availableSeats: flight?.pricing?.firstClass?.availableSeats || 12
      }
    },
    status: flight?.status || 'scheduled'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [departureSearch, setDepartureSearch] = useState('');
  const [arrivalSearch, setArrivalSearch] = useState('');

  // Initialize search fields with existing airport data
  useEffect(() => {
    if (flight?.route?.departure?.airport?.code) {
      setDepartureSearch(`${flight.route.departure.airport.code} - ${flight.route.departure.airport.city}`);
    }
    if (flight?.route?.arrival?.airport?.code) {
      setArrivalSearch(`${flight.route.arrival.airport.code} - ${flight.route.arrival.airport.city}`);
    }
  }, [flight]);

  const handleInputChange = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const selectAirport = (type, airport) => {
    handleInputChange(`route.${type}.airport.code`, airport.code);
    handleInputChange(`route.${type}.airport.name`, airport.name);
    handleInputChange(`route.${type}.airport.city`, airport.city);
    
    if (type === 'departure') {
      setDepartureSearch(`${airport.code} - ${airport.city}`);
    } else {
      setArrivalSearch(`${airport.code} - ${airport.city}`);
    }
  };

  const filteredDepartureAirports = airports.filter(airport =>
    departureSearch && (
      airport.code.toLowerCase().includes(departureSearch.toLowerCase()) ||
      airport.name.toLowerCase().includes(departureSearch.toLowerCase()) ||
      airport.city.toLowerCase().includes(departureSearch.toLowerCase())
    )
  ).slice(0, 5);

  const filteredArrivalAirports = airports.filter(airport =>
    arrivalSearch && (
      airport.code.toLowerCase().includes(arrivalSearch.toLowerCase()) ||
      airport.name.toLowerCase().includes(arrivalSearch.toLowerCase()) ||
      airport.city.toLowerCase().includes(arrivalSearch.toLowerCase())
    )
  ).slice(0, 5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Debug: Log form data to see what's missing
      console.log('Form data for validation:', {
        flightNumber: formData.flightNumber,
        airlineName: formData.airline.name,
        departureCode: formData.route.departure.airport.code,
        arrivalCode: formData.route.arrival.airport.code,
        departureTime: formData.route.departure.time,
        arrivalTime: formData.route.arrival.time,
        totalSeats: formData.aircraft.totalSeats
      });

      // Validate required fields
      const requiredFields = [
        { field: formData.flightNumber, name: 'Flight Number' },
        { field: formData.airline.name, name: 'Airline Name' },
        { field: formData.route.departure.airport.code, name: 'Departure Airport' },
        { field: formData.route.arrival.airport.code, name: 'Arrival Airport' },
        { field: formData.route.departure.time, name: 'Departure Time' },
        { field: formData.route.arrival.time, name: 'Arrival Time' },
        { field: formData.aircraft.totalSeats, name: 'Total Seats' }
      ];

      const missingFields = requiredFields.filter(({ field }) => !field || field === '');
      
      if (missingFields.length > 0) {
        const missingFieldNames = missingFields.map(({ name }) => name).join(', ');
        toast.error(`Missing required fields: ${missingFieldNames}`);
        console.log('Missing fields:', missingFields);
        return;
      }

      // Validate times
      const departureTime = new Date(formData.route.departure.time);
      const arrivalTime = new Date(formData.route.arrival.time);
      
      if (arrivalTime <= departureTime) {
        toast.error('Arrival time must be after departure time');
        return;
      }

      // Validate seat numbers
      const totalSeats = formData.aircraft.totalSeats;
      const economySeats = formData.pricing.economy.availableSeats;
      const businessSeats = formData.pricing.business.availableSeats;
      const firstClassSeats = formData.pricing.firstClass.availableSeats;
      
      if ((economySeats + businessSeats + firstClassSeats) > totalSeats) {
        toast.error('Total available seats cannot exceed aircraft capacity');
        return;
      }

      await onUpdate(flight._id, formData);
      toast.success('Flight updated successfully');
      onClose();
    } catch (error) {
      console.error('Error updating flight:', error);
      toast.error('Failed to update flight');
    } finally {
      setIsLoading(false);
    }
  };

  if (!flight) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Flight {flight.flightNumber}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Flight Number *
              </label>
              <input
                type="text"
                value={formData.flightNumber}
                onChange={(e) => handleInputChange('flightNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Airline Name *
              </label>
              <input
                type="text"
                value={formData.airline.name}
                onChange={(e) => handleInputChange('airline.name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Airline Code
              </label>
              <input
                type="text"
                value={formData.airline.code}
                onChange={(e) => handleInputChange('airline.code', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., AA, DL, UA"
                maxLength="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aircraft Type
              </label>
              <input
                type="text"
                value={formData.aircraft.type}
                onChange={(e) => handleInputChange('aircraft.type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Boeing 737"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Seats *
              </label>
              <input
                type="number"
                value={formData.aircraft.totalSeats}
                onChange={(e) => handleInputChange('aircraft.totalSeats', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                min="1"
                required
              />
            </div>
          </div>

          {/* Route Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Departure */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Departure</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Airport *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.route.departure.airport.code ? 
                      `${formData.route.departure.airport.code} - ${formData.route.departure.airport.city}` : 
                      departureSearch}
                    onChange={(e) => {
                      setDepartureSearch(e.target.value);
                      if (formData.route.departure.airport.code) {
                        handleInputChange('route.departure.airport.code', '');
                        handleInputChange('route.departure.airport.name', '');
                        handleInputChange('route.departure.airport.city', '');
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Search for departure airport..."
                    required
                  />
                  
                  {departureSearch && filteredDepartureAirports.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {filteredDepartureAirports.map((airport) => (
                        <button
                          key={airport.code}
                          type="button"
                          onClick={() => selectAirport('departure', airport)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                        >
                          <div className="font-medium">{airport.code} - {airport.city}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{airport.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Departure Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.route.departure.time}
                  onChange={(e) => handleInputChange('route.departure.time', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Arrival */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Arrival</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Airport *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.route.arrival.airport.code ? 
                      `${formData.route.arrival.airport.code} - ${formData.route.arrival.airport.city}` : 
                      arrivalSearch}
                    onChange={(e) => {
                      setArrivalSearch(e.target.value);
                      if (formData.route.arrival.airport.code) {
                        handleInputChange('route.arrival.airport.code', '');
                        handleInputChange('route.arrival.airport.name', '');
                        handleInputChange('route.arrival.airport.city', '');
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Search for arrival airport..."
                    required
                  />
                  
                  {arrivalSearch && filteredArrivalAirports.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {filteredArrivalAirports.map((airport) => (
                        <button
                          key={airport.code}
                          type="button"
                          onClick={() => selectAirport('arrival', airport)}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                        >
                          <div className="font-medium">{airport.code} - {airport.city}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{airport.name}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Arrival Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.route.arrival.time}
                  onChange={(e) => handleInputChange('route.arrival.time', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing & Capacity</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Economy */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Economy Class</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.economy.price}
                      onChange={(e) => handleInputChange('pricing.economy.price', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-blue-900/30 dark:text-white"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Available Seats *
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.economy.availableSeats}
                      onChange={(e) => handleInputChange('pricing.economy.availableSeats', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-blue-900/30 dark:text-white"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Business */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">Business Class</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.business.price}
                      onChange={(e) => handleInputChange('pricing.business.price', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-purple-900/30 dark:text-white"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
                      Available Seats *
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.business.availableSeats}
                      onChange={(e) => handleInputChange('pricing.business.availableSeats', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-purple-900/30 dark:text-white"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* First Class */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">First Class</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.firstClass.price}
                      onChange={(e) => handleInputChange('pricing.firstClass.price', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-yellow-900/30 dark:text-white"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                      Available Seats *
                    </label>
                    <input
                      type="number"
                      value={formData.pricing.firstClass.availableSeats}
                      onChange={(e) => handleInputChange('pricing.firstClass.availableSeats', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-yellow-900/30 dark:text-white"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Flight Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="scheduled">Scheduled</option>
              <option value="boarding">Boarding</option>
              <option value="departed">Departed</option>
              <option value="arrived">Arrived</option>
              <option value="cancelled">Cancelled</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Flight'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFlightModal;