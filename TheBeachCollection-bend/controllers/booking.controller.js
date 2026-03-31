import Booking from "../models/booking.model.js";
import User from "../models/user.model.js";
import Property from "../models/property.model.js";
import Package from "../models/package.model.js";
import Room from "../models/room.model.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { subscribeContactInternal, sendViaMandrill } from "./mailchimp.controller.js";
import PDFDocument from 'pdfkit';

// Generate booking ID
const generateBookingId = () => {
  return 'BK' + Date.now().toString().slice(-8) + crypto.randomBytes(3).toString('hex').toUpperCase();
};

// Generate confirmation number
const generateConfirmationNumber = () => {
  return 'SB' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
};

// ── Shared helper: build a comprehensive PDF receipt buffer from a populated booking ──
const LOGO_URL = 'https://res.cloudinary.com/dfaakg2ds/image/upload/v1770803318/PNG-LOGO_1_xlw56b.png';

// Fetch logo once and cache it in memory
let _logoBuffer = null;
const fetchLogo = async () => {
  if (_logoBuffer) return _logoBuffer;
  try {
    const resp = await fetch(LOGO_URL);
    if (!resp.ok) throw new Error('Logo fetch failed');
    const arrayBuf = await resp.arrayBuffer();
    _logoBuffer = Buffer.from(arrayBuf);
    return _logoBuffer;
  } catch (e) {
    console.warn('Could not fetch logo for PDF:', e.message);
    return null;
  }
};

