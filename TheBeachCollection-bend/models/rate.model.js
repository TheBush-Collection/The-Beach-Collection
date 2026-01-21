import mongoose from "mongoose";

const rateSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  seasonType: { 
    type: String, 
    enum: ["low", "high", "peak"], 
    required: true 
  },
  seasonName: { type: String, required: true }, // e.g., "Low Season 2024", "Christmas Peak"
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  ratePerNight: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  minimumStay: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
  notes: { type: String },
  // For meal plan options
  mealPlan: {
    type: String,
    enum: ["room-only", "bed-breakfast", "half-board", "full-board", "all-inclusive"],
    default: "full-board"
  },
  // Additional charges
  singleOccupancySupplement: { type: Number, default: 0 },
  childRate: { type: Number, default: 0 }, // Rate for children
  childAgeLimit: { type: Number, default: 12 },
  extraAdultRate: { type: Number, default: 0 }
}, { timestamps: true });

// Index for efficient querying
rateSchema.index({ property: 1, room: 1, startDate: 1, endDate: 1 });
rateSchema.index({ startDate: 1, endDate: 1 });

// Static method to find applicable rate for a given date
rateSchema.statics.findRateForDate = async function(roomId, date) {
  const targetDate = new Date(date);
  return this.findOne({
    room: roomId,
    startDate: { $lte: targetDate },
    endDate: { $gte: targetDate },
    isActive: true
  }).populate('property room');
};

// Static method to find all rates for a date range
rateSchema.statics.findRatesForDateRange = async function(roomId, startDate, endDate) {
  return this.find({
    room: roomId,
    isActive: true,
    $or: [
      { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
    ]
  }).populate('property room').sort({ startDate: 1 });
};

export default mongoose.model("Rate", rateSchema);
