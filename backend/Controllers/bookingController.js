// Import model
const Booking = require("../Model/bookingModel");

// Helper function to find available room
const findAvailableRoom = async (checkInDate, checkOutDate) => {
  const totalRooms = 12;
  
  // Get all bookings that overlap with the requested dates
  const overlappingBookings = await Booking.find({
    $or: [
      {
        b_checkInDate: { $lt: checkOutDate },
        b_checkOutDate: { $gt: checkInDate }
      }
    ]
  });

  // Get occupied room numbers
  const occupiedRooms = overlappingBookings.map(booking => booking.b_roomNumber);
  
  // Find first available room
  for (let roomNumber = 1; roomNumber <= totalRooms; roomNumber++) {
    if (!occupiedRooms.includes(roomNumber)) {
      return roomNumber;
    }
  }
  
  return null; // No rooms available
};

// Get all available rooms for a specific period
const getAvailableRoomsForPeriod = async (checkInDate, checkOutDate) => {
  const totalRooms = 12;
  const availableRooms = [];
  
  // Get all bookings that overlap with the requested dates
  const overlappingBookings = await Booking.find({
    $or: [
      {
        b_checkInDate: { $lt: checkOutDate },
        b_checkOutDate: { $gt: checkInDate }
      }
    ]
  });

  // Get occupied room numbers
  const occupiedRooms = overlappingBookings.map(booking => booking.b_roomNumber);
  
  // Find all available rooms
  for (let roomNumber = 1; roomNumber <= totalRooms; roomNumber++) {
    if (!occupiedRooms.includes(roomNumber)) {
      availableRooms.push(roomNumber);
    }
  }
  
  return availableRooms;
};

// Check if specific room is available for given dates
const checkSpecificRoomAvailability = async (roomNumber, checkInDate, checkOutDate) => {
  const overlappingBookings = await Booking.find({
    b_roomNumber: parseInt(roomNumber),
    $or: [
      {
        b_checkInDate: { $lt: checkOutDate },
        b_checkOutDate: { $gt: checkInDate }
      }
    ]
  });
  
  return overlappingBookings.length === 0;
};

// Calculate pricing based on package type, duration, and occupancy
const calculatePricing = (packageType, duration, occupancyType) => {
  // Base package prices per day
  const packagePrices = {
    '7 Days Package': 5000,
    '5 Days Package': 6000,
    'Couple Package': 7000
  };
  
  // Room prices per day based on occupancy
  const roomPrices = {
    'Single': 2000,
    'Double': 3000
  };
  
  const packagePricePerDay = packagePrices[packageType] || 5000;
  const roomPricePerDay = roomPrices[occupancyType] || 2000;
  
  const totalPackagePrice = packagePricePerDay * duration;
  const totalRoomPrice = roomPricePerDay * duration;
  const totalPrice = totalPackagePrice + totalRoomPrice;
  
  return {
    packagePrice: totalPackagePrice,
    roomPrice: totalRoomPrice,
    totalPrice: totalPrice
  };
};

// Helper function to find available room for update (excluding current booking)
const findAvailableRoomForUpdate = async (checkInDate, checkOutDate, excludeBookingId) => {
  const totalRooms = 12;
  
  // Get all bookings that overlap with the requested dates, excluding the current booking
  const overlappingBookings = await Booking.find({
    _id: { $ne: excludeBookingId },
    $or: [
      {
        b_checkInDate: { $lt: checkOutDate },
        b_checkOutDate: { $gt: checkInDate }
      }
    ]
  });

  // Get occupied room numbers
  const occupiedRooms = overlappingBookings.map(booking => booking.b_roomNumber);
  
  // Find first available room
  for (let roomNumber = 1; roomNumber <= totalRooms; roomNumber++) {
    if (!occupiedRooms.includes(roomNumber)) {
      return roomNumber;
    }
  }
  
  return null; // No rooms available
};

