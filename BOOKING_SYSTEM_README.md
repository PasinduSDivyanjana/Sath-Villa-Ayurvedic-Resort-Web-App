# Ayurveda Package Booking System

## Overview
This booking system manages Ayurveda package reservations with room availability tracking and calendar integration.

## Features

### Package Types
- **7 Days Package**: Fixed 7-day duration
- **5 Days Package**: Fixed 5-day duration  
- **Couple Package**: Minimum 5 days, customizable duration

### Room Management
- **Total Rooms**: 12 rooms available
- **Room Assignment**: Automatic room assignment based on availability
- **Conflict Prevention**: Prevents double-booking during overlapping dates

### Calendar Integration
- **Date Hiding**: Unavailable dates are hidden in the calendar
- **Real-time Availability**: Shows room availability status
- **Package Duration Aware**: Calendar considers package duration when hiding dates

## Backend API Endpoints

### Booking Management
- `GET /bookings` - Get all bookings
- `POST /bookings` - Create new booking
- `GET /bookings/:id` - Get booking by ID
- `PUT /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Delete booking

### Availability Checking
- `GET /bookings/availability/unavailable-dates?packageDuration=X` - Get unavailable dates for calendar
- `POST /bookings/availability/check` - Check room availability for specific dates

## Database Schema

### Booking Model
```javascript
{
  b_name: String (required),
  b_email: String (optional),
  b_phone: String (required),
  b_packageType: String (enum: ['7 Days Package', '5 Days Package', 'Couple Package']),
  b_packageDuration: Number (required),
  b_checkInDate: Date (required),
  b_checkOutDate: Date (required),
  b_guest: Number (default: 1),
  b_roomNumber: Number (required),
  b_createdAt: Date (default: Date.now)
}
```

## Frontend Components

### Calendar Component (`/Component/Calendar/Calendar.js`)
- Interactive calendar with unavailable date hiding
- Package duration aware
- Real-time availability checking
- Responsive design

### Booking Form (`/Component/Add Booking/Add_Booking.js`)
- Package type selection
- Duration validation (minimum 5 days for couple package)
- Calendar integration
- Real-time availability status

## Usage Flow

1. **Select Package Type**: User chooses from 3 package options
2. **Set Duration**: Duration auto-sets for fixed packages, customizable for couple package
3. **Choose Dates**: Calendar shows only available dates
4. **Check Availability**: System verifies room availability
5. **Confirm Booking**: Room is assigned and booking is created

## Validation Rules

- Couple package requires minimum 5 days
- No double-booking allowed
- Past dates are disabled
- Room availability is checked before booking confirmation

## Error Handling

- Room unavailability messages
- Package duration validation
- Network error handling
- Form validation feedback

## Installation & Setup

1. Install dependencies: `npm install`
2. Start backend: `npm start` (in backend directory)
3. Start frontend: `npm start` (in frontend directory)
4. Access booking form at `/add-booking`

## Testing

The system can be tested by:
1. Creating multiple bookings with overlapping dates
2. Verifying calendar hides unavailable dates
3. Testing couple package minimum duration validation
4. Checking room assignment logic
