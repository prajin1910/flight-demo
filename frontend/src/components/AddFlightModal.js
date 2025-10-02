import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiNavigation, FiX } from 'react-icons/fi';

const AddFlightModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    flightNumber: '',
    airline: {
      name: '',
      code: '',
      logo: ''
    },
    route: {
      departure: {
        airport: {
          code: '',
          name: '',
          city: '',
          country: ''
        },
        time: '',
        terminal: '',
        gate: ''
      },
      arrival: {
        airport: {
          code: '',
          name: '',
          city: '',
          country: ''
        },
        time: '',
        terminal: '',
        gate: ''
      }
    },
    pricing: {
      economy: {
        price: '',
        availableSeats: 150
      },
      business: {
        price: '',
        availableSeats: 30
      },
      firstClass: {
        price: '',
        availableSeats: 12
      }
    },
    aircraft: {
      model: '',
      totalSeats: 180
    },
    status: 'scheduled',
    duration: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    const fields = field.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < fields.length - 1; i++) {
        current = current[fields[i]];
      }
      
      current[fields[fields.length - 1]] = value;
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!formData.flightNumber || !formData.airline.name || !formData.airline.code) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!formData.route.departure.time || !formData.route.arrival.time) {
        toast.error('Please set departure and arrival times');
        return;
      }

      if (!formData.pricing.economy.price || formData.pricing.economy.price <= 0) {
        toast.error('Please set a valid economy price');
        return;
      }

      // Validate dates
      const departureTime = new Date(formData.route.departure.time);
      const arrivalTime = new Date(formData.route.arrival.time);
      
      if (departureTime >= arrivalTime) {
        toast.error('Arrival time must be after departure time');
        return;
      }

      // Calculate duration
      const duration = Math.round((arrivalTime - departureTime) / (1000 * 60 * 60 * 100)) / 10;
      
      const flightData = {
        ...formData,
        duration: duration > 0 ? `${Math.floor(duration)}h ${Math.round((duration % 1) * 60)}m` : '1h 0m',
        pricing: {
          economy: {
            ...formData.pricing.economy,
            price: parseFloat(formData.pricing.economy.price)
          },
          business: {
            ...formData.pricing.business,
            price: formData.pricing.business.price ? parseFloat(formData.pricing.business.price) : parseFloat(formData.pricing.economy.price) * 2.5
          },
          firstClass: {
            ...formData.pricing.firstClass,
            price: formData.pricing.firstClass.price ? parseFloat(formData.pricing.firstClass.price) : parseFloat(formData.pricing.economy.price) * 4
          }
        }
      };

      await onAdd(flightData);
      toast.success('Flight added successfully');
      onClose();
    } catch (error) {
      console.error('Error adding flight:', error);
      toast.error(error.message || 'Failed to add flight');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card-elevated max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-secondary-900 p-6 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiNavigation className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">Add New Flight</h2>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 dark:text-secondary-500 dark:hover:text-secondary-300 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Flight Information */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Flight Number *
                </label>
                <input
                  type="text"
                  value={formData.flightNumber}
                  onChange={(e) => handleInputChange('flightNumber', e.target.value)}
                  className="input-field"
                  placeholder="e.g., AI101"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Airline Name *
                </label>
                <input
                  type="text"
                  value={formData.airline.name}
                  onChange={(e) => handleInputChange('airline.name', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Air India"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Airline Code *
                </label>
                <input
                  type="text"
                  value={formData.airline.code}
                  onChange={(e) => handleInputChange('airline.code', e.target.value)}
                  className="input-field"
                  placeholder="e.g., AI"
                  required
                />
              </div>
            </div>
          </div>

          {/* Departure Information */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Departure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Airport Code *
                </label>
                <input
                  type="text"
                  value={formData.route.departure.airport.code}
                  onChange={(e) => handleInputChange('route.departure.airport.code', e.target.value.toUpperCase())}
                  className="input-field"
                  placeholder="e.g., LAX"
                  maxLength="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Airport Name *
                </label>
                <input
                  type="text"
                  value={formData.route.departure.airport.name}
                  onChange={(e) => handleInputChange('route.departure.airport.name', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Los Angeles International"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.route.departure.airport.city}
                  onChange={(e) => handleInputChange('route.departure.airport.city', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Los Angeles"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.route.departure.airport.country}
                  onChange={(e) => handleInputChange('route.departure.airport.country', e.target.value)}
                  className="input-field"
                  placeholder="e.g., United States"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Departure Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.route.departure.time}
                  onChange={(e) => handleInputChange('route.departure.time', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Terminal
                </label>
                <input
                  type="text"
                  value={formData.route.departure.terminal}
                  onChange={(e) => handleInputChange('route.departure.terminal', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Terminal 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Gate
                </label>
                <input
                  type="text"
                  value={formData.route.departure.gate}
                  onChange={(e) => handleInputChange('route.departure.gate', e.target.value)}
                  className="input-field"
                  placeholder="e.g., A1"
                />
              </div>
            </div>
          </div>

          {/* Arrival Information */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Arrival</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Airport Code *
                </label>
                <input
                  type="text"
                  value={formData.route.arrival.airport.code}
                  onChange={(e) => handleInputChange('route.arrival.airport.code', e.target.value.toUpperCase())}
                  className="input-field"
                  placeholder="e.g., JFK"
                  maxLength="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Airport Name *
                </label>
                <input
                  type="text"
                  value={formData.route.arrival.airport.name}
                  onChange={(e) => handleInputChange('route.arrival.airport.name', e.target.value)}
                  className="input-field"
                  placeholder="e.g., John F. Kennedy International"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.route.arrival.airport.city}
                  onChange={(e) => handleInputChange('route.arrival.airport.city', e.target.value)}
                  className="input-field"
                  placeholder="e.g., New York"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.route.arrival.airport.country}
                  onChange={(e) => handleInputChange('route.arrival.airport.country', e.target.value)}
                  className="input-field"
                  placeholder="e.g., United States"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Arrival Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.route.arrival.time}
                  onChange={(e) => handleInputChange('route.arrival.time', e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Terminal
                </label>
                <input
                  type="text"
                  value={formData.route.arrival.terminal}
                  onChange={(e) => handleInputChange('route.arrival.terminal', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Terminal 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Gate
                </label>
                <input
                  type="text"
                  value={formData.route.arrival.gate}
                  onChange={(e) => handleInputChange('route.arrival.gate', e.target.value)}
                  className="input-field"
                  placeholder="e.g., B5"
                />
              </div>
            </div>
          </div>

          {/* Aircraft Information */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Aircraft</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Aircraft Model *
                </label>
                <input
                  type="text"
                  value={formData.aircraft.model}
                  onChange={(e) => handleInputChange('aircraft.model', e.target.value)}
                  className="input-field"
                  placeholder="e.g., Boeing 737-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Total Capacity
                </label>
                <input
                  type="number"
                  value={formData.aircraft.totalSeats}
                  onChange={(e) => handleInputChange('aircraft.totalSeats', parseInt(e.target.value) || 180)}
                  className="input-field"
                  placeholder="180"
                  min="50"
                  max="500"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Pricing (USD)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Economy Price *
                </label>
                <input
                  type="number"
                  value={formData.pricing.economy.price}
                  onChange={(e) => handleInputChange('pricing.economy.price', e.target.value)}
                  className="input-field"
                  placeholder="299"
                  min="50"
                  step="0.01"
                  required
                />
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                  Available seats: {formData.pricing.economy.availableSeats}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Business Price
                </label>
                <input
                  type="number"
                  value={formData.pricing.business.price}
                  onChange={(e) => handleInputChange('pricing.business.price', e.target.value)}
                  className="input-field"
                  placeholder="749 (auto: 2.5x economy)"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                  Available seats: {formData.pricing.business.availableSeats}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  First Class Price
                </label>
                <input
                  type="number"
                  value={formData.pricing.firstClass.price}
                  onChange={(e) => handleInputChange('pricing.firstClass.price', e.target.value)}
                  className="input-field"
                  placeholder="1196 (auto: 4x economy)"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                  Available seats: {formData.pricing.firstClass.availableSeats}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Flight Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="input-field"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="boarding">Boarding</option>
                  <option value="departed">Departed</option>
                  <option value="arrived">Arrived</option>
                  <option value="delayed">Delayed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-secondary-200 dark:border-secondary-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding Flight...</span>
                </div>
              ) : (
                'Add Flight'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFlightModal;