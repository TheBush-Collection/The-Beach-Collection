import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Calendar, AlertTriangle, AlertCircle, CheckCircle, User, DollarSign, Trash2, MapPin, Users, Download, RefreshCw, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CancellationDialog } from '@/components/BookingCancellation';
import { useBackendBookings, type SafariBooking } from '@/hooks/useBackendBookings';
import api from '@/lib/api';
import { useReviews } from '@/hooks/useReviews';

type UserBooking = SafariBooking & { property_name?: string; package_name?: string; package_id?: string };
import ReviewSubmission from '@/components/ReviewSubmission';
import { toast } from 'sonner';

export default function UserDashboard() {
  const { user } = useAuth();
  const { bookings, cancelBooking, notifyBooking } = useBackendBookings();
  const { reviews } = useReviews();
  const [activeTab, setActiveTab] = useState('bookings');

  // Backend returns bookings for authenticated user only
  const userBookings = bookings;

  const getUpcomingBookings = () => {
    const today = new Date();
    return userBookings.filter(booking =>
      new Date(booking.check_in) > today && booking.status !== 'cancelled'
    );
  };

  const getPastBookings = () => {
    const today = new Date();
    return userBookings.filter(booking =>
      new Date(booking.check_out) < today
    );
  };

  const upcomingBookings = getUpcomingBookings();
  const pastBookings = getPastBookings();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F4FAFF] to-white py-12">
        <Card className="w-96 rounded-2xl bg-white/90 shadow-2xl ring-1 ring-[#92AAD1]/10">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[#749DD0]" />
            <h2 className="text-xl font-semibold mb-2 text-[#33343B]">Please Log In</h2>
            <p className="text-[#48547C] mb-4">You need to be logged in to access your dashboard.</p>
            <Button className="bg-gradient-to-r from-[#749DD0] to-[#48547C] text-white shadow-lg">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FB] to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-[#749DD0] to-[#48547C] text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user.fullName || user.email?.split('@')[0]}!
              </h1>
              <p className="mt-1 text-[#EAF6FF]">
                Manage your safari bookings and adventures
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="rounded-2xl shadow-2xl ring-1 ring-[#92AAD1]/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingBookings.length}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-2xl ring-1 ring-[#92AAD1]/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Trips</p>
                  <p className="text-2xl font-bold text-gray-900">{pastBookings.length}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-2xl ring-1 ring-[#92AAD1]/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{userBookings.length}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-full">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Removed Total Spent card per request */}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews & Feedback</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <BookingsTab bookings={bookings} cancelBooking={cancelBooking} notifyBooking={notifyBooking} />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <ReviewSubmission />
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-sm text-gray-900">{user.fullName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-2">Booking Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Total Bookings</div>
                      <div className="font-medium">{userBookings.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Upcoming</div>
                      <div className="font-medium text-blue-600">{upcomingBookings.length}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Completed</div>
                      <div className="font-medium text-green-600">{pastBookings.length}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BookingsTab({ bookings, cancelBooking, notifyBooking }: { bookings: UserBooking[]; cancelBooking: (id: string) => Promise<unknown>; notifyBooking: (id: string, type?: string, asAdmin?: boolean) => Promise<void> }) {
  const [cancellationLoading, setCancellationLoading] = useState<string | null>(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);
  const [emailingReceipt, setEmailingReceipt] = useState<string | null>(null);

  const today = new Date();

  const upcomingBookings = bookings.filter(booking =>
    new Date(booking.check_in) > today && booking.status !== 'cancelled'
  );

  const pastBookings = bookings.filter(booking =>
    new Date(booking.check_out) < today
  );

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed' },
      deposit_paid: { color: 'bg-orange-100 text-orange-800', label: 'Deposit Paid' },
      fully_paid: { color: 'bg-green-100 text-green-800', label: 'Fully Paid' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      completed: { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellationLoading(bookingId);
      await cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel booking');
      console.error('Cancel booking error:', error);
    } finally {
      setCancellationLoading(null);
    }
  };

  const handleDownloadReceipt = async (booking: SafariBooking) => {
    try {
      setDownloadingReceipt(booking.id);

      // Fetch receipt data (JSON) from backend
      const res = await api.get(`/bookings/receipt/${booking.bookingId}`);
      if (!res?.data?.success || !res.data.receipt) {
        throw new Error(res?.data?.msg || 'No receipt data returned');
      }

      const r = res.data.receipt;
      const fmtDate = (d: string | null | undefined) =>
        d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
      const fmtCur = (v: number | null | undefined) =>
        v != null ? `$${Number(v).toFixed(2)}` : '$0.00';

      // Load logo as base64
      let logoBase64: string | null = null;
      try {
        const resp = await fetch('https://res.cloudinary.com/dfaakg2ds/image/upload/v1770803318/PNG-LOGO_1_xlw56b.png');
        const blob = await resp.blob();
        logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch { /* logo optional */ }

      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pw = 210;
      const mL = 16;
      const mR = 16;
      const cW = pw - mL - mR;
      let y = 0;

      // Colours
      const gold = [201, 169, 97] as const;
      const dark = [26, 26, 26] as const;
      const mid = [74, 74, 74] as const;
      const light = [119, 119, 119] as const;
      const white = [255, 255, 255] as const;
      const bgGray = [250, 250, 250] as const;

      const checkPage = (need = 12) => { if (y > 285 - need) { doc.addPage(); y = 14; } };

      // ═══════════════════════ HEADER BAR ═══════════════════════
      doc.setFillColor(...white);
      doc.rect(0, 0, pw, 38, 'F');

      if (logoBase64) {
        try { doc.addImage(logoBase64, 'PNG', mL, 4, 0, 19); } catch { /* skip */ }
      }

      doc.setTextColor(...dark);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('BOOKING RECEIPT', pw - mR, 14, { align: 'right' });
      doc.setFontSize(9);
      doc.setTextColor(...gold);
      doc.text(`Receipt #${r.confirmationNumber || r.bookingId}`, pw - mR, 21, { align: 'right' });
      doc.setTextColor(...light);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Date: ${fmtDate(r.createdAt)}`, pw - mR, 27, { align: 'right' });

      // Gold accent line
      doc.setFillColor(...gold);
      doc.rect(0, 38, pw, 1.2, 'F');
      y = 44;

      // ═══════════════════════ STATUS BADGE ═══════════════════════
      const statusText = (r.status || 'pending').toUpperCase();
      const statusColorMap: Record<string, readonly [number, number, number]> = {
        PENDING: [245, 158, 11], DEPOSIT_PAID: [249, 115, 22], CONFIRMED: [59, 130, 246],
        FULLY_PAID: [16, 185, 129], CANCELLED: [239, 68, 68], COMPLETED: [107, 114, 128]
      };
      const badgeCol: readonly [number, number, number] = statusColorMap[statusText] || gold;
      doc.setFillColor(...badgeCol);
      doc.roundedRect(pw - mR - 34, y - 2, 34, 8, 1.5, 1.5, 'F');
      doc.setTextColor(...white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(statusText, pw - mR - 17, y + 3.6, { align: 'center' });

      // Booking ID
      doc.setTextColor(...light);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Booking ID', mL, y + 1);
      doc.setTextColor(...dark);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(r.bookingId || '', mL, y + 6);
      y += 14;

      // ═══════════════════════ HELPERS ═══════════════════════
      const colW = (cW - 6) / 2;
      const rX = mL + colW + 6;

      const sectionLabel = (text: string, x: number) => {
        doc.setTextColor(...gold);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text(text.toUpperCase(), x, y);
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.2);
        doc.line(x, y + 1.5, x + colW, y + 1.5);
        y += 5;
      };

      const field = (lbl: string, val: string, x: number) => {
        doc.setTextColor(...light);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(lbl, x, y);
        doc.setTextColor(...dark);
        doc.setFontSize(8);
        doc.text(String(val ?? 'N/A'), x, y + 3.5);
        y += 8;
      };

      const fieldInline = (lbl: string, val: string, x: number, yy: number) => {
        doc.setTextColor(...light);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text(lbl, x, yy);
        doc.setTextColor(...dark);
        doc.setFontSize(8);
        doc.text(String(val ?? 'N/A'), x, yy + 3.5);
      };

      // ═══════════════════════ TWO-COL: CUSTOMER | PROPERTY ═══════════════════════
      const yAnchor = y;
      // Left col – Customer
      sectionLabel('Customer Details', mL);
      field('Name', r.customerName, mL);
      field('Email', r.customerEmail, mL);
      if (r.customerPhone) field('Phone', `${r.customerCountryCode || ''} ${r.customerPhone}`.trim(), mL);
      const yAfterLeft = y;

      // Right col – Property/Package
      y = yAnchor;
      sectionLabel('Property / Package', rX);
      if (r.bookingType === 'property') {
        field('Property', r.propertyName, rX);
        if (r.propertyLocation) field('Location', r.propertyLocation, rX);
      }
      if (r.bookingType === 'package' || (r.packageName && r.packageName !== 'N/A')) {
        field('Package', r.packageName, rX);
        if (r.packageDuration) field('Duration', r.packageDuration, rX);
      }
      y = Math.max(yAfterLeft, y) + 4;

      // ═══════════════════════ STAY DETAILS CARD ═══════════════════════
      checkPage(28);
      doc.setFillColor(...bgGray);
      doc.setDrawColor(229, 229, 229);
      doc.setLineWidth(0.2);
      doc.roundedRect(mL, y, cW, 22, 1, 1, 'FD');

      const stayFields = [
        { lbl: 'Check-in', val: fmtDate(r.checkInDate) },
        { lbl: 'Check-out', val: fmtDate(r.checkOutDate) },
        { lbl: 'Nights', val: String(r.nights ?? 0) },
        { lbl: 'Guests', val: `${r.adults || 0} Adults, ${r.children || 0} Children` },
      ];
      const sfW = cW / stayFields.length;
      stayFields.forEach((sf, i) => {
        fieldInline(sf.lbl, sf.val, mL + i * sfW + 4, y + 5);
      });
      if (r.specialRequests && r.specialRequests !== 'None') {
        doc.setTextColor(...light);
        doc.setFontSize(7);
        doc.text('Special Requests:', mL + 4, y + 16);
        doc.setTextColor(...mid);
        doc.setFontSize(7.5);
        doc.text(r.specialRequests, mL + 38, y + 16, { maxWidth: cW - 44 });
      }
      y += 26;

      // ═══════════════════════ TABLE HELPER ═══════════════════════
      const drawTable = (title: string, headers: string[], widths: number[], rows: string[][]) => {
        checkPage(16 + rows.length * 7);
        y += 2;
        doc.setTextColor(...gold);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text(title.toUpperCase(), mL, y);
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.2);
        doc.line(mL, y + 1.5, mL + cW, y + 1.5);
        y += 5;

        // Header row
        doc.setFillColor(...dark);
        doc.rect(mL, y, cW, 7, 'F');
        let xOff = mL + 3;
        headers.forEach((h, i) => {
          const w = cW * widths[i];
          doc.setTextColor(204, 204, 204);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(7);
          doc.text(h, xOff, y + 4.5);
          xOff += w;
        });
        y += 7;

        // Data rows
        rows.forEach((row, ri) => {
          checkPage(8);
          if (ri % 2 === 0) { doc.setFillColor(...bgGray); doc.rect(mL, y, cW, 7, 'F'); }
          xOff = mL + 3;
          row.forEach((cell, ci) => {
            const w = cW * widths[ci];
            doc.setTextColor(...mid);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.text(String(cell ?? ''), xOff, y + 4.5);
            xOff += w;
          });
          y += 7;
        });
        doc.setDrawColor(229, 229, 229);
        doc.setLineWidth(0.2);
        doc.line(mL, y, mL + cW, y);
        y += 3;
      };

      // ═══════════════════════ ROOMS TABLE ═══════════════════════
      const rooms = r.rooms || [];
      const bookingNights = Number(r.nights) || 1;
      if (rooms.length > 0) {
        drawTable('Room Selection',
          ['Room', 'Qty', 'Guests', 'Price/Night/Pax', 'Subtotal'],
          [0.30, 0.10, 0.12, 0.24, 0.24],
          rooms.map((rm: Record<string, unknown>) => {
            const ppnpp = Number(rm.pricePerNightPerPerson) || 0;
            const guests = Number(rm.guests) || 1;
            const qty = Number(rm.quantity) || 1;
            const subtotal = Number(rm.subtotal) || (ppnpp * guests * qty * bookingNights);
            return [
              String(rm.roomName || 'Room'),
              String(qty),
              String(guests),
              fmtCur(ppnpp),
              fmtCur(subtotal),
            ];
          })
        );
      }

      // ═══════════════════════ AIRPORT TRANSFER ═══════════════════════
      const at = r.airportTransfer || {};
      if (typeof at === 'object' && at.needed) {
        checkPage(22);
        y += 2;
        const yAnch2 = y;
        sectionLabel('Airport Transfer', mL);
        if (at.arrivalDate || at.arrivalTime || at.arrivalFlightNumber) {
          field('Arrival', `${fmtDate(at.arrivalDate)}  ${at.arrivalTime || ''}  Flight: ${at.arrivalFlightNumber || 'N/A'}`, mL);
        }
        if (at.departureDate || at.departureTime || at.departureFlightNumber) {
          field('Departure', `${fmtDate(at.departureDate)}  ${at.departureTime || ''}  Flight: ${at.departureFlightNumber || 'N/A'}`, mL);
        }
        if (y === yAnch2 + 5) y += 4; // if nothing printed, add space
        y += 2;
      }

      // ═══════════════════════ AMENITIES TABLE ═══════════════════════
      const amenities = r.amenities || [];
      if (amenities.length > 0) {
        drawTable('Selected Amenities',
          ['Amenity', 'Qty', 'Unit Price', 'Total'],
          [0.45, 0.15, 0.20, 0.20],
          amenities.map((a: Record<string, unknown>) => [
            String(a.amenityName || 'Amenity'),
            String(a.quantity ?? 1),
            fmtCur(a.pricePerUnit as number),
            fmtCur(a.totalPrice as number),
          ])
        );
      }

      // ═══════════════════════ COST SUMMARY ═══════════════════════
      if (r.costs) {
        // Back-compute cost breakdown for legacy bookings that only have a total
        const totalAmt = Number(r.costs.total) || 0;
        if (totalAmt > 0 && !r.costs.basePrice && !r.costs.serviceFee && !r.costs.taxes) {
          const isProperty = r.bookingType === 'property';
          const taxRate = isProperty ? 0.15 : 0.12;
          const feeRate = 0.10;
          const divisor = 1 + feeRate + taxRate;
          r.costs.basePrice   = Math.round((totalAmt / divisor) * 100) / 100;
          r.costs.serviceFee  = Math.round((r.costs.basePrice * feeRate) * 100) / 100;
          r.costs.taxes       = Math.round((r.costs.basePrice * taxRate) * 100) / 100;
          r.costs.subtotal    = Math.round((r.costs.basePrice + r.costs.serviceFee) * 100) / 100;
        }

        checkPage(40);
        y += 2;
        doc.setTextColor(...gold);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('COST SUMMARY', mL, y);
        doc.setDrawColor(...gold);
        doc.setLineWidth(0.2);
        doc.line(mL, y + 1.5, mL + cW, y + 1.5);
        y += 6;

        const costLine = (lbl: string, val: string, bold = false) => {
          const clr: readonly [number, number, number] = bold ? dark : mid;
          doc.setTextColor(...clr);
          doc.setFont('helvetica', bold ? 'bold' : 'normal');
          doc.setFontSize(bold ? 9 : 8);
          doc.text(lbl, mL, y);
          doc.text(val, mL + cW, y, { align: 'right' });
          y += bold ? 6 : 5;
        };

        if (r.costs.basePrice != null) costLine('Base Price', fmtCur(r.costs.basePrice));
        if (r.costs.amenitiesTotal > 0) costLine('Amenities', fmtCur(r.costs.amenitiesTotal));
        if (r.costs.serviceFee > 0) costLine('Service Fee (10%)', fmtCur(r.costs.serviceFee));
        if (r.costs.taxes > 0) costLine('Taxes (15%)', fmtCur(r.costs.taxes));

        // Total bar
        doc.setFillColor(...dark);
        doc.rect(mL, y, cW, 9, 'F');
        doc.setTextColor(...white);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('TOTAL', mL + 4, y + 6);
        doc.text(fmtCur(r.costs.total), mL + cW - 4, y + 6, { align: 'right' });
        y += 13;
      }

      // ═══════════════════════ PAYMENT DETAILS ═══════════════════════
      checkPage(30);
      doc.setTextColor(...gold);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text('PAYMENT DETAILS', mL, y);
      doc.setDrawColor(...gold);
      doc.setLineWidth(0.2);
      doc.line(mL, y + 1.5, mL + cW, y + 1.5);
      y += 6;

      const payTerm = r.paymentTerm || 'deposit';
      const amtPaid = Number(r.amountPaid) || 0;
      const total = Number(r.costs?.total) || 0;
      const balance = Math.max(total - amtPaid, 0);

      const payLine = (lbl: string, val: string) => {
        doc.setTextColor(...mid);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(lbl, mL, y);
        doc.text(val, mL + cW, y, { align: 'right' });
        y += 5;
      };

      payLine('Payment Term', payTerm === 'full' ? 'Full Payment' : 'Deposit + Balance');
      payLine('Amount Paid', fmtCur(amtPaid));

      // Balance bar
      const balColor: [number, number, number] = balance <= 0 ? [16, 185, 129] : [239, 68, 68];
      doc.setFillColor(...balColor);
      doc.rect(mL, y, cW, 8, 'F');
      doc.setTextColor(...white);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('BALANCE DUE', mL + 4, y + 5.5);
      doc.text(fmtCur(balance), mL + cW - 4, y + 5.5, { align: 'right' });
      y += 11;

      if (payTerm === 'deposit' && r.paymentSchedule) {
        const sched = r.paymentSchedule;
        if (sched.depositAmount) payLine('Deposit Amount', fmtCur(sched.depositAmount));
        if (sched.balanceAmount) payLine('Balance Amount', fmtCur(sched.balanceAmount));
        if (sched.depositDueDate) payLine('Deposit Due', fmtDate(sched.depositDueDate));
        if (sched.balanceDueDate) payLine('Balance Due Date', fmtDate(sched.balanceDueDate));
      }

      // ═══════════════════════ FOOTER ═══════════════════════
      const footerY = Math.max(y + 8, 275);
      doc.setFillColor(...dark);
      doc.rect(0, footerY, pw, 18, 'F');
      doc.setTextColor(153, 153, 153);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('The Bush Collection  •  info@thebushcollection.africa  •  +254116072343', pw / 2, footerY + 6, { align: 'center' });
      doc.setTextColor(102, 102, 102);
      doc.setFontSize(6);
      doc.text(`Generated on ${new Date().toLocaleString()}  •  Thank you for choosing The Bush Collection`, pw / 2, footerY + 11, { align: 'center' });

      // Save
      doc.save(`Receipt_${r.bookingId}.pdf`);
      toast.success('PDF receipt downloaded');
    } catch (error) {
      toast.error('Failed to download receipt');
      console.error('Receipt download error:', error);
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const handleResendNotification = async (booking: SafariBooking) => {
    try {
      toast.info('Resending confirmation...');
      await notifyBooking(booking.id, 'booking_created', false);
      toast.success('Confirmation resent');
    } catch (err) {
      console.error('Resend notification failed:', err);
      toast.error('Failed to resend confirmation');
    }
  };

  const handleEmailReceipt = async (booking: SafariBooking) => {
    try {
      setEmailingReceipt(booking.id);
      toast.info('Sending receipt to your email...');
      const res = await api.post(`/bookings/${booking.id}/email`);
      if (res?.data?.success) {
        toast.success('Receipt emailed successfully via Mailchimp');
      } else {
        throw new Error(res?.data?.msg || 'Failed to email receipt');
      }
    } catch (err: unknown) {
      console.error('Email receipt error:', err);
      const message = err instanceof Error ? err.message : 'Failed to email receipt';
      const axiosMsg = (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg;
      toast.error(axiosMsg || message);
    } finally {
      setEmailingReceipt(null);
    }
  };

  const BookingCard = ({ booking, isPast }: { booking: UserBooking; isPast: boolean }) => (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{booking.property_name || booking.package_name || 'Booking'}</h3>
            <p className="text-sm text-gray-600">Booking ID: {booking.bookingId}</p>
          </div>
          <div>{getStatusBadge(booking.status)}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Check-in: {new Date(booking.check_in).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Check-out: {new Date(booking.check_out).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="space-y-2">
            {(booking.total_guests || booking.adults || booking.children) && (
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                <span>{booking.total_guests ?? (booking.adults || 0) + (booking.children || 0)} {(booking.total_guests ?? (booking.adults || 0) + (booking.children || 0)) === 1 ? 'Guest' : 'Guests'}</span>
              </div>
            )}
            <div className="flex items-center text-sm font-semibold text-green-600">
              <DollarSign className="w-4 h-4 mr-2" />
              <span>${(booking.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {!isPast && booking.status !== 'cancelled' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownloadReceipt(booking)}
              disabled={downloadingReceipt === booking.id}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloadingReceipt === booking.id ? 'Downloading...' : 'Receipt'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEmailReceipt(booking)}
              disabled={emailingReceipt === booking.id}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              {emailingReceipt === booking.id ? 'Sending...' : 'Email Receipt'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleResendNotification(booking)}
              className="flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Resend
            </Button>
            <CancellationDialog
              booking={booking}
              onCancellationSuccess={() => window.location.reload()}
            />
          </div>
        )}

        {isPast && booking.status !== 'cancelled' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDownloadReceipt(booking)}
              disabled={downloadingReceipt === booking.id}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloadingReceipt === booking.id ? 'Downloading...' : 'Receipt'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEmailReceipt(booking)}
              disabled={emailingReceipt === booking.id}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              {emailingReceipt === booking.id ? 'Sending...' : 'Email Receipt'}
            </Button>
            <Link to={`/property/${booking._raw?.property?.slug || booking._raw?.property?._id || booking.package_id || ''}`} className="flex-1">
              <Button size="sm" variant="outline" className="w-full">
                View Property & Review
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-6">Start your journey by booking a property or package today</p>
          <Link to="/">
            <Button>Browse Properties</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Bookings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming Trips</h2>
        {upcomingBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-600">
              No upcoming bookings. <Link to="/" className="text-blue-600 hover:underline">Browse properties</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {upcomingBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} isPast={false} />
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Past Trips</h2>
        {pastBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-600">
              No past bookings yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pastBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} isPast={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// `notifyBooking` is supplied by the `useBackendBookings` hook; no local stub required.