const buildReceiptPdf = async (booking) => {
  const logo = await fetchLogo();

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const chunks = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // ── Colour palette ──
      const gold   = '#C9A961';
      const dark   = '#1A1A1A';
      const mid    = '#4A4A4A';
      const light  = '#777777';
      const bg     = '#FAFAFA';
      const white  = '#FFFFFF';
      const pw     = 595.28; // A4 width in points
      const mL     = 45;
      const mR     = 45;
      const cW     = pw - mL - mR; // content width

      const fmt  = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
      const fCur = (v) => v != null ? `$${Number(v).toFixed(2)}` : '$0.00';
      const propName = booking.property?.name || booking.property_name || 'N/A';
      const pkgName  = booking.package?.name  || booking.package_name  || 'N/A';
      const confirmNum = booking.confirmationNumber || '';
      const costs = booking.costs || {};

      // Back-compute cost breakdown for legacy bookings that only have a total
      const totalAmt   = Number(costs.total) || 0;
      if (totalAmt > 0 && !costs.basePrice && !costs.serviceFee && !costs.taxes) {
        // Legacy bookings stored total = base * 1.25  (10% service + 15% tax)
        const isProperty = booking.bookingType === 'property';
        const taxRate = isProperty ? 0.15 : 0.12;
        const feeRate = 0.10;
        const divisor = 1 + feeRate + taxRate;
        costs.basePrice   = Math.round((totalAmt / divisor) * 100) / 100;
        costs.serviceFee  = Math.round((costs.basePrice * feeRate) * 100) / 100;
        costs.taxes       = Math.round((costs.basePrice * taxRate) * 100) / 100;
        costs.subtotal    = Math.round((costs.basePrice + costs.serviceFee) * 100) / 100;
      }

      const amountPaid = Number(booking.amountPaid) || 0;
      const balance    = Math.max(totalAmt - amountPaid, 0);

      let y = 0;
      const ensureSpace = (need) => { if (y > 800 - need) { doc.addPage(); y = 40; } };

      // ═══════════════════════════ HEADER BAR ═══════════════════════════
      doc.rect(0, 0, pw, 110).fill(white);
      if (logo) {
        try { doc.image(logo, mL, 18, { height: 55 }); } catch (_) { /* skip logo */ }
      }
      doc.fill(dark).font('Helvetica-Bold').fontSize(22).text('BOOKING RECEIPT', mL + 180, 28, { width: cW - 180, align: 'right' });
      doc.fill(gold).font('Helvetica').fontSize(10)
        .text(`Receipt #${confirmNum || booking.bookingId}`, mL + 180, 56, { width: cW - 180, align: 'right' });
      doc.fill(light).fontSize(9)
        .text(`Date: ${fmt(booking.createdAt)}`, mL + 180, 72, { width: cW - 180, align: 'right' });

      // Gold accent line
      doc.rect(0, 110, pw, 3).fill(gold);
      y = 130;

      // ═══════════════════════════ STATUS BADGE ═══════════════════════════
      const statusText = (booking.status || 'pending').toUpperCase();
      const statusColors = {
        PENDING: '#F59E0B', DEPOSIT_PAID: '#F97316', CONFIRMED: '#3B82F6',
        FULLY_PAID: '#10B981', CANCELLED: '#EF4444', COMPLETED: '#6B7280'
      };
      const badgeColor = statusColors[statusText] || gold;
      const badgeW = 110;
      doc.roundedRect(pw - mR - badgeW, y, badgeW, 22, 4).fill(badgeColor);
      doc.fill(white).font('Helvetica-Bold').fontSize(9).text(statusText, pw - mR - badgeW, y + 6, { width: badgeW, align: 'center' });

      // ─── Booking ID row ───
      doc.fill(light).font('Helvetica').fontSize(9).text('Booking ID', mL, y + 2);
      doc.fill(dark).font('Helvetica-Bold').fontSize(10).text(booking.bookingId || '', mL, y + 13);
      y += 40;

      // ═══════════════════════════ TWO-COLUMN: CUSTOMER | PROPERTY ═══════════════════════════
      const colW = (cW - 20) / 2;

      // Section label helper
      const sectionLabel = (text, x, yy) => {
        doc.fill(gold).font('Helvetica-Bold').fontSize(8).text(text.toUpperCase(), x, yy);
        doc.moveTo(x, yy + 12).lineTo(x + colW, yy + 12).strokeColor(gold).lineWidth(0.5).stroke();
        return yy + 18;
      };

      // Field helper
      const field = (lbl, val, x, yy) => {
        doc.fill(light).font('Helvetica').fontSize(8).text(lbl, x, yy);
        doc.fill(dark).font('Helvetica').fontSize(9.5).text(String(val ?? 'N/A'), x, yy + 10);
        return yy + 24;
      };

      // Left column – Customer
      let yL = sectionLabel('Customer Details', mL, y);
      yL = field('Name', booking.customerName, mL, yL);
      yL = field('Email', booking.customerEmail, mL, yL);
      if (booking.customerPhone) yL = field('Phone', `${booking.customerCountryCode || ''} ${booking.customerPhone}`.trim(), mL, yL);

      // Right column – Property/Package
      const rX = mL + colW + 20;
      let yR = sectionLabel('Property / Package', rX, y);
      if (booking.bookingType === 'property') {
        yR = field('Property', propName, rX, yR);
        if (booking.property?.location) yR = field('Location', booking.property.location, rX, yR);
      }
      if (booking.bookingType === 'package' || (pkgName && pkgName !== 'N/A')) {
        yR = field('Package', pkgName, rX, yR);
        if (booking.package?.duration) yR = field('Duration', booking.package.duration, rX, yR);
      }
      y = Math.max(yL, yR) + 10;

      // ═══════════════════════════ STAY DETAILS CARD ═══════════════════════════
      ensureSpace(90);
      doc.rect(mL, y, cW, 70).fillAndStroke(bg, '#E5E5E5');
      const stayFields = [
        { lbl: 'Check-in', val: fmt(booking.checkInDate) },
        { lbl: 'Check-out', val: fmt(booking.checkOutDate) },
        { lbl: 'Nights', val: booking.nights || 0 },
        { lbl: 'Guests', val: `${booking.adults || 0} Adults, ${booking.children || 0} Children` },
      ];
      const sfW = cW / stayFields.length;
      stayFields.forEach((sf, i) => {
        const sx = mL + i * sfW + 12;
        doc.fill(light).font('Helvetica').fontSize(8).text(sf.lbl, sx, y + 14);
        doc.fill(dark).font('Helvetica-Bold').fontSize(10).text(String(sf.val), sx, y + 28);
      });
      if (booking.specialRequests && booking.specialRequests !== 'None') {
        doc.fill(light).font('Helvetica').fontSize(8).text('Special Requests:', mL + 12, y + 48);
        doc.fill(mid).font('Helvetica').fontSize(9).text(booking.specialRequests, mL + 100, y + 48, { width: cW - 120 });
      }
      y += 80;

      // ═══════════════════════════ ROOMS TABLE ═══════════════════════════
      const rooms = booking.rooms || [];
      if (rooms.length > 0) {
        const bookingNights = Number(booking.nights) || 1;

        ensureSpace(50 + rooms.length * 22);
        y = drawTableSection(doc, 'Room Selection', y, mL, cW,
          ['Room', 'Qty', 'Guests', 'Price/Night/Pax', 'Subtotal'],
          [0.30, 0.10, 0.12, 0.24, 0.24],
          rooms.map(rm => {
            const ppnpp = Number(rm.pricePerNightPerPerson) || 0;
            const guests = Number(rm.guests) || 1;
            const qty = Number(rm.quantity) || 1;
            const subtotal = Number(rm.subtotal) || (ppnpp * guests * qty * bookingNights);
            return [rm.roomName || 'Room', qty, guests, fCur(ppnpp), fCur(subtotal)];
          }),
          { gold, dark, mid, light, bg }
        );
      }

      // ═══════════════════════════ AIRPORT TRANSFER ═══════════════════════════
      const at = booking.airportTransfer || {};
      if (at.needed) {
        ensureSpace(80);
        y += 5;
        y = sectionLabel('Airport Transfer', mL, y);
        if (at.arrivalDate || at.arrivalTime || at.arrivalFlightNumber) {
          y = field('Arrival', `${fmt(at.arrivalDate)}  ${at.arrivalTime || ''}  Flight: ${at.arrivalFlightNumber || 'N/A'}`, mL, y);
        }
        if (at.departureDate || at.departureTime || at.departureFlightNumber) {
          y = field('Departure', `${fmt(at.departureDate)}  ${at.departureTime || ''}  Flight: ${at.departureFlightNumber || 'N/A'}`, mL, y);
        }
        y += 5;
      }

      // ═══════════════════════════ AMENITIES TABLE ═══════════════════════════
      const amenities = booking.amenities || [];
      if (amenities.length > 0) {
        ensureSpace(50 + amenities.length * 22);
        y = drawTableSection(doc, 'Selected Amenities', y, mL, cW,
          ['Amenity', 'Qty', 'Unit Price', 'Total'],
          [0.45, 0.15, 0.20, 0.20],
          amenities.map(a => [a.amenityName || 'Amenity', a.quantity ?? 1, fCur(a.pricePerUnit), fCur(a.totalPrice)]),
          { gold, dark, mid, light, bg }
        );
      }

      // ═══════════════════════════ COST SUMMARY ═══════════════════════════
      ensureSpace(130);
      y += 5;
      doc.fill(gold).font('Helvetica-Bold').fontSize(8).text('COST SUMMARY', mL, y);
      doc.moveTo(mL, y + 12).lineTo(mL + cW, y + 12).strokeColor(gold).lineWidth(0.5).stroke();
      y += 18;

      const costLine = (lbl, val, bold = false) => {
        doc.fill(bold ? dark : mid).font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 10 : 9.5);
        doc.text(lbl, mL, y, { width: cW - 10, align: 'left', continued: false });
        doc.text(val, mL, y, { width: cW - 10, align: 'right' });
        y += bold ? 18 : 15;
      };

      if (costs.basePrice != null)   costLine('Base Price', fCur(costs.basePrice));
      if (costs.amenitiesTotal > 0)  costLine('Amenities', fCur(costs.amenitiesTotal));
      if (costs.serviceFee > 0)      costLine('Service Fee (10%)', fCur(costs.serviceFee));
      if (costs.taxes > 0)           costLine('Taxes (15%)', fCur(costs.taxes));

      // Total bar
      doc.rect(mL, y, cW, 28).fill(dark);
      doc.fill(white).font('Helvetica-Bold').fontSize(12).text('TOTAL', mL + 14, y + 7);
      doc.text(fCur(totalAmt), mL, y + 7, { width: cW - 14, align: 'right' });
      y += 38;

      // ═══════════════════════════ PAYMENT INFO ═══════════════════════════
      ensureSpace(80);
      doc.fill(gold).font('Helvetica-Bold').fontSize(8).text('PAYMENT DETAILS', mL, y);
      doc.moveTo(mL, y + 12).lineTo(mL + cW, y + 12).strokeColor(gold).lineWidth(0.5).stroke();
      y += 18;

      const payTerm = booking.paymentTerm || 'deposit';
      costLine('Payment Term', payTerm === 'full' ? 'Full Payment' : 'Deposit + Balance');
      costLine('Amount Paid', fCur(amountPaid));
      // Balance bar
      const balColor = balance <= 0 ? '#10B981' : '#EF4444';
      doc.rect(mL, y, cW, 24).fill(balColor);
      doc.fill(white).font('Helvetica-Bold').fontSize(11).text('BALANCE DUE', mL + 14, y + 6);
      doc.text(fCur(balance), mL, y + 6, { width: cW - 14, align: 'right' });
      y += 32;

      const sched = booking.paymentSchedule || {};
      if (payTerm === 'deposit') {
        if (sched.depositAmount) costLine('Deposit Amount', fCur(sched.depositAmount));
        if (sched.balanceAmount) costLine('Balance Amount', fCur(sched.balanceAmount));
        if (sched.depositDueDate) costLine('Deposit Due', fmt(sched.depositDueDate));
        if (sched.balanceDueDate) costLine('Balance Due Date', fmt(sched.balanceDueDate));
      }

      // ═══════════════════════════ FOOTER ═══════════════════════════
      const footerY = Math.max(y + 20, 760);
      doc.rect(0, footerY, pw, 50).fill(dark);
      doc.fill('#999999').font('Helvetica').fontSize(8)
        .text('The Bush Collection  •  info@thebushcollection.africa  •  +254116072343', 0, footerY + 12, { width: pw, align: 'center' });
      doc.fill('#666666').fontSize(7)
        .text(`Generated on ${new Date().toLocaleString()}  •  Thank you for choosing The Bush Collection`, 0, footerY + 26, { width: pw, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// ── Table drawing helper for PDFKit ──
function drawTableSection(doc, title, y, mL, cW, headers, widths, rows, colors) {
  const { gold, dark, mid, light, bg } = colors;

  // Title
  doc.fill(gold).font('Helvetica-Bold').fontSize(8).text(title.toUpperCase(), mL, y);
  doc.moveTo(mL, y + 12).lineTo(mL + cW, y + 12).strokeColor(gold).lineWidth(0.5).stroke();
  y += 18;

  // Header row
  doc.rect(mL, y, cW, 20).fill(dark);
  let xOff = mL + 8;
  headers.forEach((h, i) => {
    const w = cW * widths[i];
    doc.fill('#CCCCCC').font('Helvetica-Bold').fontSize(8).text(h, xOff, y + 5, { width: w - 8 });
    xOff += w;
  });
  y += 20;

  // Data rows
  rows.forEach((row, ri) => {
    if (y > 740) { doc.addPage(); y = 40; }
    if (ri % 2 === 0) doc.rect(mL, y, cW, 20).fill(bg); else doc.rect(mL, y, cW, 20).fill('#FFFFFF');
    xOff = mL + 8;
    row.forEach((cell, ci) => {
      const w = cW * widths[ci];
      doc.fill(mid).font('Helvetica').fontSize(9).text(String(cell ?? ''), xOff, y + 5, { width: w - 8 });
      xOff += w;
    });
    y += 20;
  });

  // Bottom border
  doc.moveTo(mL, y).lineTo(mL + cW, y).strokeColor('#E5E5E5').lineWidth(0.5).stroke();
  y += 8;
  return y;
}

// Helper to send booking notification via Mailchimp service
const sendBookingNotification = async (bookingInput, type = 'booking_created') => {
  if (!bookingInput || !bookingInput.customerEmail) return;

  // Ensure property and package are populated for comprehensive PDF
  let booking = bookingInput;
  if (booking._id && (!booking.property?.name && !booking.package?.name)) {
    try {
      const populated = await Booking.findById(booking._id)
        .populate('property', 'name location address')
        .populate('package', 'name duration description');
      if (populated) booking = populated;
    } catch (_) { /* use original booking */ }
  }

  const email = booking.customerEmail;
  const name = (booking.customerName || '').split(' ');
  const merge_fields = {
    FNAME: name[0] || '',
    LNAME: name.slice(1).join(' ') || '',
    BOOKING_ID: booking.bookingId || booking._id || booking.id || '',
    CONFIRMATION: booking.confirmationNumber || booking.confirmation_number || '',
    STATUS: booking.status || '',
    CHECKIN: booking.checkInDate ? new Date(booking.checkInDate).toISOString().split('T')[0] : (booking.checkIn ? booking.checkIn : ''),
    CHECKOUT: booking.checkOutDate ? new Date(booking.checkOutDate).toISOString().split('T')[0] : (booking.checkOut ? booking.checkOut : ''),
    AMOUNT: booking.costs?.total ?? booking.total ?? 0,
    PROPERTY: booking.property?.name || booking.property_name || ''
  };

  const tag = `booking_${type}`; // e.g., booking_booking_created, booking_cancelled
  // 1) Subscribe/update Mailchimp and add tag (existing behavior)
  try {
    await subscribeContactInternal({
      email_address: email,
      merge_fields,
      tags: [tag]
    });
    console.log(`Mailchimp: notification tag '${tag}' added for ${email}`);
  } catch (err) {
    console.error('Mailchimp subscribeContactInternal error:', err);
  }

  // 2) Send transactional receipt email via Mandrill (Mailchimp Transactional)
  try {
    const subject = `Your booking receipt - ${merge_fields.CONFIRMATION || merge_fields.BOOKING_ID}`;
    const html = `<p>Dear ${merge_fields.FNAME || 'Guest'},</p>
      <p>Thank you for your booking. Please find your detailed receipt attached as a PDF.</p>
      <ul>
        <li><strong>Booking ID:</strong> ${merge_fields.BOOKING_ID}</li>
        <li><strong>Confirmation:</strong> ${merge_fields.CONFIRMATION}</li>
        <li><strong>Property:</strong> ${merge_fields.PROPERTY}</li>
        <li><strong>Check-in:</strong> ${merge_fields.CHECKIN}</li>
        <li><strong>Check-out:</strong> ${merge_fields.CHECKOUT}</li>
        <li><strong>Total:</strong> $${Number(merge_fields.AMOUNT || 0).toFixed(2)}</li>
      </ul>
      <p>Kind regards,<br/>The Bush Collection</p>`;

    // Generate comprehensive PDF receipt
    const pdfBuffer = await buildReceiptPdf(booking);
    const pdfBase64 = pdfBuffer.toString('base64');

    await sendViaMandrill({
      to: email,
      toName: booking.customerName || '',
      subject,
      html,
      attachments: [{
        type: 'application/pdf',
        name: `Receipt_${merge_fields.CONFIRMATION || merge_fields.BOOKING_ID}.pdf`,
        content: pdfBase64,
      }],
    });
  } catch (err) {
    console.error('Error sending receipt email via Mandrill (booking notification):', err);
  }
};

// Create booking (comprehensive - for frontend checkout flow)
export const createBooking = async (req, res) => {
  try {
    const {
      bookingType, // 'property' or 'package'
      propertyId,
      packageId,
      rooms, // array of { roomId, quantity, guests, pricePerNightPerPerson }
      checkInDate,
      checkOutDate,
      nights,
      totalGuests,
      adults,
      children,
      specialRequests,
      // Customer info
      customerName,
      customerEmail,
      customerPhone,
      customerCountryCode,
      // Airport transfer
      airportTransfer,
      // Amenities
      amenities, // array of { amenityId, amenityName, quantity, pricePerUnit, totalPrice }
      // Costs
      costs,
      // Payment
      paymentTerm,
      paymentSchedule,
      amountPaid
    } = req.body;

    // Validation
    if (!bookingType || !customerName || !customerEmail || !checkInDate || !checkOutDate) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: bookingType, customerName, customerEmail, checkInDate, checkOutDate' 
      });
    }

    if (bookingType === 'property' && (!propertyId || !rooms || rooms.length === 0)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Property booking requires propertyId and rooms array' 
      });
    }

    if (bookingType === 'package' && !packageId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Package booking requires packageId' 
      });
    }

    // Create booking document
    const bookingId = generateBookingId();
    const confirmationNumber = generateConfirmationNumber();

    // Resolve room names from the Room collection if missing
    let resolvedRooms = rooms || [];
    if (resolvedRooms.length > 0) {
      const roomIds = resolvedRooms
        .filter(r => r.roomId && !r.roomName)
        .map(r => r.roomId);
      
      if (roomIds.length > 0) {
        try {
          const roomDocs = await Room.find({ _id: { $in: roomIds } }).select('_id name').lean();
          const roomNameMap = {};
          roomDocs.forEach(rd => { roomNameMap[rd._id.toString()] = rd.name; });
          
          resolvedRooms = resolvedRooms.map(r => ({
            ...r,
            roomName: r.roomName || roomNameMap[r.roomId?.toString()] || undefined
          }));
        } catch (lookupErr) {
          console.warn('Room name lookup failed:', lookupErr.message);
        }
      }
    }

    const bookingData = {
      bookingId,
      confirmationNumber,
      bookingType,
      property: bookingType === 'property' ? propertyId : undefined,
      package: bookingType === 'package' ? packageId : undefined,
      customerName,
      customerEmail,
      customerPhone,
      customerCountryCode,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      nights: Number(nights) || 0,
      totalGuests: Number(totalGuests),
      adults: Number(adults) || 0,
      children: Number(children) || 0,
      specialRequests,
      rooms: resolvedRooms,
      airportTransfer: airportTransfer || { needed: false },
      amenities: amenities || [],
      costs: costs || { basePrice: 0, amenitiesTotal: 0, subtotal: 0, serviceFee: 0, taxes: 0, total: 0 },
      paymentTerm: paymentTerm || 'deposit',
      paymentSchedule: paymentSchedule || { depositAmount: 0, balanceAmount: 0, depositDueDate: new Date(), balanceDueDate: new Date() },
      amountPaid: Number(amountPaid) || 0,
      status: 'pending'
    };

    const booking = await Booking.create(bookingData);

      // Fire-and-forget: send notification (booking will be auto-populated inside)
      (async () => {
        try {
          await sendBookingNotification(booking, 'booking_created');
        } catch (err) {
          console.error('Mailchimp notify error (createBooking):', err);
        }
      })();

    return res.status(201).json({
      success: true,
      booking,
      message: 'Booking created successfully'
    });
  } catch (err) {
    console.error('Booking creation error:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to create booking' 
    });
  }
};

