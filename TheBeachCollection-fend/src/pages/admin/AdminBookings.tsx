import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Users, DollarSign, Search, Filter, ArrowUpDown, Eye, Check, X, Clock, Download, FileText, Trash2, Plane, Loader2, XCircle, RefreshCw, CreditCard, CircleDollarSign } from 'lucide-react';
import { useBackendBookings, type SafariBooking } from '@/hooks/useBackendBookings';
import { exportToCSV, exportToPDF } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';

// Define the correct status types based on your database
type BookingStatus = 'inquiry' | 'confirmed' | 'deposit-paid' | 'fully-paid' | 'completed' | 'cancelled';

interface BookingRow {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  propertyName: string;
  roomName: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  nights?: number;
  pricePerNight?: number;
  total?: number;
  status?: BookingStatus | string;
  createdAt?: string;
  specialRequests?: string;
  airportTransfer?: unknown;
  amenities?: unknown[];
  depositPaid?: number;
  balanceDue?: number;
}
export default function AdminBookings() {
  const { bookings: supabaseBookings, loading, error, updateBooking, refetch, notifyBooking } = useBackendBookings();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedBooking, setSelectedBooking] = useState<SafariBooking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getRoomName = (b?: SafariBooking | null) => {
    if (!b) return 'Unknown Room';
    return b.room_name || (b as any).safari_rooms?.name || ((b as any).rooms && (b as any).rooms[0] ? ((b as any).rooms[0].roomName || (b as any).rooms[0].name) : undefined) || (b as any).roomName || 'Unknown Room';
  };

  // Map Supabase bookings to the format expected by the component
  const bookings = supabaseBookings.map(booking => {
    const roomName = booking.room_name || (booking as any).safari_rooms?.name || ((booking as any).rooms && (booking as any).rooms[0] ? ((booking as any).rooms[0].roomName || (booking as any).rooms[0].name) : undefined) || (booking as any).roomName || 'Unknown Room';
    return {
      id: booking.id,
      customerName: booking.guest_name || 'Unknown Guest',
      customerEmail: booking.guest_email || '',
      customerPhone: booking.guest_phone || '',
      propertyName: booking.safari_properties?.name || booking.property_name || 'Unknown Property',
      roomName,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      guests: booking.total_guests || (booking.adults + booking.children),
      nights: differenceInDays(new Date(booking.check_out), new Date(booking.check_in)),
      pricePerNight: 0, // Not available in Supabase schema
      total: booking.total_amount || 0,
      status: booking.status as BookingStatus, // Use correct type
      createdAt: booking.created_at,
      specialRequests: booking.special_requirements || '',
      airportTransfer: booking.transfer_details as unknown,
      amenities: [] as unknown[], // Not available in current Supabase schema
      depositPaid: booking.deposit_paid || 0,
      balanceDue: booking.balance_due || 0
    };
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'inquiry':
        return <Badge className="bg-blue-100 text-blue-800">Inquiry</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'deposit-paid':
        return <Badge className="bg-purple-100 text-purple-800">Deposit Paid</Badge>;
      case 'fully-paid':
        return <Badge className="bg-green-100 text-green-800">Fully Paid</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: BookingStatus) => {
    // Prevent editing of cancelled bookings (except for reconfirming)
    const currentBooking = supabaseBookings.find(b => b.id === bookingId);
    if (currentBooking?.status === 'cancelled' && newStatus !== 'confirmed' && newStatus !== 'inquiry') {
      toast.error('Cannot edit cancelled bookings. Please reconfirm the booking first.');
      return;
    }

    try {
      // Get the current booking data to access payment amounts
      if (!currentBooking) {
        toast.error('Booking not found');
        return;
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // When marking as fully paid, update payment fields
      if (newStatus === 'fully-paid') {
        // When changing from deposit-paid to fully-paid, update to full payment
        if (currentBooking.status === 'deposit-paid') {
          updateData.deposit_paid = currentBooking.total_amount || 0;
          updateData.balance_due = 0;
        } else {
          // When marking as fully paid from other statuses
          updateData.deposit_paid = currentBooking.total_amount || 0;
          updateData.balance_due = 0;
        }
      }
      // When marking as deposit-paid, set a reasonable deposit amount (e.g., 50% of total)
      else if (newStatus === 'deposit-paid') {
        const totalAmount = currentBooking.total_amount || 0;
        const depositAmount = totalAmount * 0.5; // 50% deposit
        updateData.deposit_paid = depositAmount;
        updateData.balance_due = totalAmount - depositAmount;
      }

      await updateBooking(bookingId, updateData);

      // Refresh the bookings data to ensure UI updates
      await refetch();

      const statusMessages = {
        'inquiry': 'Booking set to inquiry',
        'confirmed': 'Booking confirmed successfully',
        'deposit-paid': 'Deposit payment recorded',
        'fully-paid': 'Full payment recorded',
        'completed': 'Booking marked as completed',
        'cancelled': 'Booking cancelled'
      };

      toast.success(statusMessages[newStatus]);
    } catch (error) {
      console.error('Failed to update booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        // Note: Delete functionality needs to be implemented in useSupabaseBookings
        toast.info('Delete functionality coming soon');
        // Close details dialog if the deleted booking was being viewed
        if (selectedBooking?.id === bookingId) {
          setIsDetailsOpen(false);
          setSelectedBooking(null);
        }
      } catch (error) {
        toast.error('Failed to delete booking');
      }
    }
  };

  const handleViewDetails = (bookingId: string) => {
    const booking = supabaseBookings.find(b => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setIsDetailsOpen(true);
    }
  };

  const handleNotify = async (bookingId: string, type = 'booking_created') => {
    try {
      toast.info('Sending notification...');
      await notifyBooking(bookingId, type, true);
      toast.success('Notification sent');
    } catch (err) {
      console.error('Failed to send notification:', err);
      toast.error('Failed to send notification');
    }
  };

  // Get appropriate action buttons based on current status
  const getStatusActionButtons = (booking: BookingRow) => {
    const currentStatus: BookingStatus = booking.status as BookingStatus;
    
    switch (currentStatus) {
      case 'inquiry':
        return (
          <>
            <Button 
              size="sm" 
              onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Confirm
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleStatusUpdate(booking.id, 'deposit-paid')}
              className="border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Deposit Paid
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </>
        );
      
      case 'confirmed':
        return (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate(booking.id, 'deposit-paid')}
              className="border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Deposit Paid
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate(booking.id, 'fully-paid')}
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <CircleDollarSign className="h-4 w-4 mr-1" />
              Fully Paid
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </>
        );

      case 'deposit-paid':
        return (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate(booking.id, 'fully-paid')}
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <CircleDollarSign className="h-4 w-4 mr-1" />
              Fully Paid
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate(booking.id, 'completed')}
              className="border-gray-500 text-gray-600 hover:bg-gray-50"
            >
              <Check className="h-4 w-4 mr-1" />
              Complete
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </>
        );

      case 'fully-paid':
        return (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate(booking.id, 'completed')}
              className="border-gray-500 text-gray-600 hover:bg-gray-50"
            >
              <Check className="h-4 w-4 mr-1" />
              Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate(booking.id, 'deposit-paid')}
              className="border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              Revert to Deposit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </>
        );
      
      case 'completed':
        return (
          <>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleStatusUpdate(booking.id, 'fully-paid')}
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <CircleDollarSign className="h-4 w-4 mr-1" />
              Reopen
            </Button>
          </>
        );
      
      case 'cancelled':
        return (
          <>
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Reconfirm
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusUpdate(booking.id, 'inquiry')}
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Clock className="h-4 w-4 mr-1" />
              Set as Inquiry
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled
              className="text-gray-400 border-gray-200"
              title="Cancelled bookings cannot be edited directly"
            >
              <X className="h-4 w-4 mr-1" />
              Locked
            </Button>
          </>
        );
      
      default:
        return null;
    }
  };

  // Export functions
  const handleExportCSV = () => {
    try {
      exportToCSV(filteredAndSortedBookings, 'safari-bookings');
      toast.success('CSV export completed successfully!');
    } catch (error) {
      toast.error('Failed to export CSV. Please try again.');
    }
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(filteredAndSortedBookings, 'safari-bookings-report');
      toast.success('PDF export initiated. Check your browser for the print dialog.');
    } catch (error) {
      toast.error('Failed to export PDF. Please try again.');
    }
  };

  // Filter and sort bookings
  const filteredAndSortedBookings = bookings
    ?.filter(booking => {
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      const matchesSearch = searchTerm === '' || 
        booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || '').getTime();
      const dateB = new Date(b.createdAt || '').getTime();
      
      if (sortOrder === 'newest') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    }) || [];

  const totalBookings = bookings?.length || 0;
  const inquiryBookings = bookings?.filter(b => b.status === 'inquiry').length || 0;
  const confirmedBookings = bookings?.filter(b => b.status === 'confirmed').length || 0;
  const depositPaidBookings = bookings?.filter(b => b.status === 'deposit-paid').length || 0;
  const fullyPaidBookings = bookings?.filter(b => b.status === 'fully-paid').length || 0;
  const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
  const cancelledBookings = bookings?.filter(b => b.status === 'cancelled').length || 0;
  const totalRevenue = bookings?.reduce((sum, booking) => {
    // Include revenue from paid bookings (including completed ones that were previously paid)
    // This represents actual cash flow - money that was received, not just potential income
    if (booking.status === 'deposit-paid') {
      return sum + (booking.depositPaid || 0);
    } else if (booking.status === 'fully-paid') {
      return sum + (booking.total || 0);
    } else if (booking.status === 'completed') {
      // For completed bookings, include the amount that was actually paid
      // If depositPaid > 0, use that amount; otherwise use total (for fully paid completed bookings)
      if (booking.depositPaid && booking.depositPaid > 0) {
        return sum + (booking.depositPaid || 0);
      } else {
        return sum + (booking.total || 0);
      }
    }
    // Don't include revenue from unpaid bookings (inquiry, confirmed, cancelled)
    return sum;
  }, 0) || 0;
  const transferBookings = bookings?.filter(b => b.airportTransfer).length || 0;

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <XCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
        <p className="mb-4">Error loading data: {error}</p>
        <Button onClick={async () => { await refetch(); }} className="mr-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Export Buttons */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
          <p className="text-gray-600">Manage and track all property and package bookings</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={async () => { await refetch(); }}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={filteredAndSortedBookings.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={filteredAndSortedBookings.length === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
              </div>
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inquiries</p>
                <p className="text-2xl font-bold text-blue-600">{inquiryBookings}</p>
              </div>
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{confirmedBookings}</p>
              </div>
              <Check className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deposit Paid</p>
                <p className="text-2xl font-bold text-purple-600">{depositPaidBookings}</p>
              </div>
              <CreditCard className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fully Paid</p>
                <p className="text-2xl font-bold text-green-600">{fullyPaidBookings}</p>
              </div>
              <CircleDollarSign className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">From payments received</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by customer name, property, email, or booking ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="inquiry">Inquiry</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="deposit-paid">Deposit Paid</SelectItem>
                <SelectItem value="fully-paid">Fully Paid</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="w-full md:w-auto"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Summary */}
      {hasActiveFilters && filteredAndSortedBookings.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  Export Ready: {filteredAndSortedBookings.length} filtered bookings
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-1" />
                  CSV
                </Button>
                <Button size="sm" variant="outline" onClick={handleExportPDF}>
                  <FileText className="h-4 w-4 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Bookings ({filteredAndSortedBookings.length})
            {hasActiveFilters && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - Filtered Results
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Booking ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Property</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Dates</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Guests</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Transfer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedBookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-mono text-sm">#{booking.id.slice(0, 8)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{booking.customerName}</div>
                        <div className="text-sm text-gray-500">{booking.customerEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{booking.propertyName}</div>
                        {booking.roomName && (
                          <div className="text-sm text-gray-500">{booking.roomName}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div>{new Date(booking.checkIn).toLocaleDateString()}</div>
                          <div className="text-gray-500">to {new Date(booking.checkOut).toLocaleDateString()}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          {booking.guests}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {booking.airportTransfer ? (
                          <div className="flex items-center text-green-600">
                            <Plane className="h-4 w-4 mr-1" />
                            <span className="text-xs">Yes</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-gray-400">
                            <span className="text-xs">No</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">${(booking.total || 0).toFixed(2)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(booking.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleNotify(booking.id, 'booking_created')}
                            title="Resend confirmation/notification"
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Notify
                          </Button>
                          {getStatusActionButtons(booking)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">
                {hasActiveFilters
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Bookings will appear here once customers start making reservations.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Booking Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Booking Details - #{selectedBooking?.id}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              {/* Customer & Booking Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2 text-blue-600">Customer Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Name:</span>
                      <span className="text-gray-900">{selectedBooking.guest_name || 'Unknown Guest'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Email:</span>
                      <span className="text-gray-900">{selectedBooking.guest_email || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Phone:</span>
                      <span className="text-gray-900">{selectedBooking.guest_phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2 text-green-600">Booking Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Booking ID:</span>
                      <span className="text-gray-900">#{selectedBooking.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Status:</span>
                      <div>{getStatusBadge(selectedBooking.status as BookingStatus)}</div>
                    </div>
                    {selectedBooking.status === 'cancelled' && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Cancellation Reason:</span>
                        <span className="text-gray-900">{selectedBooking.cancellation_reason || selectedBooking._raw?.cancellationReason || 'Not provided'}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Booking Date:</span>
                      <span className="text-gray-900">
                        {new Date(selectedBooking.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stay Details */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2 text-orange-600">Stay Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-600 block">Property:</span>
                    <span className="text-gray-900 text-lg">{selectedBooking.safari_properties?.name || selectedBooking.property_name || 'Unknown'}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-600 block">Room:</span>
                    <span className="text-gray-900">{getRoomName(selectedBooking)}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-600 block">Guests:</span>
                    <span className="text-gray-900">{selectedBooking.total_guests || (selectedBooking.adults + selectedBooking.children)} guests ({selectedBooking.adults} adults, {selectedBooking.children} children)</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-600 block">Check-in:</span>
                    <span className="text-gray-900">{new Date(selectedBooking.check_in).toLocaleDateString()}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-600 block">Check-out:</span>
                    <span className="text-gray-900">{new Date(selectedBooking.check_out).toLocaleDateString()}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-600 block">Duration:</span>
                    <span className="text-gray-900">{differenceInDays(new Date(selectedBooking.check_out), new Date(selectedBooking.check_in))} nights</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-2 text-green-600">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-600 block">Total Amount:</span>
                    <span className="text-gray-900 text-lg">${(selectedBooking.total_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-600 block">Deposit Paid:</span>
                    <span className="text-gray-900">${(selectedBooking.deposit_paid || 0).toFixed(2)}</span>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <span className="font-medium text-gray-600 block">Balance Due:</span>
                    <span className="text-gray-900">${(selectedBooking.balance_due || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.special_requirements && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg border-b pb-2 text-orange-600">Special Requests</h4>
                  <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                    <p className="text-orange-900">{selectedBooking.special_requirements}</p>
                  </div>
                </div>
              )}

                {selectedBooking.status === 'cancelled' && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-800">Booking is Cancelled</p>
                        <p className="text-sm text-red-600">
                          This booking has been cancelled and cannot be edited directly.
                          Use the "Reconfirm Booking" button below to reactivate it first.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t flex-wrap">
                  {selectedBooking.status === 'inquiry' && (
                    <>
                      <Button
                        onClick={() => {
                          handleStatusUpdate(selectedBooking.id, 'confirmed');
                          setIsDetailsOpen(false);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Confirm Booking
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleStatusUpdate(selectedBooking.id, 'deposit-paid');
                          setIsDetailsOpen(false);
                        }}
                        className="border-purple-500 text-purple-600 hover:bg-purple-50"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Mark Deposit Paid
                      </Button>
                    </>
                  )}

                  {selectedBooking.status === 'confirmed' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleStatusUpdate(selectedBooking.id, 'deposit-paid');
                          setIsDetailsOpen(false);
                        }}
                        className="border-purple-500 text-purple-600 hover:bg-purple-50"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Mark Deposit Paid
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleStatusUpdate(selectedBooking.id, 'fully-paid');
                          setIsDetailsOpen(false);
                        }}
                        className="border-green-500 text-green-600 hover:bg-green-50"
                      >
                        <CircleDollarSign className="h-4 w-4 mr-2" />
                        Mark Fully Paid
                      </Button>
                    </>
                  )}

                  {selectedBooking.status === 'deposit-paid' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleStatusUpdate(selectedBooking.id, 'fully-paid');
                          setIsDetailsOpen(false);
                        }}
                        className="border-green-500 text-green-600 hover:bg-green-50"
                      >
                        <CircleDollarSign className="h-4 w-4 mr-2" />
                        Mark Fully Paid
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleStatusUpdate(selectedBooking.id, 'completed');
                          setIsDetailsOpen(false);
                        }}
                        className="border-gray-500 text-gray-600 hover:bg-gray-50"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark Completed
                      </Button>
                    </>
                  )}

                  {selectedBooking.status === 'fully-paid' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleStatusUpdate(selectedBooking.id, 'completed');
                        setIsDetailsOpen(false);
                      }}
                      className="border-gray-500 text-gray-600 hover:bg-gray-50"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Mark Completed
                    </Button>
                  )}

                  {(selectedBooking.status === 'inquiry' || selectedBooking.status === 'confirmed' || selectedBooking.status === 'deposit-paid' || selectedBooking.status === 'fully-paid') && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleStatusUpdate(selectedBooking.id, 'cancelled');
                        setIsDetailsOpen(false);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </Button>
                  )}

                  {(selectedBooking.status === 'cancelled' || selectedBooking.status === 'completed') && (
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedBooking.id, 'confirmed');
                        setIsDetailsOpen(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Reconfirm Booking
                    </Button>
                  )}

                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteBooking(selectedBooking.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Booking
                  </Button>

                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                    Close
                  </Button>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}