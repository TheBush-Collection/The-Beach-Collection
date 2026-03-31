/**
 * One-time migration: backfill roomName for all bookings that have
 * rooms[].roomId but no rooms[].roomName.
 *
 * Usage:  node backfillRoomNames.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Booking from './models/booking.model.js';
import Room from './models/room.model.js';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Find bookings that have at least one room without a roomName
  const bookings = await Booking.find({
    'rooms.roomId': { $exists: true },
    $or: [
      { 'rooms.roomName': { $exists: false } },
      { 'rooms.roomName': null },
      { 'rooms.roomName': '' }
    ]
  }).lean();

  console.log(`Found ${bookings.length} bookings with missing room names`);

  if (bookings.length === 0) {
    console.log('Nothing to backfill.');
    await mongoose.disconnect();
    return;
  }

  // Collect all unique roomIds that need names
  const allRoomIds = new Set();
  for (const b of bookings) {
    for (const r of b.rooms || []) {
      if (r.roomId && !r.roomName) {
        allRoomIds.add(r.roomId.toString());
      }
    }
  }

  console.log(`Looking up ${allRoomIds.size} unique room IDs`);

  // Fetch room names
  const roomDocs = await Room.find({ _id: { $in: [...allRoomIds] } }).select('_id name').lean();
  const nameMap = {};
  roomDocs.forEach(rd => { nameMap[rd._id.toString()] = rd.name; });

  console.log(`Found names for ${roomDocs.length} rooms`);

  // Update each booking
  let updated = 0;
  for (const b of bookings) {
    let changed = false;
    const updatedRooms = b.rooms.map(r => {
      if (r.roomId && !r.roomName) {
        const name = nameMap[r.roomId.toString()];
        if (name) {
          changed = true;
          return { ...r, roomName: name };
        }
      }
      return r;
    });

    if (changed) {
      await Booking.updateOne({ _id: b._id }, { $set: { rooms: updatedRooms } });
      updated++;
      console.log(`  Updated booking ${b.bookingId || b._id}: rooms now have names`);
    }
  }

  console.log(`\nDone! Updated ${updated} bookings.`);
  await mongoose.disconnect();
};

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