// Helper: enrich booking rooms with names from Room collection
const enrichBookingRoomNames = async (bookings) => {
  // Collect all roomIds that are missing a roomName
  const missingIds = new Set();
  for (const b of bookings) {
    if (b.rooms && Array.isArray(b.rooms)) {
      for (const r of b.rooms) {
        if (r.roomId && !r.roomName) {
          missingIds.add(r.roomId.toString());
        }
      }
    }
  }
  if (missingIds.size === 0) return;

  try {
    const roomDocs = await Room.find({ _id: { $in: [...missingIds] } }).select('_id name').lean();
    const nameMap = {};
    roomDocs.forEach(rd => { nameMap[rd._id.toString()] = rd.name; });

    for (const b of bookings) {
      if (b.rooms && Array.isArray(b.rooms)) {
        for (const r of b.rooms) {
          if (r.roomId && !r.roomName) {
            r.roomName = nameMap[r.roomId.toString()] || undefined;
          }
        }
      }
    }
  } catch (err) {
    console.warn('enrichBookingRoomNames failed:', err.message);
  }
};

// Admin: list bookings with filters and actions
export const listBookings = async (req, res) => {
  try {
    const { page = 1, limit = 30, status, search } = req.query;
    const q = {};
    if (status) q.status = status;
    if (search) q.bookingId = { $regex: search, $options: "i" };
    const bookings = await Booking.find(q)
      .populate("property", "name")
      .populate("package", "name")
      .skip((page-1)*limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    // Enrich rooms with names from Room collection where roomName is missing
    await enrichBookingRoomNames(bookings);

    const total = await Booking.countDocuments(q);
    res.json({ data: bookings, total });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// List bookings for the authenticated user
export const listUserBookings = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ msg: 'Not authenticated' });
    const email = req.user.email;
    const bookings = await Booking.find({ customerEmail: email })
      .populate('property', 'name')
      .populate('package', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // Enrich rooms with names from Room collection where roomName is missing
    await enrichBookingRoomNames(bookings);

    res.json({ data: bookings });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getBooking = async (req, res) => {
  try {
    const b = await Booking.findById(req.params.id)
      .populate("property", "name location")
      .populate("package", "name duration")
      .lean();
    if (!b) return res.status(404).json({ msg: "Not found" });
    await enrichBookingRoomNames([b]);
    res.json(b);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get booking by bookingId (for customers)
export const getBookingByRef = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const b = await Booking.findOne({ bookingId })
      .populate("property", "name location address")
      .populate("package", "name duration description")
      .lean();
    
    if (!b) {
      return res.status(404).json({ 
        success: false,
        msg: "Booking not found" 
      });
    }

    // Allow access if user is owner or admin
    if (req.user && req.user.role !== 'admin' && b.customerEmail !== req.user.email) {
      return res.status(403).json({ 
        success: false,
        msg: "Not authorized to view this booking" 
      });
    }

    await enrichBookingRoomNames([b]);

    res.json({
      success: true,
      booking: b
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      msg: err.message 
    });
  }
};

// Admin actions - Update booking status
export const setDepositPaid = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        msg: "Booking not found" 
      });
    }

    // Validate status transition
    if (booking.status === 'cancelled') {
      return res.status(400).json({ 
        success: false,
        msg: "Cannot update a cancelled booking" 
      });
    }

    // Determine deposit amount: prefer explicit amount from caller, else use stored paymentSchedule or fallback to 30% of total
    const callerAmount = req.body?.amountPaid != null ? Number(req.body.amountPaid) : null;
    const callerPaymentDetails = req.body?.paymentDetails || null;
    const depositAmount = callerAmount != null
      ? callerAmount
      : (booking.paymentSchedule && booking.paymentSchedule.depositAmount)
        ? Number(booking.paymentSchedule.depositAmount)
        : (booking.costs && booking.costs.total ? Math.round((booking.costs.total * 0.3 + Number.EPSILON) * 100) / 100 : 0);

    const update = {
      status: "deposit_paid",
      amountPaid: depositAmount,
      paymentTerm: booking.paymentTerm || 'deposit'
    };
    if (callerPaymentDetails) update.paymentDetails = callerPaymentDetails;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    res.json({
      success: true,
      message: "Booking status updated to deposit_paid",
      booking: updatedBooking
    });
    (async () => {
      try {
        await sendBookingNotification(updatedBooking, 'deposit_paid');
      } catch (err) {
        console.error('Mailchimp notify error (deposit_paid):', err);
      }
    })();
  } catch (err) {
    res.status(500).json({ 
      success: false,
      msg: err.message 
    });
  }
};

