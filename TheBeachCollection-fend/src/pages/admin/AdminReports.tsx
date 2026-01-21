import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Users, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Phone,
  Globe,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Building,
  UserCheck,
  Loader2,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { toast } from 'sonner';
import { useBackendBookings, type SafariBooking } from '@/hooks/useBackendBookings';
import { differenceInDays } from 'date-fns';

interface ReportData {
  totalBookings: number;
  totalRevenue: number;
  totalGuests: number;
  averageBookingValue: number;
  revenueGrowth: number;
  bookingGrowth: number;
  occupancyData?: OccupancyData;
  guestAnalytics?: GuestAnalytics;
  revenueData?: RevenueData;
  propertyData?: PropertyData[];
}

interface OccupancyData {
  byProperty: Array<{
    property: string;
    occupancyRate: number;
    occupiedNights: number;
    totalNights: number;
    revenue: number;
    bookings: number;
    averageRate: number;
    averageStay: number;
    revenuePerBooking: number;
    peakDays: string;
  }>;
  overall: {
    occupancyRate: number;
    totalOccupied: number;
    totalAvailable: number;
    averageStay: number;
  };
}

interface GuestAnalytics {
  byCountry: Array<{
    country: string;
    bookings: number;
    revenue: number;
    guests: number;
    totalNights: number;
    averageBookingValue: number;
    averageStay: number;
    averageGroupSize: number;
    revenuePerGuest: number;
  }>;
  topCountries: Array<{
    country: string;
    bookings: number;
    revenue: number;
    guests: number;
    totalNights: number;
    averageBookingValue: number;
    averageStay: number;
    averageGroupSize: number;
    revenuePerGuest: number;
  }>;
  totalCountries: number;
  demographics: {
    totalGuests: number;
    totalRevenue: number;
    averageGroupSize: number;
    revenuePerGuest: number;
    topMarkets: string;
  };
}

interface RevenueData {
  trends: Array<{
    date: string;
    revenue: number;
    bookings: number;
    averageBookingValue: number;
    formattedDate: string;
  }>;
  bySource: Array<{
    source: string;
    revenue: number;
    bookings: number;
    averageValue: number;
  }>;
  totalRevenue: number;
  averageDailyRevenue: number;
}

interface PropertyData {
  property: string;
  bookings: number;
  revenue: number;
  guests: number;
  totalNights: number;
  averageBookingValue: number;
  averageStay: number;
  revenuePerNight: number;
  averageRating: number;
  occupancyRate: number;
}

