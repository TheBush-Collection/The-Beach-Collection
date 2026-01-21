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
      if (booking.status === 'deposit-paid') {
        return sum + (booking.deposit_paid || 0);
      } else if (booking.status === 'fully-paid') {
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
      if (booking.status === 'deposit-paid') {
        return sum + (booking.deposit_paid || 0);
      } else if (booking.status === 'fully-paid') {
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
      if (booking.status === 'deposit-paid') {
        dailyRevenue[date] += booking.deposit_paid || 0;
      } else if (booking.status === 'fully-paid') {
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
      if (booking.status === 'deposit-paid') {
        propertyStats[propertyName].revenue += booking.deposit_paid || 0;
      } else if (booking.status === 'fully-paid') {
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
      if (booking.status === 'deposit-paid') {
        amount = booking.deposit_paid || 0;
      } else if (booking.status === 'fully-paid') {
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
      const amount = booking.status === 'deposit-paid' ? (booking.deposit_paid || 0) :
                   booking.status === 'fully-paid' || booking.status === 'completed' ? 
                   (booking.total_amount || 0) : 0;
      months[month].income += amount;
    });

    // Calculate income for previous year
    previousYearBookings.forEach(booking => {
      const date = new Date(booking.created_at || booking.check_in);
      const month = date.getMonth();
      const amount = booking.status === 'deposit-paid' ? (booking.deposit_paid || 0) :
                   booking.status === 'fully-paid' || booking.status === 'completed' ? 
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
        const amount = booking.status === 'deposit-paid' ? (booking.deposit_paid || 0) :
                     booking.status === 'fully-paid' || booking.status === 'completed' ? 
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (bookingsError || propertiesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading analytics data</p>
          <p className="text-gray-600 text-sm">{bookingsError || propertiesError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive business insights from Supabase</p>
        </div>
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
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBookings || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(analytics.bookingGrowth || 0)}
              <span className={`ml-1 ${getGrowthColor(analytics.bookingGrowth || 0)}`}>
                {Math.abs(analytics.bookingGrowth || 0).toFixed(1)}% from last period
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
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue || 0)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(analytics.revenueGrowth || 0)}
              <span className={`ml-1 ${getGrowthColor(analytics.revenueGrowth || 0)}`}>
                {Math.abs(analytics.revenueGrowth || 0).toFixed(1)}% from last period
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
            <div className="text-2xl font-bold">{analytics.totalGuests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg {((analytics.totalGuests || 0) / Math.max(analytics.totalBookings || 1, 1)).toFixed(1)} per booking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.averageBookingValue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Per booking average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analytics.revenueTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Status */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.bookingStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, percentage }) => `${status} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analytics.bookingStatus || []).map((entry, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Property Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Property Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.propertyPerformance && analytics.propertyPerformance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 cursor-pointer" onClick={() => setPropertySort({ key: 'property', direction: propertySort.direction === 'asc' ? 'desc' : 'asc' })}>Property</th>
                      <th className="text-right p-2 cursor-pointer" onClick={() => setPropertySort({ key: 'bookings', direction: propertySort.direction === 'asc' ? 'desc' : 'asc' })}>Bookings</th>
                      <th className="text-right p-2 cursor-pointer" onClick={() => setPropertySort({ key: 'revenue', direction: propertySort.direction === 'asc' ? 'desc' : 'asc' })}>Revenue</th>
                      <th className="text-right p-2 cursor-pointer" onClick={() => setPropertySort({ key: 'guests', direction: propertySort.direction === 'asc' ? 'desc' : 'asc' })}>Guests</th>
                      <th className="text-right p-2 cursor-pointer" onClick={() => setPropertySort({ key: 'averageBookingValue', direction: propertySort.direction === 'asc' ? 'desc' : 'asc' })}>Avg Booking</th>
                      <th className="text-right p-2 cursor-pointer" onClick={() => setPropertySort({ key: 'averageRating', direction: propertySort.direction === 'asc' ? 'desc' : 'asc' })}>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortTable(analytics.propertyPerformance, propertySort.key, propertySort.direction).map((property, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{property.property}</td>
                        <td className="p-2 text-right">{property.bookings}</td>
                        <td className="p-2 text-right font-semibold">{formatCurrency(property.revenue)}</td>
                        <td className="p-2 text-right">{property.guests}</td>
                        <td className="p-2 text-right">{formatCurrency(property.averageBookingValue)}</td>
                        <td className="p-2 text-right">
                          <div className="flex items-center justify-end">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            {property.averageRating.toFixed(1)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No property data available for the selected time period
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Guest Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Guest Group Sizes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.guestDemographics || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Properties with Bookings</span>
                <Badge variant="outline">
                  {analytics.propertyPerformance?.length || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Group Size</span>
                <Badge variant="outline">
                  {((analytics.totalGuests || 0) / Math.max(analytics.totalBookings || 1, 1)).toFixed(1)} guests
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Revenue per Guest</span>
                <Badge variant="outline">
                  {formatCurrency((analytics.totalRevenue || 0) / Math.max(analytics.totalGuests || 1, 1))}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Top Performing Property</span>
                <Badge variant="outline">
                  {analytics.propertyPerformance?.[0]?.property?.substring(0, 20) || 'N/A'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Package Performance Table & Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Package Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.packagePerformance && analytics.packagePerformance.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 cursor-pointer" onClick={() => setPackageSort({ key: 'packageName', direction: packageSort.direction === 'asc' ? 'desc' : 'asc' })}>Package</th>
                      <th className="text-right p-2 cursor-pointer" onClick={() => setPackageSort({ key: 'bookings', direction: packageSort.direction === 'asc' ? 'desc' : 'asc' })}>Bookings</th>
                      <th className="text-right p-2 cursor-pointer" onClick={() => setPackageSort({ key: 'revenue', direction: packageSort.direction === 'asc' ? 'desc' : 'asc' })}>Revenue</th>
                      <th className="text-right p-2 cursor-pointer" onClick={() => setPackageSort({ key: 'guests', direction: packageSort.direction === 'asc' ? 'desc' : 'asc' })}>Guests</th>
                      <th className="text-right p-2 cursor-pointer" onClick={() => setPackageSort({ key: 'averageBookingValue', direction: packageSort.direction === 'asc' ? 'desc' : 'asc' })}>Avg Booking</th>
                      <th className="text-right p-2 cursor-pointer" onClick={() => setPackageSort({ key: 'averageRating', direction: packageSort.direction === 'asc' ? 'desc' : 'asc' })}>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortTable(analytics.packagePerformance, packageSort.key, packageSort.direction).map((pkg, index: number) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{pkg.packageName}</td>
                        <td className="p-2 text-right">{pkg.bookings}</td>
                        <td className="p-2 text-right font-semibold">{formatCurrency(pkg.revenue)}</td>
                        <td className="p-2 text-right">{pkg.guests}</td>
                        <td className="p-2 text-right">{formatCurrency(pkg.averageBookingValue)}</td>
                        <td className="p-2 text-right">
                          <div className="flex items-center justify-end">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            {pkg.averageRating.toFixed(1)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No package data available for the selected time period
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Package Revenue Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Package Revenue Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.packagePerformance || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="packageName" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
              <Bar dataKey="revenue" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}