export const setConfirmed = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        msg: "Booking not found" 
      });
    }

    // Validate status transition
    if (booking.status === 'cancelled') {
      return res.status(400).json({ 
        success: false,
        msg: "Cannot update a cancelled booking" 
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status: "confirmed" }, 
      { new: true }
    );

    res.json({
      success: true,
      message: "Booking status updated to confirmed",
      booking: updatedBooking
    });
    (async () => {
      try {
        await sendBookingNotification(updatedBooking, 'confirmed');
      } catch (err) {
        console.error('Mailchimp notify error (confirmed):', err);
      }
    })();
  } catch (err) {
    res.status(500).json({ 
      success: false,
      msg: err.message 
    });
  }
};

export const setFullyPaid = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        msg: "Booking not found" 
      });
    }

    // Validate status transition
    if (booking.status === 'cancelled') {
      return res.status(400).json({ 
        success: false,
        msg: "Cannot update a cancelled booking" 
      });
    }

    // Determine paid amount: prefer explicit amount from caller, else use stored costs.total
    const callerAmount = req.body?.amountPaid != null ? Number(req.body.amountPaid) : null;
    const callerPaymentDetails = req.body?.paymentDetails || null;
    const paidAmount = callerAmount != null
      ? callerAmount
      : (booking.costs && booking.costs.total ? Number(booking.costs.total) : 0);

    const update = {
      status: "fully_paid",
      amountPaid: paidAmount,
      paymentTerm: 'full'
    };
    if (callerPaymentDetails) update.paymentDetails = callerPaymentDetails;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    res.json({
      success: true,
      message: "Booking status updated to fully_paid",
      booking: updatedBooking
    });
    (async () => {
      try {
        await sendBookingNotification(updatedBooking, 'fully_paid');
      } catch (err) {
        console.error('Mailchimp notify error (fully_paid):', err);
      }
    })();
  } catch (err) {
    res.status(500).json({ 
      success: false,
      msg: err.message 
    });
  }
};