// Country codes mapping for analytics
const countryCodeMap: { [key: string]: { name: string; flag: string } } = {
  '+1': { name: 'United States/Canada', flag: '🇺🇸' },
  '+44': { name: 'United Kingdom', flag: '🇬🇧' },
  '+33': { name: 'France', flag: '🇫🇷' },
  '+49': { name: 'Germany', flag: '🇩🇪' },
  '+39': { name: 'Italy', flag: '🇮🇹' },
  '+34': { name: 'Spain', flag: '🇪🇸' },
  '+31': { name: 'Netherlands', flag: '🇳🇱' },
  '+41': { name: 'Switzerland', flag: '🇨🇭' },
  '+43': { name: 'Austria', flag: '🇦🇹' },
  '+32': { name: 'Belgium', flag: '🇧🇪' },
  '+45': { name: 'Denmark', flag: '🇩🇰' },
  '+46': { name: 'Sweden', flag: '🇸🇪' },
  '+47': { name: 'Norway', flag: '🇳🇴' },
  '+358': { name: 'Finland', flag: '🇫🇮' },
  '+351': { name: 'Portugal', flag: '🇵🇹' },
  '+30': { name: 'Greece', flag: '🇬🇷' },
  '+48': { name: 'Poland', flag: '🇵🇱' },
  '+420': { name: 'Czech Republic', flag: '🇨🇿' },
  '+36': { name: 'Hungary', flag: '🇭🇺' },
  '+7': { name: 'Russia', flag: '🇷🇺' },
  '+86': { name: 'China', flag: '🇨🇳' },
  '+81': { name: 'Japan', flag: '🇯🇵' },
  '+82': { name: 'South Korea', flag: '🇰🇷' },
  '+91': { name: 'India', flag: '🇮🇳' },
  '+61': { name: 'Australia', flag: '🇦🇺' },
  '+64': { name: 'New Zealand', flag: '🇳🇿' },
  '+27': { name: 'South Africa', flag: '🇿🇦' },
  '+254': { name: 'Kenya', flag: '🇰🇪' },
  '+255': { name: 'Tanzania', flag: '🇹🇿' },
  '+256': { name: 'Uganda', flag: '🇺🇬' },
  '+250': { name: 'Rwanda', flag: '🇷🇼' },
  '+20': { name: 'Egypt', flag: '🇪🇬' },
  '+212': { name: 'Morocco', flag: '🇲🇦' },
  '+234': { name: 'Nigeria', flag: '🇳🇬' },
  '+233': { name: 'Ghana', flag: '🇬🇭' },
  '+55': { name: 'Brazil', flag: '🇧🇷' },
  '+52': { name: 'Mexico', flag: '🇲🇽' },
  '+54': { name: 'Argentina', flag: '🇦🇷' },
  '+56': { name: 'Chile', flag: '🇨🇱' },
  '+57': { name: 'Colombia', flag: '🇨🇴' },
  '+51': { name: 'Peru', flag: '🇵🇪' },
  '+971': { name: 'UAE', flag: '🇦🇪' },
  '+966': { name: 'Saudi Arabia', flag: '🇸🇦' },
  '+965': { name: 'Kuwait', flag: '🇰🇼' },
  '+974': { name: 'Qatar', flag: '🇶🇦' },
  '+973': { name: 'Bahrain', flag: '🇧🇭' },
  '+968': { name: 'Oman', flag: '🇴🇲' },
  '+962': { name: 'Jordan', flag: '🇯🇴' },
  '+961': { name: 'Lebanon', flag: '🇱🇧' },
  '+60': { name: 'Malaysia', flag: '🇲🇾' },
  '+65': { name: 'Singapore', flag: '🇸🇬' },
  '+66': { name: 'Thailand', flag: '🇹🇭' },
  '+84': { name: 'Vietnam', flag: '🇻🇳' },
  '+63': { name: 'Philippines', flag: '🇵🇭' },
  '+62': { name: 'Indonesia', flag: '🇮🇩' }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export default function AdminReports() {
  const [reportType, setReportType] = useState('occupancy');
  const [timeRange, setTimeRange] = useState('30');
  const [reportData, setReportData] = useState<ReportData>({
    totalBookings: 0,
    totalRevenue: 0,
    totalGuests: 0,
    averageBookingValue: 0,
    revenueGrowth: 0,
    bookingGrowth: 0
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const { bookings: supabaseBookings, loading, error, refetch } = useBackendBookings();

  // Map Supabase bookings to the format expected by reports
  const bookings = supabaseBookings.map(booking => ({
    id: booking.id,
    customerName: booking.guest_name || 'Unknown Guest',
    customerEmail: booking.guest_email || '',
    customerPhone: booking.guest_phone || '',
    propertyName: booking.safari_properties?.name || booking.property_name || 'Unknown Property',
    roomName: booking.room_name || booking.safari_rooms?.name || ((booking as any).rooms && (booking as any).rooms[0] ? ((booking as any).rooms[0].roomName || (booking as any).rooms[0].name) : undefined) || (booking as any).roomName || 'Unknown Room',
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    guests: booking.total_guests || (booking.adults + booking.children),
    nights: differenceInDays(new Date(booking.check_out), new Date(booking.check_in)),
    pricePerNight: 0,
    total: booking.total_amount || 0,
    status: booking.status as 'pending' | 'confirmed' | 'cancelled' | 'deposit-paid' | 'fully-paid' | 'completed' | 'inquiry',
    createdAt: booking.created_at,
    specialRequests: booking.special_requirements || '',
    airportTransfer: booking.transfer_details,
    source: booking.booking_type || 'Direct Booking',
    depositPaid: booking.deposit_paid || 0,
    balanceDue: booking.balance_due || 0
  }));

  useEffect(() => {
    if (supabaseBookings.length > 0) {
      generateReportData();
    }
  }, [timeRange, reportType, supabaseBookings]);

  const generateReportData = () => {
    const data: ReportData = {
      totalBookings: 0,
      totalRevenue: 0,
      totalGuests: 0,
      averageBookingValue: 0,
      revenueGrowth: 0,
      bookingGrowth: 0
    };

    // Filter bookings by time range
    const now = new Date();
    const daysAgo = new Date(now.getTime() - (parseInt(timeRange) * 24 * 60 * 60 * 1000));
    
    const currentBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.createdAt || booking.checkIn);
      return bookingDate >= daysAgo;
    });

    // Basic metrics
    data.totalBookings = currentBookings.length;
    data.totalRevenue = currentBookings.reduce((sum, booking) => {
      // Only include revenue from paid bookings (including completed ones that were previously paid)
      if (booking.status === 'deposit-paid') {
        return sum + (booking.depositPaid || 0);
      } else if (booking.status === 'fully-paid') {
        return sum + (booking.total || 0);
      } else if (booking.status === 'completed') {
        // For completed bookings, include the amount that was actually paid
        if (booking.depositPaid && booking.depositPaid > 0) {
          return sum + (booking.depositPaid || 0);
        } else {
          return sum + (booking.total || 0);
        }
      }
      // Don't include revenue from unpaid bookings (inquiry, confirmed, cancelled)
      return sum;
    }, 0);
    data.totalGuests = currentBookings.reduce((sum, booking) => sum + (booking.guests || 0), 0);
    data.averageBookingValue = data.totalBookings > 0 ? data.totalRevenue / data.totalBookings : 0;

    // Occupancy Report
    if (reportType === 'occupancy') {
      data.occupancyData = calculateOccupancyReport(currentBookings);
    }

    // Guest Analytics Report
    if (reportType === 'guest') {
      data.guestAnalytics = calculateGuestReport(currentBookings);
    }

    // Revenue Report
    if (reportType === 'revenue') {
      data.revenueData = calculateRevenueReport(currentBookings);
    }

    // Property Performance Report
    if (reportType === 'property') {
      data.propertyData = calculatePropertyReport(currentBookings);
    }

    // Growth comparison
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (parseInt(timeRange) * 2));
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - parseInt(timeRange));
    
    const previousBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.createdAt || booking.checkIn);
      return bookingDate >= previousPeriodStart && bookingDate <= previousPeriodEnd;
    });

    const previousRevenue = previousBookings.reduce((sum, booking) => {
      // Only include revenue from paid bookings (including completed ones that were previously paid)
      if (booking.status === 'deposit-paid') {
        return sum + (booking.depositPaid || 0);
      } else if (booking.status === 'fully-paid') {
        return sum + (booking.total || 0);
      } else if (booking.status === 'completed') {
        // For completed bookings, include the amount that was actually paid
        if (booking.depositPaid && booking.depositPaid > 0) {
          return sum + (booking.depositPaid || 0);
        } else {
          return sum + (booking.total || 0);
        }
      }
      // Don't include revenue from unpaid bookings (inquiry, confirmed, cancelled)
      return sum;
    }, 0);
    data.revenueGrowth = previousRevenue > 0 ? ((data.totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    data.bookingGrowth = previousBookings.length > 0 ? ((data.totalBookings - previousBookings.length) / previousBookings.length) * 100 : 0;

    setReportData(data);
  };

  const calculateOccupancyReport = (bookings: any[]): OccupancyData => {
    const occupancyByProperty: { [key: string]: { 
      total: number, 
      occupied: number, 
      revenue: number, 
      bookings: number,
      averageStay: number,
      peakDays: string[]
    } } = {};
    
    bookings.forEach(booking => {
      const propertyName = booking.propertyName;
      
      if (!occupancyByProperty[propertyName]) {
        occupancyByProperty[propertyName] = { 
          total: 0, 
          occupied: 0, 
          revenue: 0, 
          bookings: 0,
          averageStay: 0,
          peakDays: []
        };
      }
      
      // Calculate nights stayed
      if (booking.checkIn && booking.checkOut) {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        
        occupancyByProperty[propertyName].occupied += nights;
        // Calculate actual revenue (only paid amounts)
        if (booking.status === 'deposit-paid') {
          occupancyByProperty[propertyName].revenue += booking.depositPaid || 0;
        } else if (booking.status === 'fully-paid') {
          occupancyByProperty[propertyName].revenue += booking.total || 0;
        } else if (booking.status === 'completed') {
          // For completed bookings, include the amount that was actually paid
          if (booking.depositPaid && booking.depositPaid > 0) {
            occupancyByProperty[propertyName].revenue += booking.depositPaid || 0;
          } else {
            occupancyByProperty[propertyName].revenue += booking.total || 0;
          }
        }
        occupancyByProperty[propertyName].bookings += 1;
        
        // Track peak booking days
        const dayOfWeek = checkIn.toLocaleDateString('en-US', { weekday: 'long' });
        if (!occupancyByProperty[propertyName].peakDays.includes(dayOfWeek)) {
          occupancyByProperty[propertyName].peakDays.push(dayOfWeek);
        }
      }
      
      // Assume each property has available nights equal to the time range
      occupancyByProperty[propertyName].total = Math.max(occupancyByProperty[propertyName].total, parseInt(timeRange));
    });

    // Calculate averages and additional metrics
    const occupancyReport = Object.entries(occupancyByProperty).map(([property, data]) => ({
      property,
      occupancyRate: data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0,
      occupiedNights: data.occupied,
      totalNights: data.total,
      revenue: data.revenue,
      bookings: data.bookings,
      averageRate: data.occupied > 0 ? Math.round(data.revenue / data.occupied) : 0,
      averageStay: data.bookings > 0 ? Math.round(data.occupied / data.bookings * 10) / 10 : 0,
      revenuePerBooking: data.bookings > 0 ? Math.round(data.revenue / data.bookings) : 0,
      peakDays: data.peakDays.slice(0, 3).join(', ') || 'N/A'
    })).sort((a, b) => b.occupancyRate - a.occupancyRate);

    // Overall occupancy metrics
    const totalOccupied = occupancyReport.reduce((sum, prop) => sum + prop.occupiedNights, 0);
    const totalAvailable = occupancyReport.reduce((sum, prop) => sum + prop.totalNights, 0);
    const overallOccupancy = totalAvailable > 0 ? Math.round((totalOccupied / totalAvailable) * 100) : 0;

    return {
      byProperty: occupancyReport,
      overall: {
        occupancyRate: overallOccupancy,
        totalOccupied,
        totalAvailable,
        averageStay: occupancyReport.length > 0 ? 
          Math.round(occupancyReport.reduce((sum, prop) => sum + prop.averageStay, 0) / occupancyReport.length * 10) / 10 : 0
      }
    };
  };

  const calculateGuestReport = (bookings: any[]): GuestAnalytics => {
    const countryStats: { [key: string]: { 
      count: number, 
      revenue: number, 
      guests: number,
      averageStay: number,
      averageGroupSize: number,
      totalNights: number
    } } = {};
    
    bookings.forEach(booking => {
      const phone = booking.customerPhone;
      if (phone) {
        // Extract country code from phone number
        const phoneStr = phone.trim();
        let countryCode = '+1'; // default
        
        // Find matching country code (check longer codes first)
        for (const code of Object.keys(countryCodeMap).sort((a, b) => b.length - a.length)) {
          if (phoneStr.startsWith(code)) {
            countryCode = code;
            break;
          }
        }
        
        const countryInfo = countryCodeMap[countryCode] || { name: 'Unknown', flag: '🌍' };
        const countryKey = `${countryInfo.flag} ${countryInfo.name}`;
        
        if (!countryStats[countryKey]) {
          countryStats[countryKey] = { 
            count: 0, 
            revenue: 0, 
            guests: 0,
            averageStay: 0,
            averageGroupSize: 0,
            totalNights: 0
          };
        }
        
        // Calculate nights stayed
        let nights = 1;
        if (booking.checkIn && booking.checkOut) {
          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);
          nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        }
        
        countryStats[countryKey].count += 1;
        // Calculate actual revenue (only paid amounts)
        if (booking.status === 'deposit-paid') {
          countryStats[countryKey].revenue += booking.depositPaid || 0;
        } else if (booking.status === 'fully-paid') {
          countryStats[countryKey].revenue += booking.total || 0;
        } else if (booking.status === 'completed') {
          // For completed bookings, include the amount that was actually paid
          if (booking.depositPaid && booking.depositPaid > 0) {
            countryStats[countryKey].revenue += booking.depositPaid || 0;
          } else {
            countryStats[countryKey].revenue += booking.total || 0;
          }
        }
        countryStats[countryKey].guests += booking.guests || 0;
        countryStats[countryKey].totalNights += nights;
      }
    });

    // Calculate averages and sort
    const sortedCountries = Object.entries(countryStats)
      .map(([country, stats]) => ({
        country,
        bookings: stats.count,
        revenue: stats.revenue,
        guests: stats.guests,
        totalNights: stats.totalNights,
        averageBookingValue: stats.count > 0 ? stats.revenue / stats.count : 0,
        averageStay: stats.count > 0 ? stats.totalNights / stats.count : 0,
        averageGroupSize: stats.count > 0 ? stats.guests / stats.count : 0,
        revenuePerGuest: stats.guests > 0 ? stats.revenue / stats.guests : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Guest demographics
    const totalGuests = sortedCountries.reduce((sum, country) => sum + country.guests, 0);
    const totalRevenue = sortedCountries.reduce((sum, country) => sum + country.revenue, 0);
    const averageGroupSize = totalGuests > 0 ? 
      sortedCountries.reduce((sum, country) => sum + country.guests, 0) / 
      sortedCountries.reduce((sum, country) => sum + country.bookings, 0) : 0;

    return {
      byCountry: sortedCountries,
      topCountries: sortedCountries.slice(0, 10),
      totalCountries: sortedCountries.length,
      demographics: {
        totalGuests,
        totalRevenue,
        averageGroupSize: Math.round(averageGroupSize * 10) / 10,
        revenuePerGuest: totalGuests > 0 ? Math.round(totalRevenue / totalGuests) : 0,
        topMarkets: sortedCountries.slice(0, 5).map(c => c.country.split(' ')[0]).join(', ')
      }
    };
  };

  const calculateRevenueReport = (bookings: any[]): RevenueData => {
    // Daily revenue trends
    const dailyRevenue: { [key: string]: { revenue: number, bookings: number } } = {};
    
    bookings.forEach(booking => {
      const date = new Date(booking.createdAt || booking.checkIn).toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = { revenue: 0, bookings: 0 };
      }
      // Calculate actual revenue (only paid amounts)
      if (booking.status === 'deposit-paid') {
        dailyRevenue[date].revenue += booking.depositPaid || 0;
      } else if (booking.status === 'fully-paid') {
        dailyRevenue[date].revenue += booking.total || 0;
      } else if (booking.status === 'completed') {
        // For completed bookings, include the amount that was actually paid
        if (booking.depositPaid && booking.depositPaid > 0) {
          dailyRevenue[date].revenue += booking.depositPaid || 0;
        } else {
          dailyRevenue[date].revenue += booking.total || 0;
        }
      }
      dailyRevenue[date].bookings += 1;
    });

    const revenueTrends = Object.entries(dailyRevenue)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        bookings: data.bookings,
        averageBookingValue: data.bookings > 0 ? data.revenue / data.bookings : 0,
        formattedDate: new Date(date).toLocaleDateString()
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Revenue by source/channel
    const revenueBySource = bookings.reduce((acc, booking) => {
      const source = booking.source || 'Direct Booking';
      if (!acc[source]) {
        acc[source] = { revenue: 0, bookings: 0 };
      }
      // Calculate actual revenue (only paid amounts)
      if (booking.status === 'deposit-paid') {
        acc[source].revenue += booking.depositPaid || 0;
      } else if (booking.status === 'fully-paid') {
        acc[source].revenue += booking.total || 0;
      } else if (booking.status === 'completed') {
        // For completed bookings, include the amount that was actually paid
        if (booking.depositPaid && booking.depositPaid > 0) {
          acc[source].revenue += booking.depositPaid || 0;
        } else {
          acc[source].revenue += booking.total || 0;
        }
      }
      acc[source].bookings += 1;
      return acc;
    }, {} as { [key: string]: { revenue: number, bookings: number } });

    return {
      trends: revenueTrends,
      bySource: Object.entries(revenueBySource).map(([source, data]: [string, { revenue: number, bookings: number }]) => ({
        source,
        revenue: data.revenue,
        bookings: data.bookings,
        averageValue: data.bookings > 0 ? data.revenue / data.bookings : 0
      })).sort((a, b) => b.revenue - a.revenue),
      totalRevenue: bookings.reduce((sum, booking) => {
        // Calculate actual revenue (only paid amounts)
        if (booking.status === 'deposit-paid') {
          return sum + (booking.depositPaid || 0);
        } else if (booking.status === 'fully-paid') {
          return sum + (booking.total || 0);
        } else if (booking.status === 'completed') {
          // For completed bookings, include the amount that was actually paid
          if (booking.depositPaid && booking.depositPaid > 0) {
            return sum + (booking.depositPaid || 0);
          } else {
            return sum + (booking.total || 0);
          }
        }
        return sum;
      }, 0),
      averageDailyRevenue: revenueTrends.length > 0 ? 
        revenueTrends.reduce((sum, day) => sum + day.revenue, 0) / revenueTrends.length : 0
    };
  };

  const calculatePropertyReport = (bookings: any[]): PropertyData[] => {
    const propertyStats: { [key: string]: { 
      bookings: number, 
      revenue: number, 
      guests: number,
      totalNights: number,
      ratings: number[]
    } } = {};
    
    bookings.forEach(booking => {
      const propertyName = booking.propertyName;
      
      if (!propertyStats[propertyName]) {
        propertyStats[propertyName] = { 
          bookings: 0, 
          revenue: 0, 
          guests: 0,
          totalNights: 0,
          ratings: []
        };
      }
      
      let nights = 1;
      if (booking.checkIn && booking.checkOut) {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      propertyStats[propertyName].bookings += 1;
      // Calculate actual revenue (only paid amounts)
      if (booking.status === 'deposit-paid') {
        propertyStats[propertyName].revenue += booking.depositPaid || 0;
      } else if (booking.status === 'fully-paid') {
        propertyStats[propertyName].revenue += booking.total || 0;
      } else if (booking.status === 'completed') {
        // For completed bookings, include the amount that was actually paid
        if (booking.depositPaid && booking.depositPaid > 0) {
          propertyStats[propertyName].revenue += booking.depositPaid || 0;
        } else {
          propertyStats[propertyName].revenue += booking.total || 0;
        }
      }
      propertyStats[propertyName].guests += booking.guests || 0;
      propertyStats[propertyName].totalNights += nights;
      
      // Note: Ratings not available in current Supabase schema
      // if (booking.rating) {
      //   propertyStats[propertyName].ratings.push(booking.rating);
      // }
    });

    return Object.entries(propertyStats)
      .map(([property, stats]) => ({
        property,
        bookings: stats.bookings,
        revenue: stats.revenue,
        guests: stats.guests,
        totalNights: stats.totalNights,
        averageBookingValue: stats.bookings > 0 ? stats.revenue / stats.bookings : 0,
        averageStay: stats.bookings > 0 ? stats.totalNights / stats.bookings : 0,
        revenuePerNight: stats.totalNights > 0 ? stats.revenue / stats.totalNights : 0,
        averageRating: stats.ratings.length > 0 ? 
          stats.ratings.reduce((sum, rating) => sum + rating, 0) / stats.ratings.length : 0,
        occupancyRate: Math.min(100, (stats.totalNights / parseInt(timeRange)) * 100)
      }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  const exportToCSV = async () => {
    setIsGenerating(true);
    try {
      let csvContent = '';
      let filename = '';

      if (reportType === 'occupancy' && reportData.occupancyData) {
        filename = `occupancy-report-${timeRange}days.csv`;
        csvContent = 'Property,Occupancy Rate (%),Occupied Nights,Total Nights,Revenue,Bookings,Average Rate,Average Stay,Revenue per Booking,Peak Days\n';
        reportData.occupancyData.byProperty.forEach((prop) => {
          csvContent += `"${prop.property}",${prop.occupancyRate},${prop.occupiedNights},${prop.totalNights},${prop.revenue},${prop.bookings},${prop.averageRate},${prop.averageStay},${prop.revenuePerBooking},"${prop.peakDays}"\n`;
        });
      } else if (reportType === 'guest' && reportData.guestAnalytics) {
        filename = `guest-analytics-${timeRange}days.csv`;
        csvContent = 'Country,Bookings,Revenue,Guests,Total Nights,Avg Booking Value,Avg Stay,Avg Group Size,Revenue per Guest\n';
        reportData.guestAnalytics.byCountry.forEach((country) => {
          csvContent += `"${country.country}",${country.bookings},${country.revenue},${country.guests},${country.totalNights},${country.averageBookingValue.toFixed(2)},${country.averageStay.toFixed(1)},${country.averageGroupSize.toFixed(1)},${country.revenuePerGuest.toFixed(2)}\n`;
        });
      } else if (reportType === 'revenue' && reportData.revenueData) {
        filename = `revenue-report-${timeRange}days.csv`;
        csvContent = 'Date,Revenue,Bookings,Average Booking Value\n';
        reportData.revenueData.trends.forEach((day) => {
          csvContent += `${day.formattedDate},${day.revenue},${day.bookings},${day.averageBookingValue.toFixed(2)}\n`;
        });
      } else if (reportType === 'property' && reportData.propertyData) {
        filename = `property-performance-${timeRange}days.csv`;
        csvContent = 'Property,Bookings,Revenue,Guests,Total Nights,Avg Booking Value,Avg Stay,Revenue per Night,Avg Rating,Occupancy Rate\n';
        reportData.propertyData.forEach((prop) => {
          csvContent += `"${prop.property}",${prop.bookings},${prop.revenue},${prop.guests},${prop.totalNights},${prop.averageBookingValue.toFixed(2)},${prop.averageStay.toFixed(1)},${prop.revenuePerNight.toFixed(2)},${prop.averageRating.toFixed(1)},${prop.occupancyRate.toFixed(1)}\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('CSV report exported successfully!');
    } catch (error) {
      toast.error('Failed to export CSV report');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = async () => {
    setIsGenerating(true);
    try {
      // Create a simple HTML content for PDF
      let htmlContent = `
        <html>
          <head>
            <title>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              h2 { color: #666; margin-top: 30px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .metric { background-color: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px; }
              .summary { background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <h1>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
            <div class="summary">
              <h2>Report Summary</h2>
              <p><strong>Period:</strong> Last ${timeRange} days</p>
              <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Total Bookings:</strong> ${reportData.totalBookings || 0}</p>
              <p><strong>Total Revenue:</strong> $${(reportData.totalRevenue || 0).toLocaleString()}</p>
              <p><strong>Total Guests:</strong> ${reportData.totalGuests || 0}</p>
            </div>
      `;

      if (reportType === 'occupancy' && reportData.occupancyData) {
        htmlContent += `
          <h2>Occupancy Analysis</h2>
          <div class="metric">
            <strong>Overall Occupancy Rate:</strong> ${reportData.occupancyData.overall.occupancyRate}%
          </div>
          <table>
            <tr>
              <th>Property</th>
              <th>Occupancy Rate</th>
              <th>Revenue</th>
              <th>Bookings</th>
              <th>Avg Stay</th>
            </tr>
        `;
        reportData.occupancyData.byProperty.forEach((prop) => {
          htmlContent += `
            <tr>
              <td>${prop.property}</td>
              <td>${prop.occupancyRate}%</td>
              <td>$${prop.revenue.toLocaleString()}</td>
              <td>${prop.bookings}</td>
              <td>${prop.averageStay} nights</td>
            </tr>
          `;
        });
        htmlContent += '</table>';
      }

      if (reportType === 'guest' && reportData.guestAnalytics) {
        htmlContent += `
          <h2>Guest Analytics by Country</h2>
          <div class="metric">
            <strong>Countries Represented:</strong> ${reportData.guestAnalytics.totalCountries}
          </div>
          <table>
            <tr>
              <th>Country</th>
              <th>Bookings</th>
              <th>Revenue</th>
              <th>Guests</th>
              <th>Avg Group Size</th>
            </tr>
        `;
        reportData.guestAnalytics.topCountries.forEach((country) => {
          htmlContent += `
            <tr>
              <td>${country.country}</td>
              <td>${country.bookings}</td>
              <td>$${country.revenue.toLocaleString()}</td>
              <td>${country.guests}</td>
              <td>${country.averageGroupSize.toFixed(1)}</td>
            </tr>
          `;
        });
        htmlContent += '</table>';
      }

      htmlContent += '</body></html>';

      // Create and download the HTML file (simulating PDF)
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportType}-report-${timeRange}days.html`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('PDF report exported successfully!');
    } catch (error) {
      toast.error('Failed to export PDF report');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (growth < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading reports data...</span>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports Dashboard</h1>
          <p className="text-gray-600">Generate comprehensive business reports</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="occupancy">Occupancy Report</SelectItem>
              <SelectItem value="guest">Guest Analytics</SelectItem>
              <SelectItem value="revenue">Revenue Report</SelectItem>
              <SelectItem value="property">Property Performance</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button 
              onClick={exportToCSV} 
              disabled={isGenerating || bookings.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              onClick={exportToPDF} 
              disabled={isGenerating || bookings.length === 0}
              className="bg-red-600 hover:bg-red-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalBookings || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(reportData.bookingGrowth || 0)}
              <span className={`ml-1 ${getGrowthColor(reportData.bookingGrowth || 0)}`}>
                {Math.abs(reportData.bookingGrowth || 0).toFixed(1)}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.totalRevenue || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(reportData.revenueGrowth || 0)}
              <span className={`ml-1 ${getGrowthColor(reportData.revenueGrowth || 0)}`}>
                {Math.abs(reportData.revenueGrowth || 0).toFixed(1)}% from last period
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Revenue received from payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalGuests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg {((reportData.totalGuests || 0) / Math.max(reportData.totalBookings || 1, 1)).toFixed(1)} per booking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.averageBookingValue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Per booking average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No booking data available</h3>
            <p className="text-gray-500">
              Reports will be generated once bookings are available in the system.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {reportType === 'occupancy' && reportData.occupancyData && (
            <div className="space-y-6">
              {/* Overall Occupancy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Overall Occupancy Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {reportData.occupancyData.overall.occupancyRate}%
                      </div>
                      <div className="text-sm text-gray-600">Overall Occupancy</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {reportData.occupancyData.overall.totalOccupied}
                      </div>
                      <div className="text-sm text-gray-600">Nights Occupied</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {reportData.occupancyData.overall.totalAvailable}
                      </div>
                      <div className="text-sm text-gray-600">Nights Available</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {reportData.occupancyData.overall.averageStay}
                      </div>
                      <div className="text-sm text-gray-600">Avg Stay (nights)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property Occupancy Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Occupancy Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={reportData.occupancyData.byProperty}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="property" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => {
                          if (name === 'occupancyRate') return [`${value}%`, 'Occupancy Rate'];
                          if (name === 'revenue') return [formatCurrency(value as number), 'Revenue'];
                          return [value, name];
                        }}
                      />
                      <Bar dataKey="occupancyRate" fill="#8884d8" name="occupancyRate" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Detailed Property Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Property Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Property</th>
                          <th className="text-right p-2">Occupancy</th>
                          <th className="text-right p-2">Revenue</th>
                          <th className="text-right p-2">Bookings</th>
                          <th className="text-right p-2">Avg Stay</th>
                          <th className="text-right p-2">Avg Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.occupancyData.byProperty.map((prop, index: number) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{prop.property}</td>
                            <td className="p-2 text-right">
                              <Badge className={prop.occupancyRate >= 70 ? 'bg-green-100 text-green-800' : 
                                              prop.occupancyRate >= 40 ? 'bg-yellow-100 text-yellow-800' : 
                                              'bg-red-100 text-red-800'}>
                                {prop.occupancyRate}%
                              </Badge>
                            </td>
                            <td className="p-2 text-right font-semibold">{formatCurrency(prop.revenue)}</td>
                            <td className="p-2 text-right">{prop.bookings}</td>
                            <td className="p-2 text-right">{prop.averageStay} nights</td>
                            <td className="p-2 text-right">{formatCurrency(prop.averageRate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {reportType === 'guest' && reportData.guestAnalytics && (
            <div className="space-y-6">
              {/* Guest Demographics Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Guest Demographics Overview
                    <Badge className="ml-2" variant="outline">
                      {reportData.guestAnalytics.totalCountries} countries
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {reportData.guestAnalytics.demographics.totalGuests}
                      </div>
                      <div className="text-sm text-gray-600">Total Guests</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {reportData.guestAnalytics.demographics.averageGroupSize}
                      </div>
                      <div className="text-sm text-gray-600">Avg Group Size</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatCurrency(reportData.guestAnalytics.demographics.revenuePerGuest)}
                      </div>
                      <div className="text-sm text-gray-600">Revenue per Guest</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-xl font-bold text-orange-600">
                        {reportData.guestAnalytics.demographics.topMarkets}
                      </div>
                      <div className="text-sm text-gray-600">Top Markets</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Country Distribution Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Bookings by Country</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={reportData.guestAnalytics.topCountries}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ country, bookings }) => `${country.split(' ')[0]} (${bookings})`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="bookings"
                        >
                          {reportData.guestAnalytics.topCountries.map((entry, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, 'Bookings']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Country</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData.guestAnalytics.topCountries.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="country" tick={{ fontSize: 10 }} />
                        <YAxis />
                        <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                        <Bar dataKey="revenue" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Country Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Country Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Country</th>
                          <th className="text-right p-2">Bookings</th>
                          <th className="text-right p-2">Revenue</th>
                          <th className="text-right p-2">Guests</th>
                          <th className="text-right p-2">Avg Stay</th>
                          <th className="text-right p-2">Avg Group</th>
                          <th className="text-right p-2">Per Guest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.guestAnalytics.byCountry.slice(0, 15).map((country, index: number) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{country.country}</td>
                            <td className="p-2 text-right">{country.bookings}</td>
                            <td className="p-2 text-right font-semibold">{formatCurrency(country.revenue)}</td>
                            <td className="p-2 text-right">{country.guests}</td>
                            <td className="p-2 text-right">{country.averageStay.toFixed(1)} nights</td>
                            <td className="p-2 text-right">{country.averageGroupSize.toFixed(1)}</td>
                            <td className="p-2 text-right">{formatCurrency(country.revenuePerGuest)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {reportType === 'revenue' && reportData.revenueData && (
            <div className="space-y-6">
              {/* Revenue Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={reportData.revenueData.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="formattedDate" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                      <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue by Source */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Source</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.revenueData.bySource}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="source" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                      <Bar dataKey="revenue" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {reportType === 'property' && reportData.propertyData && (
            <div className="space-y-6">
              {/* Property Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={reportData.propertyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="property" />
                      <YAxis />
                      <Tooltip formatter={(value, name) => {
                        if (name === 'revenue') return [formatCurrency(value as number), 'Revenue'];
                        return [value, name];
                      }} />
                      <Bar dataKey="revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Property Details Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Performance Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Property</th>
                          <th className="text-right p-2">Revenue</th>
                          <th className="text-right p-2">Bookings</th>
                          <th className="text-right p-2">Guests</th>
                          <th className="text-right p-2">Avg Stay</th>
                          <th className="text-right p-2">Avg Booking</th>
                          <th className="text-right p-2">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.propertyData.map((prop, index: number) => (
                          <tr key={index} className="border-b">
                            <td className="p-2 font-medium">{prop.property}</td>
                            <td className="p-2 text-right font-semibold">{formatCurrency(prop.revenue)}</td>
                            <td className="p-2 text-right">{prop.bookings}</td>
                            <td className="p-2 text-right">{prop.guests}</td>
                            <td className="p-2 text-right">{prop.averageStay.toFixed(1)} nights</td>
                            <td className="p-2 text-right">{formatCurrency(prop.averageBookingValue)}</td>
                            <td className="p-2 text-right">
                              <div className="flex items-center justify-end">
                                <Star className="h-3 w-3 text-yellow-500 mr-1" />
                                {prop.averageRating.toFixed(1)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}