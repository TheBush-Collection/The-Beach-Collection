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
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart2,
  Layers,
  ChevronRight,
  AlertCircle,
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
          if (booking.status === 'deposit_paid') {
            return booking.deposit_paid || 0;
          } else if (booking.status === 'fully_paid') {
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
    <div className="min-h-screen bg-[#F7F9FC]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── HEADER BAR ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E8EDF5] px-8 py-5">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg,#749DD0,#48547C)' }} />
              <span className="text-xs font-semibold text-[#92AAD1] tracking-widest uppercase">
                Operations
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#33343B] leading-tight">
              Dashboard
            </h1>
            <p className="text-sm text-[#92AAD1] mt-0.5">
              The Beach Collection &nbsp;&middot;&nbsp; Live property data
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pendingBookings > 0 && (
              <Link to="/admin/bookings?status=pending">
                <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {pendingBookings} Pending
                </span>
              </Link>
            )}
            <Link to="/admin/bookings">
              <Button
                variant="outline"
                size="sm"
                className="border-[#E8EDF5] bg-white text-[#48547C] hover:bg-[#EEF4FB] hover:border-[#749DD0] text-xs rounded-lg"
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5" /> Bookings
              </Button>
            </Link>
            <Link to="/admin/properties">
              <Button
                size="sm"
                className="text-xs rounded-lg font-semibold text-white shadow-sm"
                style={{ background: 'linear-gradient(135deg,#749DD0,#48547C)' }}
              >
                <Building className="w-3.5 h-3.5 mr-1.5" /> Properties
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 py-8 space-y-7">

        {/* KPI STAT CARDS */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            {
              label: 'Total Bookings',
              value: totalBookings.toLocaleString(),
              sub: confirmedBookings + ' confirmed',
              growth: bookingGrowth,
              positive: totalBookings > 0,
              icon: Calendar,
              accent: '#749DD0',
              accentLight: '#EEF4FB',
            },
            {
              label: 'Total Revenue',
              value: 'KES ' + totalRevenue.toLocaleString(),
              sub: 'paid bookings only',
              growth: revenueGrowth,
              positive: totalRevenue > 0,
              icon: DollarSign,
              accent: '#0D9488',
              accentLight: '#F0FDFA',
            },
            {
              label: 'Active Guests',
              value: totalGuests.toLocaleString(),
              sub: 'across all properties',
              growth: guestGrowth,
              positive: totalGuests > 0,
              icon: Users,
              accent: '#48547C',
              accentLight: '#EEF0F6',
            },
            {
              label: 'Occupancy Rate',
              value: occupancyRate + '%',
              sub: availableRooms + ' of ' + totalRooms + ' rooms free',
              growth: occupancyGrowth,
              positive: occupancyRate > 50,
              icon: TrendingUp,
              accent: '#F59E0B',
              accentLight: '#FFFBEB',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-6 border border-[#E8EDF5] hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-5">
                  <span className="text-xs font-semibold text-[#92AAD1] tracking-wider uppercase">{stat.label}</span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: stat.accentLight, color: stat.accent }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-[26px] font-bold text-[#33343B] leading-none mb-2">{stat.value}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#B0BCCF]">{stat.sub}</span>
                  <span className={"flex items-center gap-0.5 text-xs font-semibold " + (stat.positive ? 'text-teal-600' : 'text-rose-500')}>
                    {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.growth}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent Bookings table (2/3 width) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8EDF5] overflow-hidden hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F0F4FA]">
              <div>
                <p className="text-sm font-semibold text-[#33343B]">Recent Bookings</p>
                <p className="text-xs text-[#B0BCCF] mt-0.5">Latest reservations</p>
              </div>
              <Link
                to="/admin/bookings"
                className="flex items-center gap-1 text-xs text-[#92AAD1] hover:text-[#749DD0] transition-colors font-medium"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentBookings.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F7F9FC]">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#92AAD1] tracking-wider uppercase">Guest</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#92AAD1] tracking-wider uppercase hidden md:table-cell">Property</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-[#92AAD1] tracking-wider uppercase hidden lg:table-cell">Check-in</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-[#92AAD1] tracking-wider uppercase">Amount</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-[#92AAD1] tracking-wider uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F4FA]">
                  {recentBookings.map((booking) => {
                    const statusConfig: Record<string, { dot: string; bg: string; text: string; label: string }> = {
                      confirmed:      { dot: 'bg-teal-400',     bg: 'bg-teal-50',    text: 'text-teal-700',   label: 'Confirmed' },
                      pending:        { dot: 'bg-amber-400',    bg: 'bg-amber-50',   text: 'text-amber-700',  label: 'Pending' },
                      'fully_paid':   { dot: 'bg-[#749DD0]',    bg: 'bg-[#EEF4FB]', text: 'text-[#48547C]',  label: 'Paid' },
                      'deposit_paid': { dot: 'bg-[#92AAD1]',    bg: 'bg-[#EEF4FB]', text: 'text-[#48547C]',  label: 'Deposit' },
                      cancelled:      { dot: 'bg-rose-400',     bg: 'bg-rose-50',    text: 'text-rose-700',   label: 'Cancelled' },
                      completed:      { dot: 'bg-slate-400',    bg: 'bg-slate-50',   text: 'text-slate-600',  label: 'Completed' },
                    };
                    const sc = statusConfig[booking.status] ?? { dot: 'bg-slate-300', bg: 'bg-slate-50', text: 'text-slate-600', label: booking.status };
                    return (
                      <tr key={booking.id} className="hover:bg-[#F7F9FC] transition-colors">
                        <td className="px-6 py-4 font-medium text-[#33343B]">{booking.guest}</td>
                        <td className="px-6 py-4 text-sm text-[#92AAD1] hidden md:table-cell">{booking.property}</td>
                        <td className="px-6 py-4 text-sm text-[#92AAD1] hidden lg:table-cell">
                          {new Date(booking.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-[#749DD0]">{booking.amount}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={"inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full " + sc.bg + " " + sc.text}>
                            <span className={"w-1.5 h-1.5 rounded-full " + sc.dot} />
                            {sc.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-[#92AAD1]">
                <Calendar className="w-8 h-8 mb-3 opacity-40" />
                <p className="text-sm font-medium text-[#92AAD1]">No bookings yet</p>
                <p className="text-xs mt-1 text-[#92AAD1]/60">New reservations will appear here</p>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">

            {/* Top Properties */}
            <div className="bg-white rounded-2xl border border-[#E8EDF5] overflow-hidden hover:shadow-md transition-shadow flex-1">
              <div className="px-6 py-4 border-b border-[#F0F4FA] flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#33343B]">Top Properties</p>
                  <p className="text-xs text-[#B0BCCF] mt-0.5">By booking volume</p>
                </div>
                <Link
                  to="/admin/properties"
                  className="flex items-center gap-1 text-xs text-[#92AAD1] hover:text-[#749DD0] transition-colors font-medium"
                >
                  Manage <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="p-4 space-y-2">
                {topProperties.length > 0 ? topProperties.map((prop, i) => (
                  <div
                    key={prop.name}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#F0F4FA] hover:bg-[#F7F9FC] transition-colors"
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: '#EEF4FB', color: '#48547C' }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#33343B] truncate">{prop.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#B0BCCF]">{prop.bookings} bookings</span>
                        <span className="text-[#B0BCCF]">&middot;</span>
                        <span className="flex items-center gap-0.5 text-xs text-amber-500">
                          <Star className="w-3 h-3 fill-amber-400" />{prop.rating || '—'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#749DD0] flex-shrink-0">{prop.revenue}</span>
                  </div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-10 text-[#92AAD1]/50">
                    <Building className="w-7 h-7 mb-2 opacity-40" />
                    <p className="text-xs">No properties yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Alert pills row */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: 'Pending',
                  value: pendingBookings,
                  icon: Clock,
                  link: '/admin/bookings?status=pending',
                  bg: 'bg-amber-50',
                  border: 'border-amber-100',
                  valColor: 'text-amber-700',
                  iconColor: 'text-amber-500',
                  labelColor: 'text-amber-400',
                },
                {
                  label: 'Avail. Rooms',
                  value: availableRooms,
                  icon: Building,
                  link: '/admin/room-availability',
                  bg: 'bg-teal-50',
                  border: 'border-teal-100',
                  valColor: 'text-teal-700',
                  iconColor: 'text-teal-500',
                  labelColor: 'text-teal-400',
                },
              ].map(({ label, value, icon: Icon, link, bg, border, valColor, iconColor, labelColor }) => (
                <Link to={link} key={label}>
                  <div className={"rounded-xl p-4 border hover:opacity-90 transition-opacity " + bg + " " + border}>
                    <Icon className={"w-4 h-4 mb-2 " + iconColor} />
                    <p className={"text-2xl font-bold " + valColor}>{value}</p>
                    <p className={"text-xs uppercase tracking-widest mt-0.5 font-semibold " + labelColor}>{label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div>
          <p className="text-xs font-semibold text-[#92AAD1] tracking-widest uppercase mb-4">Quick Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Bookings',
                desc: 'View & manage reservations',
                icon: Calendar,
                to: '/admin/bookings',
                cardStyle: { background: 'linear-gradient(135deg,#EEF4FB 0%,#CFE7F8 100%)', border: '1px solid rgba(116,157,208,0.3)' },
                iconBg: 'bg-[#749DD0]/15',
                iconColor: 'text-[#48547C]',
                arrowColor: 'text-[#749DD0]',
              },
              {
                label: 'Properties',
                desc: 'Add and edit beach properties',
                icon: Building,
                to: '/admin/properties',
                cardStyle: { background: 'linear-gradient(135deg,#F0FDFA 0%,#CCFBF1 100%)', border: '1px solid rgba(13,148,136,0.25)' },
                iconBg: 'bg-teal-100',
                iconColor: 'text-teal-700',
                arrowColor: 'text-teal-500',
              },
              {
                label: 'Packages',
                desc: 'Create & manage stay packages',
                icon: Package,
                to: '/admin/packages',
                cardStyle: { background: 'linear-gradient(135deg,#FFF7ED 0%,#FEE2B3 100%)', border: '1px solid rgba(245,158,11,0.25)' },
                iconBg: 'bg-amber-100',
                iconColor: 'text-amber-700',
                arrowColor: 'text-amber-500',
              },
              {
                label: 'Reports',
                desc: 'Revenue & analytics overview',
                icon: Layers,
                to: '/admin/reports',
                cardStyle: { background: 'linear-gradient(135deg,#FFF1F2 0%,#FFE4E6 100%)', border: '1px solid rgba(244,63,94,0.2)' },
                iconBg: 'bg-rose-100',
                iconColor: 'text-rose-700',
                arrowColor: 'text-rose-400',
              },
            ].map(({ label, desc, icon: Icon, to, cardStyle, iconBg, iconColor, arrowColor }) => (
              <Link to={to} key={label}>
                <div
                  className="rounded-2xl p-5 flex items-start gap-4 transition-all duration-200 hover:shadow-md group cursor-pointer"
                  style={cardStyle}
                >
                  <div className={"w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 " + iconBg}>
                    <Icon className={"w-5 h-5 " + iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#33343B] text-sm">{label}</p>
                    <p className="text-xs text-[#92AAD1] mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                  <ArrowUpRight className={"w-4 h-4 " + arrowColor + " opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5"} />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