// Admin: mark booking as completed (e.g., guest checked in)
export const setCompleted = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, msg: "Booking not found" });
    }

    // Do not complete a cancelled booking
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, msg: "Cannot complete a cancelled booking" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', checkedInAt: new Date() },
      { new: true }
    );

    res.json({ success: true, message: 'Booking marked as completed', booking: updatedBooking });

    (async () => {
      try {
        await sendBookingNotification(updatedBooking, 'checked_in');
      } catch (err) {
        console.error('Mailchimp notify error (checked_in):', err);
      }
    })();
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

export const reopenBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        msg: "Booking not found" 
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status: "pending" }, 
      { new: true }
    );

    res.json({
      success: true,
      message: "Booking reopened (status set to pending)",
      booking: updatedBooking
    });
    (async () => {
      try {
        await sendBookingNotification(updatedBooking, 'reopened');
      } catch (err) {
        console.error('Mailchimp notify error (reopened):', err);
      }
    })();
  } catch (err) {
    res.status(500).json({ 
      success: false,
      msg: err.message 
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        msg: "Booking not found" 
      });
    }

    // Check if user is authorized (admin or booking owner)
    if (req.user && req.user.role !== 'admin' && booking.customerEmail !== req.user.email) {
      return res.status(403).json({ 
        success: false,
        msg: "Not authorized to cancel this booking" 
      });
    }

    // Only allow cancellation of non-cancelled bookings
    if (booking.status === 'cancelled') {
      return res.status(400).json({ 
        success: false,
        msg: "Booking is already cancelled" 
      });
    }

    // Store old status for audit trail
    const previousStatus = booking.status;

    // Accept optional reason from request body
    const cancellationReason = req.body?.reason || req.body?.cancellationReason || null;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status: "cancelled",
        cancelledAt: new Date(),
        cancelledBy: req.user?.role || 'unknown',
        cancellationReason: cancellationReason
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      previousStatus,
      booking: updatedBooking
    });
    (async () => {
      try {
        await sendBookingNotification(updatedBooking, 'cancelled');
      } catch (err) {
        console.error('Mailchimp notify error (cancelled):', err);
      }
    })();
  } catch (err) {
    res.status(500).json({ 
      success: false,
      msg: err.message 
    });
  }
};

