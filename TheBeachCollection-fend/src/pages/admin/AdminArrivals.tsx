import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO, startOfDay, endOfDay, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, isSameDay } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { exportMovementsToCSV, exportMovementsToPDF } from '@/utils/exportUtils';
import { toast } from 'sonner';
import { useBackendBookings } from '@/hooks/useBackendBookings';
import { 
  Users, MapPin, Phone, Mail, Car, Plane, 
  CheckCircle, XCircle, AlertCircle, Calendar, 
  PrinterIcon, Send, MessageSquare, Loader2,
  ChevronLeft, ChevronRight, CalendarDays, RefreshCw,
  Download, FileText
} from 'lucide-react';

import { DateRange } from 'react-day-picker';

type ViewMode = 'single' | 'week' | 'month';

interface GuestMovement {
  id: string;
  bookingId: string;
  guestName: string;
  propertyName: string;
  roomName: string;
  type: 'arrival' | 'departure';
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'delayed';
  transferType?: 'airport' | 'inter-camp' | 'self-drive';
  contactInfo: {
    phone?: string;
    email?: string;
  };
  specialRequests?: string;
  adults: number;
  children: number;
  flightNumber?: string;
  arrivalTime?: string;
  departureTime?: string;
}

export default function AdminArrivals() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date()
  });
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [movements, setMovements] = useState<GuestMovement[]>([]);
  const [selectedMovement, setSelectedMovement] = useState<GuestMovement | null>(null);
  const [checkInDialog, setCheckInDialog] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [voucherDialog, setVoucherDialog] = useState(false);
  
  const { bookings, loading, error, updateBooking, refetch } = useBackendBookings();

  // Update date range based on view mode and selected date
  useEffect(() => {
    switch (viewMode) {
      case 'single':
        setDateRange({
          from: startOfDay(selectedDate),
          to: endOfDay(selectedDate)
        });
        break;
      case 'week':
        setDateRange({
          from: startOfWeek(selectedDate, { weekStartsOn: 1 }),
          to: endOfWeek(selectedDate, { weekStartsOn: 1 })
        });
        break;
      case 'month':
        setDateRange({
          from: startOfMonth(selectedDate),
          to: endOfMonth(selectedDate)
        });
        break;
    }
  }, [selectedDate, viewMode]);

  // Generate movements data from Supabase bookings - UPDATED VERSION
  useEffect(() => {
    const generateMovements = () => {
      const filteredMovements: GuestMovement[] = [];
      
      if (bookings.length === 0) {
        return;
      }
      bookings.forEach((booking) => {
        // Use the actual booking data structure from SafariBooking
        let propertyName = booking.safari_properties?.name || booking.property_name || 'Unknown Property';
        let roomName = booking.room_name || (booking as any).safari_rooms?.name || ((booking as any).rooms && (booking as any).rooms[0] ? ((booking as any).rooms[0].roomName || (booking as any).rooms[0].name) : undefined) || (booking as any).roomName || 'Unknown Room';

        // Handle package bookings - get property info from package data
        if (booking.package_id && booking.safari_packages) {
          // For package bookings, use the package information
          propertyName = booking.safari_packages.destinations?.[0] || booking.safari_packages.name || 'Package Destination';
          roomName = 'Package Booking';
        }

        const guestName = booking.guest_name || booking.customer_name || booking.guest_email || 'Guest';

        // Get adults and children from booking
        const adults = booking.adults || 1;
        const children = booking.children || 0;

        // Check arrivals within date range
        if (booking.check_in) {
          try {
            const checkInDate = parseISO(booking.check_in);
            const isInRange = isWithinInterval(checkInDate, { start: dateRange.from, end: dateRange.to }) || 
                             (viewMode === 'single' && isSameDay(checkInDate, selectedDate));
            
            if (isInRange) {
              // Determine transfer type and flight info from airportTransfer
              let transferType: 'airport' | 'inter-camp' | 'self-drive' = 'self-drive';
              let flightNumber = '';
              let arrivalTime = '14:00'; // default

              if (booking.transfer_details) {
                transferType = 'airport';
                flightNumber = booking.transfer_details.arrivalFlightNumber || '';
                arrivalTime = booking.transfer_details.arrivalTime || '14:00';
              }

              filteredMovements.push({
                id: `arrival-${booking.id}`,
                bookingId: booking.id,
                guestName: guestName,
                propertyName: propertyName,
                roomName: roomName,
                type: 'arrival',
                date: booking.check_in,
                time: arrivalTime,
                status: booking.status === 'confirmed' ? 'pending' : 
                        booking.status === 'completed' ? 'completed' : 'pending',
                transferType: transferType,
                contactInfo: {
                  phone: booking.guest_phone || booking.customer_phone,
                  email: booking.guest_email || booking.customer_email,
                },
                specialRequests: booking.special_requirements,
                adults: adults,
                children: children,
                flightNumber: flightNumber,
                arrivalTime: arrivalTime,
              });
            }
          } catch (e) {
            console.error('Error processing arrival:', e);
          }
        }
        
        // Check departures within date range
        if (booking.check_out) {
          try {
            const checkOutDate = parseISO(booking.check_out);
            const isInRange = isWithinInterval(checkOutDate, { start: dateRange.from, end: dateRange.to }) || 
                             (viewMode === 'single' && isSameDay(checkOutDate, selectedDate));
            
            if (isInRange) {
              // Determine transfer type and flight info from airportTransfer
              let transferType: 'airport' | 'inter-camp' | 'self-drive' = 'self-drive';
              let flightNumber = '';
              let departureTime = '11:00'; // default

              if (booking.transfer_details) {
                transferType = 'airport';
                flightNumber = booking.transfer_details.departureFlightNumber || '';
                departureTime = booking.transfer_details.departureTime || '11:00';
              }

              filteredMovements.push({
                id: `departure-${booking.id}`,
                bookingId: booking.id,
                guestName: guestName,
                propertyName: propertyName,
                roomName: roomName,
                type: 'departure',
                date: booking.check_out,
                time: departureTime,
                status: booking.status === 'completed' ? 'completed' : 'pending',
                transferType: transferType,
                contactInfo: {
                  phone: booking.guest_phone || booking.customer_phone,
                  email: booking.guest_email || booking.customer_email,
                },
                specialRequests: booking.special_requirements,
                adults: adults,
                children: children,
                flightNumber: flightNumber,
                departureTime: departureTime,
              });
            }
          } catch (e) {
            console.error('Error processing departure:', e);
          }
        }
      });
      
      // Sort by date and time
      setMovements(filteredMovements.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      }));
    };

    if (!loading) {
      generateMovements();
    }
  }, [bookings, loading, dateRange, selectedDate, viewMode]);

  const handleCheckIn = async (movementId: string) => {
    try {
      const movement = movements.find(m => m.id === movementId);
      if (!movement) return;

      await updateBooking(movement.bookingId, { 
        status: 'completed', // <-- fix: set to completed
        updated_at: new Date().toISOString()
      });
      
      setMovements(prev => 
        prev.map(m => 
          m.id === movementId ? { ...m, status: 'completed' } : m
        )
      );
      
      toast.success('Guest checked in successfully!');
      setCheckInDialog(false);
    } catch (error) {
      toast.error('Failed to check in guest');
    }
  };

  const handleCheckOut = async (movementId: string) => {
    try {
      const movement = movements.find(m => m.id === movementId);
      if (!movement) return;

      await updateBooking(movement.bookingId, { 
        status: 'completed',
        updated_at: new Date().toISOString()
      });
      
      setMovements(prev => 
        prev.map(m => 
          m.id === movementId ? { ...m, status: 'completed' } : m
        )
      );
      
      toast.success('Guest checked out successfully!');
    } catch (error) {
      toast.error('Failed to check out guest');
    }
  };

  const sendNotification = (movement: GuestMovement, type: 'sms' | 'email') => {
    toast.success(`${type.toUpperCase()} notification sent to ${movement.guestName}`);
  };

  const printDocument = (movement: GuestMovement, docType: 'voucher' | 'itinerary') => {
    if (docType === 'voucher') {
      printVoucher(movement);
    } else {
      printItinerary(movement);
    }
  };

  const printVoucher = (movement: GuestMovement) => {
    const voucherNumber = `VC-${movement.bookingId}-${movement.id}`;
    const isArrival = movement.type === 'arrival';

    // Create HTML content for voucher
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Guest ${isArrival ? 'Welcome' : 'Departure'} Voucher</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #16a34a;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #16a34a;
            margin: 0;
            font-size: 28px;
          }
          .voucher-info {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
            font-size: 14px;
          }
          .card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 20px;
            overflow: hidden;
          }
          .card-header {
            background: #f0fdf4;
            padding: 12px 16px;
            border-bottom: 1px solid #e5e7eb;
            font-weight: bold;
            color: #166534;
          }
          .card-content {
            padding: 16px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
          }
          .info-item {
            margin-bottom: 12px;
          }
          .info-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .info-value {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
          }
          .transfer-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 16px 0;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
          }
          .special-requests {
            background: #fef3c7;
            padding: 12px;
            border-radius: 6px;
            border: 1px solid #f59e0b;
            margin: 16px 0;
          }
          .important-info {
            background: #fed7aa;
            padding: 16px;
            border-radius: 6px;
            border: 1px solid #ea580c;
          }
          .info-columns {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            font-size: 12px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
          .company-info {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
            font-size: 11px;
            color: #6b7280;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            background: #dcfce7;
            color: #166534;
          }
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Safari Tours</h1>
          <p>Guest ${isArrival ? 'Welcome' : 'Departure'} Voucher</p>
          <div class="voucher-info">
            <div>
              <div class="info-label">Voucher Number</div>
              <div class="info-value">${voucherNumber}</div>
            </div>
            <div style="text-align: right;">
              <div class="info-label">Date Issued</div>
              <div class="info-value">${format(new Date(), 'MMM dd, yyyy')}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">Guest Information <span class="status-badge">${movement.status.charAt(0).toUpperCase() + movement.status.slice(1)}</span></div>
          <div class="card-content">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Guest Name</div>
                <div class="info-value">${movement.guestName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Total Guests</div>
                <div class="info-value">${movement.adults + movement.children} (${movement.adults} adults, ${movement.children} children)</div>
              </div>
              <div class="info-item">
                <div class="info-label">Contact Phone</div>
                <div class="info-value">${movement.contactInfo.phone || 'Not provided'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Contact Email</div>
                <div class="info-value">${movement.contactInfo.email || 'Not provided'}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">${isArrival ? 'Arrival' : 'Departure'} Details</div>
          <div class="card-content">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Property</div>
                <div class="info-value">${movement.propertyName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Room</div>
                <div class="info-value">${movement.roomName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date</div>
                <div class="info-value">${format(parseISO(movement.date), 'EEEE, MMM dd, yyyy')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Time</div>
                <div class="info-value">${movement.time}</div>
              </div>
            </div>

            <div class="transfer-info">
              <div class="info-item">
                <div class="info-label">Transfer Type</div>
                <div class="info-value">${movement.transferType || 'Self-drive'}</div>
              </div>
              ${movement.flightNumber ? `
                <div class="info-item">
                  <div class="info-label">Flight Number</div>
                  <div class="info-value">${movement.flightNumber}</div>
                </div>
              ` : ''}
            </div>

            ${movement.specialRequests ? `
              <div class="special-requests">
                <strong>Special Requests:</strong><br>
                ${movement.specialRequests}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="card">
          <div class="card-header">Important Information</div>
          <div class="card-content">
            <div class="info-columns">
              <div>
                <strong>Check-in/Check-out Times</strong><br>
                Check-in: 2:00 PM<br>
                Check-out: 11:00 AM
              </div>
              <div>
                <strong>Emergency Contact</strong><br>
                24/7 Support: +1-800-SAFARI<br>
                Emergency: +1-800-HELP-911
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div class="company-info">
            <div>
              <strong>Safari Tours</strong><br>
              Creating unforgettable safari experiences
            </div>
            <div>
              <strong>Contact</strong><br>
              +254 116072343<br>
              info@thebushcollection.africa
            </div>
            <div>
              <strong>Address</strong><br>
              42 Claret Close, Silanga Road, Karen<br>
              P.O BOX 58671-00200, Nairobi
            </div>
          </div>
          <p>This voucher is valid only for the specified date and guest. Please present this voucher upon arrival.</p>
          <p>Generated on ${format(new Date(), 'MMM dd, yyyy \'at\' h:mm a')}</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window and print as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
    } else {
      alert('Please allow popups to print vouchers');
    }
  };

  const printItinerary = (movement: GuestMovement) => {
    toast.success(`Itinerary printed for ${movement.guestName}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'delayed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Delayed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getTransferIcon = (type?: string) => {
    switch (type) {
      case 'airport':
        return <Plane className="h-4 w-4" />;
      case 'inter-camp':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  // Quick navigation functions
  const goToToday = () => {
    setSelectedDate(new Date());
    setViewMode('single');
  };

  const goToTomorrow = () => {
    setSelectedDate(addDays(new Date(), 1));
    setViewMode('single');
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'single':
        setSelectedDate(direction === 'next' ? addDays(selectedDate, 1) : subDays(selectedDate, 1));
        break;
      case 'week':
        setSelectedDate(direction === 'next' ? addDays(selectedDate, 7) : subDays(selectedDate, 7));
        break;
      case 'month': {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setSelectedDate(newDate);
        break;
      }
    }
  };

  const getDateRangeLabel = () => {
    switch (viewMode) {
      case 'single':
        return format(selectedDate, 'MMM dd, yyyy');
      case 'week':
        return `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd, yyyy')}`;
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      default:
        return format(selectedDate, 'MMM dd, yyyy');
    }
  };

  // Filter movements for different views
  const arrivals = movements.filter(m => m.type === 'arrival');
  const departures = movements.filter(m => m.type === 'departure');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading arrivals and departures...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <XCircle className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
        <p className="mb-4">Error loading data: {error}</p>
        <Button onClick={refetch} className="mr-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Arrivals & Departures</h1>
          <p className="text-gray-600">Manage guest movements and transfers</p>
        </div>
        
        {/* Export and Date Navigation Controls */}
        <div className="flex items-center gap-2">
          {/* Export Buttons */}
          <div className="flex gap-1 mr-2 border-r pr-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => exportMovementsToCSV(movements, 'all', getDateRangeLabel())}
              disabled={movements.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => exportMovementsToPDF(movements, 'all', getDateRangeLabel())}
              disabled={movements.length === 0}
            >
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
          {/* Refresh Button */}
          <Button size="sm" variant="outline" onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          
          
          
          {/* View Mode Selector */}
          <div className="flex border rounded-lg">
            <Button
              size="sm"
              variant={viewMode === 'single' ? 'default' : 'ghost'}
              onClick={() => setViewMode('single')}
              className="rounded-r-none"
            >
              Day
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              onClick={() => setViewMode('week')}
              className="rounded-none border-x"
            >
              Week
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              onClick={() => setViewMode('month')}
              className="rounded-l-none"
            >
              Month
            </Button>
          </div>
          
          {/* Date Navigation */}
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[200px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  {getDateRangeLabel()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      setCalendarOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button size="sm" variant="outline" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Arrivals</p>
                <p className="text-2xl font-bold">{arrivals.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {arrivals.filter(a => a.status === 'completed').length} checked in
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departures</p>
                <p className="text-2xl font-bold">{departures.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {departures.filter(d => d.status === 'completed').length} checked out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Airport Transfers</p>
                <p className="text-2xl font-bold">
                  {movements.filter(m => m.transferType === 'airport').length}
                </p>
              </div>
              <Plane className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 mt-2">Scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inter-Camp Moves</p>
                <p className="text-2xl font-bold">
                  {movements.filter(m => m.transferType === 'inter-camp').length}
                </p>
              </div>
              <Car className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 mt-2">Between properties</p>
          </CardContent>
        </Card>
      </div>

      {/* Movement Tabs */}
      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="arrivals">Arrivals ({arrivals.length})</TabsTrigger>
          <TabsTrigger value="departures">Departures ({departures.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Movement Timeline - {getDateRangeLabel()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movements.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No movements scheduled</p>
                    <p className="text-sm">for {getDateRangeLabel()}</p>
                  </div>
                ) : (
                  movements.map((movement) => (
                    <div key={movement.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${
                          movement.status === 'completed' ? 'bg-green-500' : 
                          movement.status === 'delayed' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{movement.guestName}</p>
                            <p className="text-sm text-gray-600">
                              {movement.type === 'arrival' ? 'Arriving at' : 'Departing from'} {movement.propertyName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(parseISO(movement.date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{movement.time}</p>
                            {getStatusBadge(movement.status)}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {movement.adults + movement.children} guests
                          </span>
                          <span className="flex items-center">
                            {getTransferIcon(movement.transferType)}
                            <span className="ml-1 capitalize">{movement.transferType}</span>
                          </span>
                          <span>{movement.roomName}</span>
                          {movement.flightNumber && (
                            <span className="flex items-center">
                              <Plane className="h-4 w-4 mr-1" />
                              {movement.flightNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {movement.type === 'arrival' && movement.status === 'pending' && (
                          <Dialog open={checkInDialog} onOpenChange={setCheckInDialog}>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                onClick={() => setSelectedMovement(movement)}
                              >
                                Check In
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Check In Guest</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <p><strong>Guest:</strong> {selectedMovement?.guestName}</p>
                                  <p><strong>Property:</strong> {selectedMovement?.propertyName}</p>
                                  <p><strong>Room:</strong> {selectedMovement?.roomName}</p>
                                  <p><strong>Date:</strong> {selectedMovement && format(parseISO(selectedMovement.date), 'MMM dd, yyyy')}</p>
                                  {selectedMovement?.flightNumber && (
                                    <p><strong>Flight:</strong> {selectedMovement.flightNumber}</p>
                                  )}
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setCheckInDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button onClick={() => selectedMovement && handleCheckIn(selectedMovement.id)}>
                                    Confirm Check In
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}

                        {movement.type === 'departure' && movement.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCheckOut(movement.id)}
                          >
                            Check Out
                          </Button>
                        )}

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => sendNotification(movement, 'sms')}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>

                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => printDocument(movement, 'voucher')}
                        >
                          <PrinterIcon className="h-4 w-4 mr-1" />
                          Bill
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arrivals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Arrivals - {getDateRangeLabel()} ({arrivals.length})</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => exportMovementsToCSV(arrivals, 'arrivals', getDateRangeLabel())}
                    disabled={arrivals.length === 0}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => exportMovementsToPDF(arrivals, 'arrivals', getDateRangeLabel())}
                    disabled={arrivals.length === 0}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {arrivals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No arrivals scheduled for this period</p>
                  </div>
                ) : (
                  arrivals.map((arrival) => (
                    <div key={arrival.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{arrival.guestName}</h3>
                          <p className="text-sm text-gray-600">{arrival.propertyName} - {arrival.roomName}</p>
                          <p className="text-sm text-gray-600">
                            {format(parseISO(arrival.date), 'MMM dd, yyyy')} at {arrival.time}
                          </p>
                          {arrival.flightNumber && (
                            <p className="text-sm text-gray-600">Flight: {arrival.flightNumber}</p>
                          )}
                          {arrival.specialRequests && (
                            <p className="text-sm text-blue-600 mt-1">Special: {arrival.specialRequests}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {getStatusBadge(arrival.status)}
                          <p className="text-sm text-gray-600 mt-1">
                            {arrival.adults} adults, {arrival.children} children
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex space-x-2 text-sm">
                          {arrival.contactInfo.phone && (
                            <span className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {arrival.contactInfo.phone}
                            </span>
                          )}
                          {arrival.contactInfo.email && (
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {arrival.contactInfo.email}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => sendNotification(arrival, 'sms')}>
                            <Send className="h-4 w-4 mr-1" />
                            Notify
                          </Button>
                          {arrival.status === 'pending' && (
                            <Button size="sm" onClick={() => handleCheckIn(arrival.id)}>
                              Check In
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departures" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Departures - {getDateRangeLabel()} ({departures.length})</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => exportMovementsToCSV(departures, 'departures', getDateRangeLabel())}
                    disabled={departures.length === 0}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => exportMovementsToPDF(departures, 'departures', getDateRangeLabel())}
                    disabled={departures.length === 0}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departures.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No departures scheduled for this period</p>
                  </div>
                ) : (
                  departures.map((departure) => (
                    <div key={departure.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{departure.guestName}</h3>
                          <p className="text-sm text-gray-600">{departure.propertyName} - {departure.roomName}</p>
                          <p className="text-sm text-gray-600">
                            {format(parseISO(departure.date), 'MMM dd, yyyy')} at {departure.time}
                          </p>
                          {departure.flightNumber && (
                            <p className="text-sm text-gray-600">Flight: {departure.flightNumber}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {getStatusBadge(departure.status)}
                          <p className="text-sm text-gray-600 mt-1">
                            {departure.adults} adults, {departure.children} children
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex space-x-2 text-sm">
                          {departure.contactInfo.phone && (
                            <span className="flex items-center">
                              <Phone className="h-4 w-4 mr-1" />
                              {departure.contactInfo.phone}
                            </span>
                          )}
                          {departure.contactInfo.email && (
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {departure.contactInfo.email}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => printDocument(departure, 'voucher')}>
                            <PrinterIcon className="h-4 w-4 mr-1" />
                            Bill
                          </Button>
                          {departure.status === 'pending' && (
                            <Button size="sm" onClick={() => handleCheckOut(departure.id)}>
                              Check Out
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}