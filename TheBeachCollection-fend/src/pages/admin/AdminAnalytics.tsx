import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  MapPin,
  Star,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useBackendBookings, SafariBooking } from '@/hooks/useBackendBookings';
import { useBackendProperties } from '@/hooks/useBackendProperties';

type Property = {
  id?: string;
  _id?: string;
  name: string;
  rooms?: Array<{
    id?: string;
    _id?: string;
    name: string;
  }>;
};

interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  totalGuests: number;
  averageBookingValue: number;
  revenueGrowth: number;
  bookingGrowth: number;
  revenueTrends: Array<{
    date: string;
    revenue: number;
  }>;
  propertyPerformance: Array<{
    property: string;
    bookings: number;
    revenue: number;
    guests: number;
    averageBookingValue: number;
    averageRating: number;
  }>;
  bookingStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  guestDemographics: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  packagePerformance: Array<{
    packageId: string;
    packageName: string;
    bookings: number;
    revenue: number;
    guests: number;
    averageBookingValue: number;
    averageRating: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('30');
  const { bookings: allBookings, loading: bookingsLoading, error: bookingsError } = useBackendBookings();
  const { properties, loading: propertiesLoading, error: propertiesError } = useBackendProperties();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalBookings: 0,
    totalRevenue: 0,
    totalGuests: 0,
    averageBookingValue: 0,
    revenueGrowth: 0,
    bookingGrowth: 0,
    revenueTrends: [],
    propertyPerformance: [],
    bookingStatus: [],
    guestDemographics: [],
    packagePerformance: [],
  });

  // Sorting state for tables
  const [propertySort, setPropertySort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'revenue', direction: 'desc' });
  const [packageSort, setPackageSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'revenue', direction: 'desc' });

  // Property name resolution function for backend data
  const getPropertyName = (booking: SafariBooking, properties: Property[]) => {
    // Use property_name if available from booking
    if (booking.property_name) {
      return booking.property_name;
    }
    
    // Check safari_properties if available
    if (booking.safari_properties?.name) {
      return booking.safari_properties.name;
    }
    
    // Attempt to infer from room name (try multiple booking shapes)
    const roomNameCandidate = booking.room_name || (booking as any).safari_rooms?.name || ((booking as any).rooms && (booking as any).rooms[0] ? ((booking as any).rooms[0].roomName || (booking as any).rooms[0].name) : undefined) || (booking as any).roomName;
    if (roomNameCandidate) {
      const roomName = String(roomNameCandidate).toLowerCase();
      const matchedProperty = properties.find(property => 
        property.rooms?.some(room => room.name.toLowerCase() === roomName)
      );
      return matchedProperty ? matchedProperty.name : 'Unknown Property';
    }
    
    return 'Unknown Property';
  };

  const calculateAnalytics = useCallback((currentBookings: SafariBooking[], allBookings: SafariBooking[], properties: Property[]) => {
    const data: AnalyticsData = {
      totalBookings: 0,
      totalRevenue: 0,
      totalGuests: 0,
      averageBookingValue: 0,
      revenueGrowth: 0,
      bookingGrowth: 0,
      revenueTrends: [],
      propertyPerformance: [],
      bookingStatus: [],
      guestDemographics: [],
      packagePerformance: [],
    };

    // Basic metrics
    data.totalBookings = currentBookings.length;
    data.totalRevenue = currentBookings.reduce((sum, booking) => {
      // Only include revenue from paid bookings (including completed ones that were previously paid)
      if (booking.status === 'deposit_paid') {
        return sum + (booking.deposit_paid || 0);
      } else if (booking.status === 'fully_paid') {
        return sum + (booking.total_amount || 0);
      } else if (booking.status === 'completed') {
        // For completed bookings, include the amount that was actually paid
        if (booking.deposit_paid && booking.deposit_paid > 0) {
          return sum + (booking.deposit_paid || 0);
        } else {
          return sum + (booking.total_amount || 0);
        }
      }
      // Don't include revenue from unpaid bookings (inquiry, confirmed, cancelled)
      return sum;
    }, 0);
    data.totalGuests = currentBookings.reduce((sum, booking) => sum + (booking.total_guests || booking.adults + booking.children || 0), 0);
    data.averageBookingValue = data.totalBookings > 0 ? data.totalRevenue / data.totalBookings : 0;

    // Growth comparison
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (parseInt(timeRange) * 2));
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - parseInt(timeRange));
    
    const previousBookings = allBookings.filter((booking) => {
      const bookingDate = new Date(booking.created_at || booking.check_in);
      return bookingDate >= previousPeriodStart && bookingDate <= previousPeriodEnd;
    });

    const previousRevenue = previousBookings.reduce((sum, booking) => {
      // Only include revenue from paid bookings (including completed ones that were previously paid)
      if (booking.status === 'deposit_paid') {
        return sum + (booking.deposit_paid || 0);
      } else if (booking.status === 'fully_paid') {
        return sum + (booking.total_amount || 0);
      } else if (booking.status === 'completed') {
        // For completed bookings, include the amount that was actually paid
        if (booking.deposit_paid && booking.deposit_paid > 0) {
          return sum + (booking.deposit_paid || 0);
        } else {
          return sum + (booking.total_amount || 0);
        }
      }
      // Don't include revenue from unpaid bookings (inquiry, confirmed, cancelled)
      return sum;
    }, 0);
    data.revenueGrowth = previousRevenue > 0 ? ((data.totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    data.bookingGrowth = previousBookings.length > 0 ? ((data.totalBookings - previousBookings.length) / previousBookings.length) * 100 : 0;

    // Revenue trends
    const dailyRevenue: { [key: string]: number } = {};
    currentBookings.forEach(booking => {
      const date = new Date(booking.created_at || booking.check_in).toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = 0;
      }
      // Calculate actual revenue (only paid amounts)
      if (booking.status === 'deposit_paid') {
        dailyRevenue[date] += booking.deposit_paid || 0;
      } else if (booking.status === 'fully_paid') {
        dailyRevenue[date] += booking.total_amount || 0;
      } else if (booking.status === 'completed') {
        // For completed bookings, include the amount that was actually paid
        if (booking.deposit_paid && booking.deposit_paid > 0) {
          dailyRevenue[date] += booking.deposit_paid || 0;
        } else {
          dailyRevenue[date] += booking.total_amount || 0;
        }
      }
    });

    data.revenueTrends = Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString(),
        revenue
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days

    // Property performance with enhanced name resolution
    const propertyStats: { [key: string]: { bookings: number, revenue: number, guests: number, ratings: number[] } } = {};
    
    currentBookings.forEach(booking => {
      const propertyName = getPropertyName(booking, properties);
      
      if (!propertyStats[propertyName]) {
        propertyStats[propertyName] = { bookings: 0, revenue: 0, guests: 0, ratings: [] };
      }
      
      propertyStats[propertyName].bookings += 1;
      // Calculate actual revenue (only paid amounts)
      if (booking.status === 'deposit_paid') {
        propertyStats[propertyName].revenue += booking.deposit_paid || 0;
      } else if (booking.status === 'fully_paid') {
        propertyStats[propertyName].revenue += booking.total_amount || 0;
      } else if (booking.status === 'completed') {
        // For completed bookings, include the amount that was actually paid
        if (booking.deposit_paid && booking.deposit_paid > 0) {
          propertyStats[propertyName].revenue += booking.deposit_paid || 0;
        } else {
          propertyStats[propertyName].revenue += booking.total_amount || 0;
        }
      }
      propertyStats[propertyName].guests += booking.total_guests || booking.adults + booking.children || 0;
    });

    data.propertyPerformance = Object.entries(propertyStats)
      .map(([property, stats]) => ({
        property,
        bookings: stats.bookings,
        revenue: stats.revenue,
        guests: stats.guests,
        averageBookingValue: stats.bookings > 0 ? stats.revenue / stats.bookings : 0,
        averageRating: stats.ratings.length > 0 ? 
          stats.ratings.reduce((sum, rating) => sum + rating, 0) / stats.ratings.length : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Booking status distribution
    const statusCounts = currentBookings.reduce((acc, booking) => {
      const status = booking.status || 'confirmed';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    data.bookingStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: Math.round((count / data.totalBookings) * 100)
    }));

    // Guest demographics (simplified)
    const guestSizes = currentBookings.reduce((acc, booking) => {
      const guestCount = booking.total_guests || booking.adults + booking.children || 1;
      const category = guestCount === 1 ? 'Solo' : guestCount <= 2 ? 'Couple' : guestCount <= 4 ? 'Small Group' : 'Large Group';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    data.guestDemographics = Object.entries(guestSizes).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / data.totalBookings) * 100)
    }));

    // --- Package Performance Calculation ---
    const packageStats: { [key: string]: { name: string, bookings: number, revenue: number, guests: number, ratings: number[] } } = {};
    currentBookings.forEach(booking => {
      const packageId = booking.package_id || 'unknown';
      const packageName = 'Package ' + packageId;
      if (!packageStats[packageId]) {
        packageStats[packageId] = { name: packageName, bookings: 0, revenue: 0, guests: 0, ratings: [] };
      }
      packageStats[packageId].bookings += 1;
      // Calculate actual revenue (only paid amounts)
      let amount = 0;
      if (booking.status === 'deposit_paid') {
        amount = booking.deposit_paid || 0;
      } else if (booking.status === 'fully_paid') {
        amount = booking.total_amount || 0;
      } else if (booking.status === 'completed') {
        amount = booking.deposit_paid && booking.deposit_paid > 0 ? booking.deposit_paid : (booking.total_amount || 0);
      }
      packageStats[packageId].revenue += amount;
      packageStats[packageId].guests += booking.total_guests || 0;
    });
    data.packagePerformance = Object.entries(packageStats)
      .map(([packageId, stats]) => ({
        packageId,
        packageName: stats.name,
        bookings: stats.bookings,
        revenue: stats.revenue,
        guests: stats.guests,
        averageBookingValue: stats.bookings > 0 ? stats.revenue / stats.bookings : 0,
        averageRating: stats.ratings.length > 0 ? stats.ratings.reduce((sum, rating) => sum + rating, 0) / stats.ratings.length : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    setAnalytics(data);
  }, [timeRange]);

  const calculateAnalyticsFromSupabase = useCallback(() => {
    try {
      // Filter bookings by time range
      const now = new Date();
      const daysAgo = new Date(now.getTime() - (parseInt(timeRange) * 24 * 60 * 60 * 1000));
      const filteredBookings = allBookings.filter((booking) => {
        const bookingDate = new Date(booking.created_at || booking.check_in);
        return bookingDate >= daysAgo;
      });
      calculateAnalytics(filteredBookings, allBookings, properties);
    } catch (error) {
      console.error('Error calculating analytics:', error);
      setAnalytics({
        totalBookings: 0,
        totalRevenue: 0,
        totalGuests: 0,
        averageBookingValue: 0,
        revenueGrowth: 0,
        bookingGrowth: 0,
        revenueTrends: [],
        propertyPerformance: [],
        bookingStatus: [],
        guestDemographics: [],
        packagePerformance: []
      });
    }
  }, [timeRange, allBookings, properties, calculateAnalytics]);

  useEffect(() => {
    if (!bookingsLoading && !propertiesLoading && allBookings.length > 0) {
      calculateAnalyticsFromSupabase();
    }
  }, [timeRange, allBookings, properties, bookingsLoading, propertiesLoading, calculateAnalyticsFromSupabase]);

  const calculateMonthlyIncome = (bookings: SafariBooking[]) => {
    const months = Array(12).fill(0).map((_, i) => ({
      month: new Date(0, i).toLocaleString('default', { month: 'short' }),
      income: 0,
      previousYear: 0
    }));

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Process current year
    const currentYearBookings = bookings.filter(b => {
      const date = new Date(b.created_at || b.check_in);
      return date.getFullYear() === currentYear;
    });
    
    // Process previous year
    const previousYearBookings = bookings.filter(b => {
      const date = new Date(b.created_at || b.check_in);
      return date.getFullYear() === currentYear - 1;
    });

    // Calculate income for current year
    currentYearBookings.forEach(booking => {
      const date = new Date(booking.created_at || booking.check_in);
      const month = date.getMonth();
      const amount = booking.status === 'deposit_paid' ? (booking.deposit_paid || 0) :
                   booking.status === 'fully_paid' || booking.status === 'completed' ? 
                   (booking.total_amount || 0) : 0;
      months[month].income += amount;
    });

    // Calculate income for previous year
    previousYearBookings.forEach(booking => {
      const date = new Date(booking.created_at || booking.check_in);
      const month = date.getMonth();
      const amount = booking.status === 'deposit_paid' ? (booking.deposit_paid || 0) :
                   booking.status === 'fully_paid' || booking.status === 'completed' ? 
                   (booking.total_amount || 0) : 0;
      months[month].previousYear += amount;
    });

    return months;
  };

  const calculateYearlyIncome = (bookings: SafariBooking[]) => {
    const currentYear = new Date().getFullYear();
    const years = Array(5).fill(0).map((_, i) => ({
      year: currentYear - 4 + i,
      income: 0,
      previousYear: 0
    }));

    // Calculate income for each year
    bookings.forEach(booking => {
      const date = new Date(booking.created_at || booking.check_in);
      const year = date.getFullYear();
      const yearIndex = years.findIndex(y => y.year === year);
      
      if (yearIndex !== -1) {
        const amount = booking.status === 'deposit_paid' ? (booking.deposit_paid || 0) :
                     booking.status === 'fully_paid' || booking.status === 'completed' ? 
                     (booking.total_amount || 0) : 0;
        years[yearIndex].income += amount;
      }
    });

    // Calculate previous year values (for comparison)
    years.forEach((year, index) => {
      if (index > 0) {
        year.previousYear = years[index - 1].income;
      }
    });

    return years;
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

  const sortTable = <T extends Record<string, unknown>>(data: T[], key: string, direction: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Show loading state
  if (bookingsLoading || propertiesLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#F4F7FB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#749DD0] mx-auto mb-4"></div>
          <p className="text-[#92AAD1] font-medium">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (bookingsError || propertiesError) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#F4F7FB]">
        <div className="text-center">
          <p className="text-rose-500 mb-2 font-semibold">Error loading analytics data</p>
          <p className="text-[#92AAD1] text-sm">{bookingsError || propertiesError}</p>
        </div>
      </div>
    );
  }

  // Brand palette: #749DD0 ocean · #48547C navy · #92AAD1 mist · #CFE7F8 sky · #33343B charcoal · #F7F9FC page
  const BRAND_COLORS = ['#749DD0', '#48547C', '#B8D4EE', '#0D9488', '#F59E0B', '#F43F5E'];

  const sortedProperties = sortTable(analytics.propertyPerformance, propertySort.key, propertySort.direction);
  const sortedPackages   = sortTable(analytics.packagePerformance,  packageSort.key,  packageSort.direction);

  const kpis = [
    {
      label: 'Total Bookings',
      value: (analytics.totalBookings || 0).toLocaleString(),
      growth: analytics.bookingGrowth || 0,
      icon: Calendar,
      accent: '#749DD0',
      accentLight: '#EEF4FB',
      sub: (analytics.bookingStatus?.find(s => s.status.toLowerCase().includes('confirm'))?.count ?? 0) + ' confirmed',
    },
    {
      label: 'Total Revenue',
      value: 'KES ' + (analytics.totalRevenue || 0).toLocaleString(),
      growth: analytics.revenueGrowth || 0,
      icon: DollarSign,
      accent: '#0D9488',
      accentLight: '#F0FDFA',
      sub: 'from paid bookings',
    },
    {
      label: 'Total Guests',
      value: (analytics.totalGuests || 0).toLocaleString(),
      growth: 0,
      icon: Users,
      accent: '#48547C',
      accentLight: '#EEF0F6',
      sub: ((analytics.totalGuests || 0) / Math.max(analytics.totalBookings || 1, 1)).toFixed(1) + ' avg per booking',
    },
    {
      label: 'Avg Booking Value',
      value: 'KES ' + Math.round(analytics.averageBookingValue || 0).toLocaleString(),
      growth: 0,
      icon: TrendingUp,
      accent: '#F59E0B',
      accentLight: '#FFFBEB',
      sub: 'per reservation',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── HEADER BAR ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E8EDF5] px-8 py-5">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg,#749DD0,#48547C)' }} />
              <span className="text-xs font-semibold text-[#92AAD1] tracking-widest uppercase">
                Analytics
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#33343B] leading-tight">
              Business Intelligence
            </h1>
            <p className="text-sm text-[#92AAD1] mt-0.5">
              The Beach Collection &nbsp;&middot;&nbsp; {timeRange === '7' ? 'Last 7 days' : timeRange === '30' ? 'Last 30 days' : timeRange === '90' ? 'Last 90 days' : 'Last 12 months'}
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 h-9 text-sm border-[#E8EDF5] bg-white text-[#33343B] rounded-lg shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-sm border-[#E8EDF5] shadow-lg rounded-xl">
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-7">

        {/* ── KPI ROW ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          {kpis.map((k) => {
            const Icon = k.icon;
            const up = k.growth >= 0;
            return (
              <div
                key={k.label}
                className="bg-white rounded-2xl p-6 border border-[#E8EDF5] hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-5">
                  <span className="text-xs font-semibold text-[#92AAD1] tracking-wider uppercase">
                    {k.label}
                  </span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: k.accentLight, color: k.accent }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[26px] font-bold text-[#33343B] leading-none mb-2">
                  {k.value}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#B0BCCF]">{k.sub}</span>
                  {k.growth !== 0 && (
                    <span
                      className="flex items-center gap-0.5 text-xs font-semibold"
                      style={{ color: up ? '#0D9488' : '#F43F5E' }}
                    >
                      {up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(k.growth).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── CHARTS ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Revenue Trend — wider */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E8EDF5] overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-[#F0F4FA] flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#33343B]">Revenue Trend</p>
                <p className="text-xs text-[#B0BCCF] mt-0.5">Daily revenue from paid bookings</p>
              </div>
              <TrendingUp className="w-4 h-4 text-[#749DD0]" />
            </div>
            <div className="px-4 py-4">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={analytics.revenueTrends || []} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#749DD0" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#749DD0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#F0F4FA" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#B0BCCF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#B0BCCF' }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #E8EDF5', borderRadius: 10, fontSize: 12, color: '#33343B', boxShadow: '0 4px 16px rgba(72,84,124,0.1)' }}
                    formatter={(v) => ['KES ' + Number(v).toLocaleString(), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#749DD0" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Booking Status — narrower */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8EDF5] overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-[#F0F4FA] flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#33343B]">Booking Status</p>
                <p className="text-xs text-[#B0BCCF] mt-0.5">Distribution by status</p>
              </div>
              <Calendar className="w-4 h-4 text-[#749DD0]" />
            </div>
            <div className="flex flex-col items-center pt-4 pb-5 px-5">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={analytics.bookingStatus || []}
                    cx="50%" cy="50%"
                    innerRadius={52} outerRadius={78}
                    paddingAngle={2}
                    dataKey="count"
                  >
                    {(analytics.bookingStatus || []).map((_, i) => (
                      <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #E8EDF5', borderRadius: 10, fontSize: 12, color: '#33343B' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-1.5 mt-1">
                {(analytics.bookingStatus || []).map((s, i) => (
                  <div key={s.status} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: BRAND_COLORS[i % BRAND_COLORS.length] }} />
                      <span className="text-[#92AAD1]">{s.status}</span>
                    </div>
                    <span className="font-semibold text-[#33343B]">{s.count} <span className="font-normal text-[#B0BCCF]">({s.percentage}%)</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── GUEST SIZE BAR + QUICK STATS ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Guest Group Sizes */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E8EDF5] overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-[#F0F4FA] flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#33343B]">Guest Group Sizes</p>
                <p className="text-xs text-[#B0BCCF] mt-0.5">Number of bookings by party size</p>
              </div>
              <Users className="w-4 h-4 text-[#749DD0]" />
            </div>
            <div className="px-4 py-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.guestDemographics || []} barSize={40} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#F0F4FA" />
                  <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#B0BCCF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#B0BCCF' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #E8EDF5', borderRadius: 10, fontSize: 12, color: '#33343B' }}
                  />
                  <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                    {(analytics.guestDemographics || []).map((_, i) => (
                      <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8EDF5] overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-[#F0F4FA] flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#33343B]">Key Metrics</p>
                <p className="text-xs text-[#B0BCCF] mt-0.5">Summary for selected period</p>
              </div>
              <Star className="w-4 h-4 text-[#749DD0]" />
            </div>
            <div className="divide-y divide-[#F0F4FA]">
              {[
                {
                  label: 'Properties with Bookings',
                  value: (analytics.propertyPerformance?.length || 0).toString(),
                },
                {
                  label: 'Avg Group Size',
                  value: ((analytics.totalGuests || 0) / Math.max(analytics.totalBookings || 1, 1)).toFixed(1) + ' guests',
                },
                {
                  label: 'Revenue per Guest',
                  value: 'KES ' + Math.round((analytics.totalRevenue || 0) / Math.max(analytics.totalGuests || 1, 1)).toLocaleString(),
                },
                {
                  label: 'Top Property',
                  value: analytics.propertyPerformance?.[0]?.property?.substring(0, 22) || '—',
                },
                {
                  label: 'Booking Conversion',
                  value: (analytics.bookingStatus?.find(s => s.status.toLowerCase().includes('confirm'))?.percentage ?? 0) + '%',
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-6 py-3.5">
                  <span className="text-xs text-[#92AAD1]">{label}</span>
                  <span
                    className="text-xs font-bold text-[#48547C] px-2.5 py-1 rounded-lg"
                    style={{ background: '#EEF4FB' }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PROPERTY PERFORMANCE TABLE ────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E8EDF5] overflow-hidden hover:shadow-md transition-shadow">
          <div className="px-6 py-4 border-b border-[#F0F4FA] flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#33343B]">Property Performance</p>
              <p className="text-xs text-[#B0BCCF] mt-0.5">Click any column header to sort</p>
            </div>
            <MapPin className="w-4 h-4 text-[#749DD0]" />
          </div>
          {sortedProperties.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F7F9FC]">
                    {[
                      { key: 'property',            label: 'Property',    align: 'left'  },
                      { key: 'bookings',             label: 'Bookings',    align: 'right' },
                      { key: 'revenue',              label: 'Revenue',     align: 'right' },
                      { key: 'guests',               label: 'Guests',      align: 'right' },
                      { key: 'averageBookingValue',  label: 'Avg Value',   align: 'right' },
                      { key: 'averageRating',        label: 'Rating',      align: 'right' },
                    ].map(col => (
                      <th
                        key={col.key}
                        className={'px-6 py-3 text-xs font-semibold text-[#92AAD1] tracking-wider uppercase cursor-pointer select-none hover:text-[#749DD0] transition-colors ' + (col.align === 'right' ? 'text-right' : 'text-left')}
                        onClick={() => setPropertySort({
                          key: col.key,
                          direction: propertySort.key === col.key && propertySort.direction === 'desc' ? 'asc' : 'desc',
                        })}
                      >
                        {col.label}
                        {propertySort.key === col.key && (
                          <span className="ml-1 text-[#749DD0]">{propertySort.direction === 'desc' ? ' ↓' : ' ↑'}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4FA]">
                  {sortedProperties.map((p, i) => (
                    <tr key={i} className="hover:bg-[#F7F9FC] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#33343B]">{p.property}</td>
                      <td className="px-6 py-4 text-sm text-right text-[#92AAD1]">{p.bookings}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-[#749DD0]">KES {p.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right text-[#92AAD1]">{p.guests}</td>
                      <td className="px-6 py-4 text-sm text-right text-[#92AAD1]">KES {Math.round(p.averageBookingValue).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {p.averageRating > 0 ? p.averageRating.toFixed(1) : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-[#C5D0E0]">
              <MapPin className="w-8 h-8 mb-3" />
              <p className="text-sm font-medium">No property data for this period</p>
            </div>
          )}
        </div>

        {/* ── PACKAGE PERFORMANCE TABLE ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-[#E8EDF5] overflow-hidden hover:shadow-md transition-shadow">
          <div className="px-6 py-4 border-b border-[#F0F4FA] flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#33343B]">Package Performance</p>
              <p className="text-xs text-[#B0BCCF] mt-0.5">Click any column header to sort</p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#749DD0]" />
          </div>
          {sortedPackages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F7F9FC]">
                    {[
                      { key: 'packageName',         label: 'Package',   align: 'left'  },
                      { key: 'bookings',             label: 'Bookings',  align: 'right' },
                      { key: 'revenue',              label: 'Revenue',   align: 'right' },
                      { key: 'guests',               label: 'Guests',    align: 'right' },
                      { key: 'averageBookingValue',  label: 'Avg Value', align: 'right' },
                      { key: 'averageRating',        label: 'Rating',    align: 'right' },
                    ].map(col => (
                      <th
                        key={col.key}
                        className={'px-6 py-3 text-xs font-semibold text-[#92AAD1] tracking-wider uppercase cursor-pointer select-none hover:text-[#749DD0] transition-colors ' + (col.align === 'right' ? 'text-right' : 'text-left')}
                        onClick={() => setPackageSort({
                          key: col.key,
                          direction: packageSort.key === col.key && packageSort.direction === 'desc' ? 'asc' : 'desc',
                        })}
                      >
                        {col.label}
                        {packageSort.key === col.key && (
                          <span className="ml-1 text-[#749DD0]">{packageSort.direction === 'desc' ? ' ↓' : ' ↑'}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4FA]">
                  {sortedPackages.map((pkg, i) => (
                    <tr key={i} className="hover:bg-[#F7F9FC] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#33343B]">{pkg.packageName}</td>
                      <td className="px-6 py-4 text-sm text-right text-[#92AAD1]">{pkg.bookings}</td>
                      <td className="px-6 py-4 text-sm text-right font-semibold text-[#749DD0]">KES {pkg.revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-right text-[#92AAD1]">{pkg.guests}</td>
                      <td className="px-6 py-4 text-sm text-right text-[#92AAD1]">KES {Math.round(pkg.averageBookingValue).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          {pkg.averageRating > 0 ? pkg.averageRating.toFixed(1) : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-14 text-[#C5D0E0]">
              <TrendingUp className="w-8 h-8 mb-3" />
              <p className="text-sm font-medium">No package data for this period</p>
            </div>
          )}
        </div>

        {/* ── PACKAGE REVENUE CHART ────────────────────────────────────── */}
        {(analytics.packagePerformance?.length ?? 0) > 0 && (
          <div className="bg-white rounded-2xl border border-[#E8EDF5] overflow-hidden hover:shadow-md transition-shadow">
            <div className="px-6 py-4 border-b border-[#F0F4FA] flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#33343B]">Package Revenue Comparison</p>
                <p className="text-xs text-[#B0BCCF] mt-0.5">Revenue generated per package</p>
              </div>
              <TrendingUp className="w-4 h-4 text-[#749DD0]" />
            </div>
            <div className="px-4 py-5">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={analytics.packagePerformance} barSize={44} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#F0F4FA" />
                  <XAxis dataKey="packageName" tick={{ fontSize: 10, fill: '#B0BCCF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#B0BCCF' }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #E8EDF5', borderRadius: 10, fontSize: 12, color: '#33343B', boxShadow: '0 4px 16px rgba(72,84,124,0.1)' }}
                    formatter={(v) => ['KES ' + Number(v).toLocaleString(), 'Revenue']}
                  />
                  <Bar dataKey="revenue" radius={[5, 5, 0, 0]}>
                    {(analytics.packagePerformance || []).map((_, i) => (
                      <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