// Generate receipt for booking
export const generateReceipt = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ bookingId })
      .populate("property", "name location address")
      .populate("package", "name duration description");
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        msg: "Booking not found" 
      });
    }

    // Allow access if user is owner or admin
    if (req.user && req.user.role !== 'admin' && booking.customerEmail !== req.user.email) {
      return res.status(403).json({ 
        success: false,
        msg: "Not authorized to download this receipt" 
      });
    }

    // Format receipt data
    const receipt = {
      bookingId: booking.bookingId,
      confirmationNumber: booking.confirmationNumber,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      customerPhone: booking.customerPhone,
      bookingType: booking.bookingType,
      propertyName: booking.property?.name || 'N/A',
      propertyLocation: booking.property?.location || '',
      packageName: booking.package?.name || 'N/A',
      packageDuration: booking.package?.duration || '',
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      nights: booking.nights,
      totalGuests: booking.totalGuests,
      adults: booking.adults,
      children: booking.children,
      specialRequests: booking.specialRequests || 'None',
      rooms: booking.rooms || [],
      airportTransfer: booking.airportTransfer || { needed: false },
      amenities: booking.amenities || [],
      costs: booking.costs,
      paymentTerm: booking.paymentTerm,
      paymentSchedule: booking.paymentSchedule,
      amountPaid: booking.amountPaid,
      status: booking.status,
      createdAt: booking.createdAt,
      generatedAt: new Date()
    };

    res.json({
      success: true,
      receipt
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      msg: err.message 
    });
  }
};

