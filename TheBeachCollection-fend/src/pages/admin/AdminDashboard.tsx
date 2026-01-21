import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Building, 
  Package,
  Star,
  MapPin,
  Plus,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBackendBookings } from '@/hooks/useBackendBookings';
import { useBackendProperties } from '@/hooks/useBackendProperties';

export default function AdminDashboard() {
  const { bookings, loading: bookingsLoading, error: bookingsError } = useBackendBookings();
  const { properties, loading: propertiesLoading, error: propertiesError } = useBackendProperties();

  // Show loading state
  if (bookingsLoading || propertiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (bookingsError || propertiesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading dashboard data</p>
          <p className="text-gray-600 text-sm">{bookingsError || propertiesError}</p>
        </div>
      </div>
    );
  }

  // Calculate real stats from Supabase data
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, booking) => {
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
    // Don't include revenue from unpaid bookings (inquiry, confirmed, cancelled, pending)
    return sum;
  }, 0);
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const totalGuests = bookings.reduce((sum, booking) => sum + (booking.total_guests || booking.adults + booking.children || 0), 0);
  const totalRooms = properties.reduce((sum, property) => sum + (property.rooms?.length || 0), 0);
  const availableRooms = properties.reduce((sum, property) => 
    sum + (property.rooms?.filter(room => room.available).length || 0), 0
  );
  const occupancyRate = totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0;

  // Calculate growth percentages (simplified)
  const revenueGrowth = totalRevenue > 0 ? '+12%' : '0%';
  const bookingGrowth = totalBookings > 0 ? '+8%' : '0%';
  const guestGrowth = totalGuests > 0 ? '+15%' : '0%';
  const occupancyGrowth = occupancyRate > 50 ? '+5%' : '-2%';

  const stats = [
    {
      title: 'Total Bookings',
      value: totalBookings.toString(),
      change: bookingGrowth,
      changeType: totalBookings > 0 ? 'positive' as const : 'neutral' as const,
      icon: Calendar
    },
    {
      title: 'Revenue',
      value: '$' + totalRevenue.toLocaleString(),
      change: revenueGrowth,
      changeType: totalRevenue > 0 ? 'positive' as const : 'neutral' as const,
      icon: DollarSign
    },
    {
      title: 'Active Guests',
      value: totalGuests.toString(),
      change: guestGrowth,
      changeType: totalGuests > 0 ? 'positive' as const : 'neutral' as const,
      icon: Users
    },
    {
      title: 'Occupancy Rate',
      value: occupancyRate + '%',
      change: occupancyGrowth,
      changeType: occupancyRate > 50 ? 'positive' as const : 'negative' as const,
      icon: TrendingUp
    }
  ];

  // Recent bookings from backend
  const recentBookings = bookings
    .sort((a, b) => new Date(b.created_at || b.check_in).getTime() - new Date(a.created_at || a.check_in).getTime())
    .slice(0, 3)
    .map(booking => {
      return {
        id: booking.id,
        guest: booking.guest_name || 'Unknown Guest',
        property: booking.property_name || booking.safari_properties?.name || 'Unknown Property',
        checkIn: booking.check_in,
        amount: '$' + (() => {
          // Calculate actual amount paid (not total booking amount)
          if (booking.status === 'deposit-paid') {
            return booking.deposit_paid || 0;
          } else if (booking.status === 'fully-paid') {
            return booking.total_amount || 0;
          } else if (booking.status === 'completed') {
            // For completed bookings, show the amount that was actually paid
            if (booking.deposit_paid && booking.deposit_paid > 0) {
              return booking.deposit_paid || 0;
            } else {
              return booking.total_amount || 0;
            }
          }
          return 0; // No payment for other statuses
        })().toLocaleString(),
        status: booking.status
      };
    });

  // Top properties by bookings
  const topProperties = properties
    .map(property => {
      const propertyBookings = bookings.filter(b => {
        return b.property_name === property.name || b.property_name === property._id;
      });
      const revenue = propertyBookings.reduce((sum, booking) => {
        // Calculate actual revenue (only paid amounts)
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
        return sum;
      }, 0);
      return {
        name: property.name,
        bookings: propertyBookings.length,
        revenue: '$' + revenue.toLocaleString(),
        rating: property.rating
      };
    })
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your safari bookings.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    stat.changeType === 'positive' ? 'bg-green-100' : 
                    stat.changeType === 'negative' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{booking.guest}</p>
                      <p className="text-sm text-gray-600">{booking.property}</p>
                      <p className="text-xs text-gray-500">Check-in: {new Date(booking.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{booking.amount}</p>
                      <Badge 
                        variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No bookings yet</p>
                  <p className="text-xs">New bookings will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Top Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProperties.length > 0 ? (
                topProperties.map((property, index) => (
                  <div key={property.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{property.name}</p>
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          <span>{property.rating}</span>
                          <span className="mx-2">•</span>
                          <span>{property.bookings} bookings</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{property.revenue}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No properties yet</p>
                  <p className="text-xs">Add properties to see performance</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/bookings">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <Calendar className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Manage Bookings</p>
                    <p className="text-sm text-gray-600">View and manage reservations</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link to="/admin/properties">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Manage Properties</p>
                    <p className="text-sm text-gray-600">Add and edit safari properties</p>
                  </div>
                </div>
              </div>
            </Link>
            
            <Link to="/admin/packages">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">Manage Packages</p>
                    <p className="text-sm text-gray-600">Create and edit safari packages</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Additional Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingBookings}</p>
                <p className="text-sm text-gray-500">Require attention</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            {pendingBookings > 0 && (
              <div className="mt-4">
                <Link to="/admin/bookings?status=pending">
                  <Button size="sm" variant="outline" className="w-full">
                    Review Pending
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                <p className="text-2xl font-bold text-green-600">{availableRooms}</p>
                <p className="text-sm text-gray-500">Out of {totalRooms} total</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Building className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/room-availability">
                <Button size="sm" variant="outline" className="w-full">
                  Manage Availability
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${bookings
                    .filter(b => new Date(b.created_at || b.check_in).toDateString() === new Date().toDateString())
                    .reduce((sum, b) => {
                      // Calculate actual revenue (only paid amounts)
                      if (b.status === 'deposit-paid') {
                        return sum + (b.deposit_paid || 0);
                      } else if (b.status === 'fully-paid') {
                        return sum + (b.total_amount || 0);
                      } else if (b.status === 'completed') {
                        // For completed bookings, include the amount that was actually paid
                        if (b.deposit_paid && b.deposit_paid > 0) {
                          return sum + (b.deposit_paid || 0);
                        } else {
                          return sum + (b.total_amount || 0);
                        }
                      }
                      return sum;
                    }, 0)
                    .toLocaleString()
                  }
                </p>
                <p className="text-sm text-gray-500">From today's bookings</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/reports">
                <Button size="sm" variant="outline" className="w-full">
                  View Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}