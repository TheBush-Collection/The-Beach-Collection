import mongoose from "mongoose";
import Rate from "../models/rate.model.js";
import Property from "../models/property.model.js";
import Room from "../models/room.model.js";

// Get all rates
export const getRates = async (req, res) => {
  try {
    const { propertyId, roomId, seasonType, startDate, endDate } = req.query;
    
    const filter = {};
    if (propertyId) filter.property = propertyId;
    if (roomId) filter.room = roomId;
    if (seasonType) filter.seasonType = seasonType;
    if (startDate && endDate) {
      filter.$or = [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ];
    }

    const rates = await Rate.find(filter)
      .populate('property', 'name location')
      .populate('room', 'name roomType pricePerNight')
      .sort({ startDate: 1 });
    
    res.json({ data: rates, total: rates.length });
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single rate
export const getRate = async (req, res) => {
  try {
    const rate = await Rate.findById(req.params.id)
      .populate('property', 'name location')
      .populate('room', 'name roomType pricePerNight');
    
    if (!rate) {
      return res.status(404).json({ message: 'Rate not found' });
    }
    
    res.json(rate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new rate
export const createRate = async (req, res) => {
  try {
    const {
      property, room, seasonType, seasonName, startDate, endDate,
      ratePerNight, currency, minimumStay, isActive, notes,
      mealPlan, singleOccupancySupplement, childRate, childAgeLimit, extraAdultRate
    } = req.body;

    // Validate property and room exist
    const propertyExists = await Property.findById(property);
    if (!propertyExists) {
      return res.status(400).json({ message: 'Property not found' });
    }

    const roomExists = await Room.findById(room);
    if (!roomExists) {
      return res.status(400).json({ message: 'Room not found' });
    }

    // Check for overlapping rates with the same meal plan
    // Different meal plans are allowed to overlap
    const overlappingRate = await Rate.findOne({
      room,
      mealPlan: mealPlan || 'full-board', // Check same meal plan only
      isActive: true,
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
    });

    if (overlappingRate) {
      return res.status(400).json({ 
        message: `Overlapping rate exists for ${mealPlan || 'full-board'}: ${overlappingRate.seasonName} (${new Date(overlappingRate.startDate).toLocaleDateString()} - ${new Date(overlappingRate.endDate).toLocaleDateString()})` 
      });
    }

    const rate = await Rate.create({
      property,
      room,
      seasonType,
      seasonName,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      ratePerNight: Number(ratePerNight),
      currency: currency || 'USD',
      minimumStay: Number(minimumStay) || 1,
      isActive: isActive !== false,
      notes,
      mealPlan: mealPlan || 'full-board',
      singleOccupancySupplement: Number(singleOccupancySupplement) || 0,
      childRate: Number(childRate) || 0,
      childAgeLimit: Number(childAgeLimit) || 12,
      extraAdultRate: Number(extraAdultRate) || 0
    });

    const populatedRate = await Rate.findById(rate._id)
      .populate('property', 'name location')
      .populate('room', 'name roomType pricePerNight');

    res.status(201).json(populatedRate);
  } catch (error) {
    console.error('Error creating rate:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update rate
export const updateRate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert dates if provided
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    // Check for overlapping rates (excluding current rate)
    // Allow overlapping rates if they have different meal plans
    if (updateData.startDate || updateData.endDate || updateData.room) {
      const currentRate = await Rate.findById(id);
      const overlappingRate = await Rate.findOne({
        _id: { $ne: id },
        room: updateData.room || currentRate.room,
        mealPlan: updateData.mealPlan || currentRate.mealPlan, // Only check same meal plan
        isActive: true,
        $or: [
          { 
            startDate: { $lte: new Date(updateData.endDate || currentRate.endDate) }, 
            endDate: { $gte: new Date(updateData.startDate || currentRate.startDate) } 
          }
        ]
      });

      if (overlappingRate) {
        return res.status(400).json({ 
          message: `Overlapping rate exists: ${overlappingRate.seasonName}` 
        });
      }
    }

    const rate = await Rate.findByIdAndUpdate(id, updateData, { new: true })
      .populate('property', 'name location')
      .populate('room', 'name roomType pricePerNight');

    if (!rate) {
      return res.status(404).json({ message: 'Rate not found' });
    }

    res.json(rate);
  } catch (error) {
    console.error('Error updating rate:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete rate
export const deleteRate = async (req, res) => {
  try {
    const rate = await Rate.findByIdAndDelete(req.params.id);
    
    if (!rate) {
      return res.status(404).json({ message: 'Rate not found' });
    }

    res.json({ message: 'Rate deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get rate for specific date (for booking calculation)
export const getRateForDate = async (req, res) => {
  try {
    const { roomId, date, mealPlan } = req.query;

    if (!roomId || !date) {
      return res.status(400).json({ message: 'roomId and date are required' });
    }

    const targetDate = new Date(date);
    
    // Convert roomId string to ObjectId for proper MongoDB matching
    const roomObjectId = new mongoose.Types.ObjectId(roomId);
    
    // Build query to find rate for the given date
    const query = {
      room: roomObjectId,
      startDate: { $lte: targetDate },
      endDate: { $gte: targetDate },
      isActive: true
    };
    
    // Add meal plan filter if provided
    if (mealPlan) {
      query.mealPlan = mealPlan;
    }

    const rate = await Rate.findOne(query).populate('property room');

    if (!rate) {
      // Try finding any rate for this date without meal plan filter
      const anyRate = await Rate.findRateForDate(roomId, date);
      if (anyRate) {
        return res.json(anyRate);
      }
      
      // Return the room's default rate if no seasonal rate found
      const room = await Room.findById(roomId);
      if (room) {
        return res.json({
          ratePerNight: room.pricePerNight,
          currency: room.currency || 'USD',
          seasonType: 'default',
          seasonName: 'Standard Rate',
          mealPlan: mealPlan || 'full-board',
          isDefault: true
        });
      }
      return res.status(404).json({ message: 'No rate found for this date' });
    }

    res.json(rate);
  } catch (error) {
    console.error('Error in getRateForDate:', error);
    res.status(500).json({ message: error.message });
  }
};

// Calculate total for date range (for booking)
export const calculateBookingRate = async (req, res) => {
  try {
    const { roomId, startDate, endDate, adults, children } = req.body;

    if (!roomId || !startDate || !endDate) {
      return res.status(400).json({ message: 'roomId, startDate, and endDate are required' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    // Get all applicable rates for the date range
    const rates = await Rate.findRatesForDateRange(roomId, startDate, endDate);

    let totalAmount = 0;
    let rateBreakdown = [];
    let currentDate = new Date(start);

    while (currentDate < end) {
      // Find applicable rate for this specific day
      const applicableRate = rates.find(rate => 
        currentDate >= new Date(rate.startDate) && currentDate <= new Date(rate.endDate)
      );

      let nightRate;
      let rateName;
      let seasonType;

      if (applicableRate) {
        nightRate = applicableRate.ratePerNight;
        rateName = applicableRate.seasonName;
        seasonType = applicableRate.seasonType;

        // Add child rates if applicable
        if (children && children > 0 && applicableRate.childRate > 0) {
          nightRate += applicableRate.childRate * children;
        }

        // Add extra adult rate if applicable
        if (adults && adults > room.maxGuests && applicableRate.extraAdultRate > 0) {
          const extraAdults = adults - room.maxGuests;
          nightRate += applicableRate.extraAdultRate * extraAdults;
        }
      } else {
        // Use default room rate
        nightRate = room.pricePerNight;
        rateName = 'Standard Rate';
        seasonType = 'default';
      }

      totalAmount += nightRate;
      
      // Group consecutive days with same rate
      const existingBreakdown = rateBreakdown.find(b => b.rateName === rateName && b.nightRate === nightRate);
      if (existingBreakdown) {
        existingBreakdown.nights += 1;
        existingBreakdown.subtotal += nightRate;
      } else {
        rateBreakdown.push({
          rateName,
          seasonType,
          nightRate,
          nights: 1,
          subtotal: nightRate
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      roomId,
      roomName: room.name,
      startDate,
      endDate,
      totalNights: nights,
      totalAmount,
      currency: room.currency || 'USD',
      breakdown: rateBreakdown
    });
  } catch (error) {
    console.error('Error calculating booking rate:', error);
    res.status(500).json({ message: error.message });
  }
};

// Bulk create rates (for setting up multiple rooms at once)
export const bulkCreateRates = async (req, res) => {
  try {
    const { rates } = req.body;

    if (!Array.isArray(rates) || rates.length === 0) {
      return res.status(400).json({ message: 'rates array is required' });
    }

    const createdRates = [];
    const errors = [];

    for (const rateData of rates) {
      try {
        const rate = await Rate.create({
          ...rateData,
          startDate: new Date(rateData.startDate),
          endDate: new Date(rateData.endDate)
        });
        createdRates.push(rate);
      } catch (error) {
        errors.push({ room: rateData.room, error: error.message });
      }
    }

    res.status(201).json({
      created: createdRates.length,
      errors: errors.length,
      rates: createdRates,
      errorDetails: errors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