// Manual notify endpoint to resend or trigger a specific notification for a booking
export const notifyBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'booking_created' } = req.body;
    const booking = await Booking.findById(id)
      .populate('property', 'name')
      .populate('package', 'name');

    if (!booking) return res.status(404).json({ success: false, msg: 'Booking not found' });

    await sendBookingNotification(booking, type);

    res.json({ success: true, message: `Notification '${type}' sent` });
  } catch (err) {
    console.error('notifyBooking error:', err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

// Send booking receipt email (by booking _id or bookingId)
export const sendReceiptEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body || {};

    const booking = await Booking.findOne({ $or: [{ _id: id }, { bookingId: id }] })
      .populate('property', 'name location address')
      .populate('package', 'name duration description');

    if (!booking) return res.status(404).json({ success: false, msg: 'Booking not found' });

    // If caller provided an email, ensure it matches booking.customerEmail for simple auth
    if (email && booking.customerEmail && email.toLowerCase().trim() !== booking.customerEmail.toLowerCase().trim()) {
      return res.status(403).json({ success: false, msg: 'Email does not match booking recipient' });
    }

    const recipient = booking.customerEmail;
    if (!recipient) return res.status(400).json({ success: false, msg: 'Booking has no customer email' });

    const confirmRef = booking.confirmationNumber || booking.bookingId;
    const customerFirst = (booking.customerName || '').split(' ')[0] || 'Guest';
    const total = Number(booking.costs?.total) || 0;
    const amountPaid = Number(booking.amountPaid) || 0;
    const balance = Math.max(total - amountPaid, 0);

    // Brief HTML email body (full details are in the attached PDF)
    const receiptHtml = `
      <p>Dear ${customerFirst},</p>
      <p>Please find your detailed booking receipt attached as a PDF.</p>
      <ul>
        <li><strong>Booking ID:</strong> ${booking.bookingId}</li>
        <li><strong>Confirmation:</strong> ${confirmRef}</li>
        <li><strong>Property:</strong> ${booking.property?.name || 'N/A'}</li>
        <li><strong>Check-in:</strong> ${booking.checkInDate ? new Date(booking.checkInDate).toDateString() : 'N/A'}</li>
        <li><strong>Check-out:</strong> ${booking.checkOutDate ? new Date(booking.checkOutDate).toDateString() : 'N/A'}</li>
        <li><strong>Total:</strong> $${total.toFixed(2)}</li>
        <li><strong>Amount Paid:</strong> $${amountPaid.toFixed(2)}</li>
        <li><strong>Balance Due:</strong> $${balance.toFixed(2)}</li>
      </ul>
      <p>Kind regards,<br/>The Bush Collection</p>
    `;

    // Generate comprehensive PDF receipt
    const pdfBuffer = await buildReceiptPdf(booking);
    const pdfBase64 = pdfBuffer.toString('base64');

    // Send via Mandrill (Mailchimp Transactional) with PDF attachment
    const mandrillResult = await sendViaMandrill({
      to: recipient,
      toName: booking.customerName || '',
      subject: `Your booking receipt - ${confirmRef}`,
      html: receiptHtml,
      text: `Booking receipt for ${confirmRef}`,
      attachments: [{
        type: 'application/pdf',
        name: `Receipt_${confirmRef}.pdf`,
        content: pdfBase64,
      }],
    });

    return res.json({ success: true, message: 'Receipt emailed via Mailchimp', data: mandrillResult });
  } catch (err) {
    console.error('sendReceiptEmail error:', err);
    return res.status(500).json({ success: false, msg: err.message || 'Failed to send receipt' });
  }
};
