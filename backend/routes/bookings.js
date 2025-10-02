const express = require('express');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendBookingConfirmation, sendBookingCancellation } = require('../utils/emailService');

const router = express.Router();

// Create new booking
router.post('/create', auth, async (req, res) => {
  try {
    const {
      flightId,
      passengers,
      contactDetails,
      selectedSeats,
      specialServices = []
    } = req.body;

    // Validation
    if (!flightId || !passengers || !passengers.length || !contactDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    // Get flight details
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Flight not found'
      });
    }

    if (!flight.isActive || !['scheduled', 'boarding'].includes(flight.status)) {
      return res.status(400).json({
        success: false,
        message: 'Flight is not available for booking'
      });
    }

    // Check if flight has departed or is too close to departure
    const departureTime = new Date(flight.route.departure.time);
    const now = new Date();
    const hoursDifference = (departureTime - now) / (1000 * 60 * 60);

    if (hoursDifference <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Flight has already departed and is no longer available for booking'
      });
    }

    if (hoursDifference < 2) {
      return res.status(400).json({
        success: false,
        message: 'Booking closed - Flight departure is too soon (must be at least 2 hours before departure)'
      });
    }

    // Validate seat selection
    const selectedSeatNumbers = selectedSeats || passengers.map(p => p.seatNumber);
    
    for (let seatNumber of selectedSeatNumbers) {
      const seat = flight.seatMap.seats.find(s => s.seatNumber === seatNumber);
      if (!seat) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seatNumber} does not exist`
        });
      }
      if (!seat.isAvailable || seat.isBlocked) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seatNumber} is not available`
        });
      }
    }

    // Calculate pricing
    let totalAmount = 0;
    let basePrice = 0;

    passengers.forEach((passenger, index) => {
      const seatNumber = selectedSeatNumbers[index];
      const seat = flight.seatMap.seats.find(s => s.seatNumber === seatNumber);
      const classPrice = flight.pricing[seat.class]?.price || flight.pricing.economy.price;
      
      basePrice += classPrice;
      totalAmount += seat.price || classPrice;
      
      // Add passenger seat info
      passenger.seatNumber = seatNumber;
      passenger.seatClass = seat.class;
    });

    // Add special services cost
    const servicesTotal = specialServices.reduce((sum, service) => sum + (service.price || 0), 0);
    totalAmount += servicesTotal;

    // Add taxes and fees (10% of base price)
    const taxes = Math.round(basePrice * 0.1);
    const fees = 25; // Fixed booking fee
    totalAmount += taxes + fees;

    // Generate booking ID and PNR
    const bookingId = `FB${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const pnr = Math.random().toString(36).substr(2, 6).toUpperCase();

    // Ensure phone number is provided
    if (!contactDetails.phone || contactDetails.phone.trim() === '') {
      contactDetails.phone = '000-000-0000'; // Default phone if not provided
    }

    // Create booking
    const booking = new Booking({
      bookingId,
      user: req.user._id,
      flight: flightId,
      passengers,
      contactDetails,
      pricing: {
        basePrice,
        taxes,
        fees,
        totalAmount
      },
      paymentDetails: {
        method: 'mock',
        status: 'completed',
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        paymentDate: new Date()
      },
      bookingReference: {
        pnr
      },
      specialServices,
      bookingStatus: 'confirmed'
    });

    // Generate confirmation code
    booking.generateConfirmationCode();

    // Save booking
    await booking.save();

    // Update seat availability in flight
    selectedSeatNumbers.forEach(seatNumber => {
      flight.updateSeatAvailability(seatNumber, false);
    });

    // Update flight booking stats
    flight.bookingDetails.totalBookings += 1;
    flight.bookingDetails.revenue += totalAmount;

    await flight.save();

    // Send confirmation email
    try {
      await sendBookingConfirmation(booking, req.user, flight);
      booking.notifications.emailSent = true;
      await booking.save();
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    // Populate booking details for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('flight', 'flightNumber airline route')
      .populate('user', 'username email');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: populatedBooking,
      paymentStatus: 'success'
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking'
    });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { user: req.user._id };
    if (status) {
      query.bookingStatus = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(query)
      .populate('flight', 'flightNumber airline route status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalBookings = await Booking.countDocuments(query);

    res.json({
      success: true,
      bookings,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBookings / parseInt(limit)),
        totalBookings,
        hasNext: skip + bookings.length < totalBookings,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('User bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
});

// Get booking details by ID
router.get('/:bookingId', auth, async (req, res) => {
  try {
    console.log('Booking details request for ID:', req.params.bookingId);
    
    let query;
    const { bookingId } = req.params;
    
    // Check if it's a valid MongoDB ObjectId format (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(bookingId);
    
    if (isValidObjectId) {
      // If it's a valid ObjectId, search by both _id and bookingId
      query = {
        $or: [
          { _id: bookingId },
          { bookingId: bookingId }
        ]
      };
    } else {
      // If it's not a valid ObjectId, only search by bookingId field
      query = { bookingId: bookingId };
    }
    
    console.log('Using query:', query);

    const booking = await Booking.findOne(query)
      .populate('flight')
      .populate('user', 'username email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Booking details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking details'
    });
  }
});

// Cancel booking
router.put('/:bookingId/cancel', auth, async (req, res) => {
  try {
    console.log('Cancel booking request:', {
      bookingId: req.params.bookingId,
      userId: req.user._id,
      reason: req.body.reason
    });

    const { reason } = req.body;

    // Check if it's a valid MongoDB ObjectId format (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.bookingId);
    
    let query;
    if (isValidObjectId) {
      // If it's a valid ObjectId, search by both _id and bookingId
      query = {
        $or: [
          { _id: req.params.bookingId },
          { bookingId: req.params.bookingId }
        ]
      };
    } else {
      // If it's not a valid ObjectId, only search by bookingId field
      query = { bookingId: req.params.bookingId };
    }

    const booking = await Booking.findOne(query).populate('flight').populate('user');

    console.log('Booking found:', booking ? {
      id: booking._id,
      bookingId: booking.bookingId,
      status: booking.bookingStatus,
      userId: booking.user._id,
      isCancelled: booking.cancellation?.isCancelled
    } : 'null');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking can be cancelled (simplified check)
    if (booking.bookingStatus === 'cancelled' || booking.cancellation.isCancelled) {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled.'
      });
    }

    // Update booking status
    booking.bookingStatus = 'cancelled';
    booking.cancellation = {
      isCancelled: true,
      cancelledAt: new Date(),
      cancelledBy: req.user._id,
      reason: reason || 'Cancelled by user',
      refundAmount: Math.round(booking.pricing.totalAmount * 0.8), // 80% refund
      refundStatus: 'pending',
      estimatedRefundTime: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours from now
    };

    await booking.save();

    // Try to update flight stats (skip if flight structure doesn't match)
    try {
      const flight = booking.flight;
      if (flight && flight.seatMap && flight.seatMap.seats) {
        booking.passengers.forEach(passenger => {
          const seat = flight.seatMap.seats.find(s => s.seatNumber === passenger.seatNumber);
          if (seat) {
            seat.isAvailable = true;
            // Update class-wise availability count
            switch (passenger.seatClass) {
              case 'economy':
                if (flight.pricing?.economy) {
                  flight.pricing.economy.availableSeats += 1;
                }
                break;
              case 'business':
                if (flight.pricing?.business) {
                  flight.pricing.business.availableSeats += 1;
                }
                break;
              case 'first':
                if (flight.pricing?.firstClass) {
                  flight.pricing.firstClass.availableSeats += 1;
                }
                break;
            }
          }
        });

        // Update flight stats
        if (flight.bookingDetails) {
          flight.bookingDetails.totalBookings = Math.max(0, flight.bookingDetails.totalBookings - 1);
          flight.bookingDetails.revenue = Math.max(0, flight.bookingDetails.revenue - booking.pricing.totalAmount);
        }

        await flight.save();
      }
    } catch (flightUpdateError) {
      console.error('Flight update error (non-critical):', flightUpdateError);
    }

    // Send cancellation email (non-blocking)
    try {
      const flight = booking.flight;
      await sendBookingCancellation(booking, booking.user, flight);
    } catch (emailError) {
      console.error('Failed to send cancellation email (non-critical):', emailError);
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      refundAmount: booking.cancellation.refundAmount
    });

  } catch (error) {
    console.error('Booking cancellation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
});

// Check-in for flight
router.put('/:bookingId/checkin', auth, async (req, res) => {
  try {
    // Check if it's a valid MongoDB ObjectId format (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.bookingId);
    
    let query;
    if (isValidObjectId) {
      // If it's a valid ObjectId, search by both _id and bookingId
      query = {
        $or: [
          { _id: req.params.bookingId },
          { bookingId: req.params.bookingId }
        ]
      };
    } else {
      // If it's not a valid ObjectId, only search by bookingId field
      query = { bookingId: req.params.bookingId };
    }

    const booking = await Booking.findOne(query).populate('flight').populate('user');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership
    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (booking.bookingStatus !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot check-in for this booking'
      });
    }

    if (booking.checkInStatus.isCheckedIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in'
      });
    }

    // Check if check-in is allowed (24 hours before departure)
    const departureTime = new Date(booking.flight.route.departure.time);
    const now = new Date();
    const hoursDifference = (departureTime - now) / (1000 * 60 * 60);

    if (hoursDifference > 24) {
      return res.status(400).json({
        success: false,
        message: 'Check-in opens 24 hours before departure'
      });
    }

    if (hoursDifference < 0) {
      return res.status(400).json({
        success: false,
        message: 'Flight has already departed'
      });
    }

    // Update check-in status
    booking.checkInStatus.isCheckedIn = true;
    booking.checkInStatus.checkInTime = new Date();
    booking.checkInStatus.boardingPass.isGenerated = true;

    await booking.save();

    res.json({
      success: true,
      message: 'Check-in successful',
      boardingPass: {
        qrCode: booking.checkInStatus.boardingPass.qrCode,
        checkInTime: booking.checkInStatus.checkInTime
      }
    });

  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during check-in'
    });
  }
});

// Search booking by PNR
router.get('/search/pnr/:pnr', async (req, res) => {
  try {
    const { pnr } = req.params;
    
    if (!pnr || pnr.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid PNR format'
      });
    }

    const booking = await Booking.findOne({
      'bookingReference.pnr': pnr.toUpperCase()
    })
    .populate('flight', 'flightNumber airline route status')
    .populate('user', 'username email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found with this PNR'
      });
    }

    // Return limited information for security
    const publicBookingInfo = {
      bookingId: booking.bookingId,
      pnr: booking.bookingReference.pnr,
      status: booking.bookingStatus,
      flight: {
        flightNumber: booking.flight.flightNumber,
        airline: booking.flight.airline.name,
        route: booking.flight.route,
        status: booking.flight.status
      },
      passengers: booking.passengers.map(p => ({
        name: `${p.firstName} ${p.lastName}`,
        seatNumber: p.seatNumber,
        seatClass: p.seatClass
      })),
      checkInStatus: booking.checkInStatus
    };

    res.json({
      success: true,
      booking: publicBookingInfo
    });

  } catch (error) {
    console.error('PNR search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching booking'
    });
  }
});

module.exports = router;