// Get unavailable dates for calendar
const getUnavailableDates = async (req, res, next) => {
  try {
    const { packageDuration } = req.query;
    const duration = parseInt(packageDuration) || 7;
    
    // Get all bookings
    const bookings = await Booking.find();
    
    // Calculate all unavailable dates (only when ALL 12 rooms are occupied)
    const unavailableDates = new Set();
    
    // Get all unique dates that have any bookings
    const allBookingDates = new Set();
    bookings.forEach(booking => {
      const checkIn = new Date(booking.b_checkInDate);
      const checkOut = new Date(booking.b_checkOutDate);
      
      const currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        allBookingDates.add(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    // For each date that has bookings, check if all 12 rooms would be occupied
    for (const dateString of allBookingDates) {
      const checkDate = new Date(dateString);
      const checkOutDate = new Date(checkDate);
      checkOutDate.setDate(checkDate.getDate() + duration);
      
      // Count how many rooms are occupied during this potential booking period
      const occupiedRooms = new Set();
      
      bookings.forEach(booking => {
        const bookingCheckIn = new Date(booking.b_checkInDate);
        const bookingCheckOut = new Date(booking.b_checkOutDate);
        
        // Check if this booking overlaps with the potential booking period
        if (bookingCheckIn < checkOutDate && bookingCheckOut > checkDate) {
          occupiedRooms.add(booking.b_roomNumber);
        }
      });
      
      // If all 12 rooms are occupied, mark this date as unavailable
      if (occupiedRooms.size >= 12) {
        unavailableDates.add(dateString);
      }
    }
    
    return res.status(200).json({ unavailableDates: Array.from(unavailableDates) });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to get unavailable dates" });
  }
};

// Check room availability for specific dates
const checkAvailability = async (req, res, next) => {
  try {
    const { checkInDate, packageDuration } = req.body;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + packageDuration);
    
    // Get all available rooms for the period
    const availableRooms = await getAvailableRoomsForPeriod(checkIn, checkOut);
    
    return res.status(200).json({ 
      available: availableRooms.length > 0,
      availableRooms: availableRooms,
      availableCount: availableRooms.length,
      totalRooms: 12,
      checkOutDate: checkOut.toISOString().split('T')[0]
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to check availability" });
  }
};

// Get booking statistics for admin dashboard
const getBookingStats = async (req, res, next) => {
  try {
    const bookings = await Booking.find();
    
    // Calculate statistics
    const totalBookings = bookings.length;
    
    // Package type distribution
    const packageStats = bookings.reduce((acc, booking) => {
      acc[booking.b_packageType] = (acc[booking.b_packageType] || 0) + 1;
      return acc;
    }, {});
    
    // Room occupancy
    const roomOccupancy = {};
    for (let i = 1; i <= 12; i++) {
      roomOccupancy[i] = 0;
    }
    
    bookings.forEach(booking => {
      const checkIn = new Date(booking.b_checkInDate);
      const checkOut = new Date(booking.b_checkOutDate);
      const today = new Date();
      
      // Check if room is currently occupied
      if (today >= checkIn && today < checkOut) {
        roomOccupancy[booking.b_roomNumber]++;
      }
    });
    
    const occupiedRooms = Object.values(roomOccupancy).filter(count => count > 0).length;
    const availableRooms = 12 - occupiedRooms;
    
    // Monthly bookings
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.b_checkInDate);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    }).length;
    
    // Revenue calculation (assuming different prices for different packages)
    const packagePrices = {
      '7 Days Package': 50000,
      '5 Days Package': 35000,
      'Couple Package': 40000
    };
    
    const totalRevenue = bookings.reduce((total, booking) => {
      return total + (packagePrices[booking.b_packageType] || 0);
    }, 0);
    
    return res.status(200).json({
      totalBookings,
      packageStats,
      roomOccupancy: {
        occupied: occupiedRooms,
        available: availableRooms,
        total: 12
      },
      monthlyBookings,
      totalRevenue
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to get booking statistics" });
  }
};

// Get available rooms for specific dates
const getAvailableRooms = async (req, res, next) => {
  try {
    const { checkInDate, checkOutDate } = req.query;
    
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ message: "Check-in and check-out dates are required" });
    }
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    // Get all available rooms for the period
    const availableRooms = await getAvailableRoomsForPeriod(checkIn, checkOut);
    
    return res.status(200).json({ 
      availableRooms,
      totalRooms: 12,
      availableCount: availableRooms.length
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to get available rooms" });
  }
};

// Get pricing information
const getPricing = async (req, res, next) => {
  try {
    const { packageType, duration, occupancyType } = req.query;
    
    if (!packageType || !duration || !occupancyType) {
      return res.status(400).json({ message: "Package type, duration, and occupancy type are required" });
    }
    
    const pricing = calculatePricing(packageType, parseInt(duration), occupancyType);
    
    return res.status(200).json({ pricing });
  } catch (err) {
    console.error('Error in getPricing:', err);
    return res.status(500).json({ message: "Unable to calculate pricing" });
  }
};

// Get all bookings
const getAllBookings = async (req, res, next) => {
  let bookings;
  try {
    bookings = await Booking.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!bookings || bookings.length === 0) {
    return res.status(404).json({ message: "No bookings found" });
  }

  return res.status(200).json({ bookings });
};

// Add new booking
const addBooking = async (req, res, next) => {
  const { 
    b_name, 
    b_email, 
    b_phone, 
    b_packageType, 
    b_packageDuration, 
    b_checkInDate, 
    b_guest,
    b_roomNumber,
    b_occupancyType
  } = req.body;

  try {
    // Validate couple package minimum duration
    if (b_packageType === 'Couple Package' && b_packageDuration < 5) {
      return res.status(400).json({ message: "Couple package requires minimum 5 days" });
    }

    // Validate guest count for occupancy type
    if (b_occupancyType === 'Single' && b_guest > 1) {
      return res.status(400).json({ message: "Single occupancy allows maximum 1 guest" });
    }
    if (b_occupancyType === 'Double' && b_guest > 2) {
      return res.status(400).json({ message: "Double occupancy allows maximum 2 guests" });
    }

    // Calculate check-out date
    const checkInDate = new Date(b_checkInDate);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + b_packageDuration);

    // Check if specific room is available for the entire stay period
    const isRoomAvailable = await checkSpecificRoomAvailability(b_roomNumber, checkInDate, checkOutDate);
    
    if (!isRoomAvailable) {
      return res.status(400).json({ message: `Room ${b_roomNumber} is not available for the selected dates` });
    }

    // Calculate pricing
    const pricing = calculatePricing(b_packageType, b_packageDuration, b_occupancyType);
    
    const booking = new Booking({
      b_name,
      b_email,
      b_phone,
      b_packageType,
      b_packageDuration,
      b_checkInDate: checkInDate,
      b_checkOutDate: checkOutDate,
      b_guest,
      b_roomNumber: parseInt(b_roomNumber),
      b_occupancyType,
      b_roomPrice: pricing.roomPrice,
      b_packagePrice: pricing.packagePrice,
      b_totalPrice: pricing.totalPrice,
    });

    await booking.save();
    return res.status(201).json({ booking });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to add booking" });
  }
};

// Get booking by ID
const getBookingById = async (req, res, next) => {
  const id = req.params.id;

  let booking;
  try {
    booking = await Booking.findById(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  return res.status(200).json({ booking });
};

// Update booking
const updateBooking = async (req, res, next) => {
  const id = req.params.id;
  const { b_name, b_email, b_phone, b_packageType, b_packageDuration, b_checkInDate, b_guest } = req.body;

  let booking;
  try {
    booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Validate couple package minimum duration
    if (b_packageType === 'Couple Package' && b_packageDuration < 5) {
      return res.status(400).json({ message: "Couple package requires minimum 5 days" });
    }

    // Calculate check-out date
    const checkInDate = new Date(b_checkInDate);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + b_packageDuration);

    // Check room availability for the entire stay period (excluding current booking)
    const availableRoom = await findAvailableRoomForUpdate(checkInDate, checkOutDate, id);
    
    if (!availableRoom) {
      return res.status(400).json({ message: "No rooms available for the selected dates" });
    }

    // Update fields
    booking.b_name = b_name;
    booking.b_email = b_email;
    booking.b_phone = b_phone;
    booking.b_packageType = b_packageType;
    booking.b_packageDuration = b_packageDuration;
    booking.b_checkInDate = checkInDate;
    booking.b_checkOutDate = checkOutDate;
    booking.b_guest = b_guest;
    booking.b_roomNumber = availableRoom;

    await booking.save();
    return res.status(200).json({ booking });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Update failed" });
  }
};

// Delete booking
const deleteBooking = async (req, res, next) => {
  const id = req.params.id;

  let booking;
  try {
    booking = await Booking.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }

  if (!booking) {
    return res.status(404).json({ message: "Unable to delete booking" });
  }

  return res.status(200).json({ message: "Booking deleted successfully", booking });
};

// Export controllers
exports.getAllBookings = getAllBookings;
exports.addBooking = addBooking;
exports.getBookingById = getBookingById;
exports.updateBooking = updateBooking;
exports.deleteBooking = deleteBooking;
exports.getUnavailableDates = getUnavailableDates;
exports.checkAvailability = checkAvailability;
exports.getBookingStats = getBookingStats;
exports.getAvailableRooms = getAvailableRooms;
exports.getPricing = getPricing;
