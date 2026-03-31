import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';
import { ThemeProvider } from './components/ThemeProvider';
import Navigation from './components/Navigation';
import Chatbot from './components/Chatbot';
import Index from './pages/Index';
import Collections from './pages/Collections';
import PropertyDetail from './pages/PropertyDetail';
import RoomDetail from './pages/RoomDetail';
import Packages from './pages/Packages';
import PackageDetail from './pages/PackageDetail';
import BookNow from './pages/BookNow';
import Payment from './pages/Payment';
import BookingConfirmation from './pages/BookingConfirmation';
import About from './pages/About';
import Contact from './pages/Contact';
import MediaCenter from './pages/MediaCenter';
import FAQ from './pages/FAQ';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CancellationRequest from './pages/CancellationRequest';
import UserDashboard from './pages/UserDashboard';
import { AdminLogin } from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminReports from './pages/admin/AdminReports';
import AdminBookings from './pages/admin/AdminBookings';
import AdminArrivals from './pages/admin/AdminArrivals';
import AdminCalendar from './pages/admin/AdminCalendar';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminProperties from './pages/admin/AdminProperties';
import AdminNairobiHotels from './pages/admin/AdminNairobiHotels';
import AdminMediaCenter from './pages/admin/AdminMediaCenter';
import AdminReviews from './pages/admin/AdminReviews';
import AdminCancellationManagement from './pages/admin/AdminCancellationManagement';
import AdminRoomAvailability from './pages/admin/AdminRoomAvailability';
import AdminPackages from './pages/admin/AdminPackages';
import AdminAmenities from './pages/admin/AdminAmenities';
import AdminSettings from './pages/admin/AdminSettings';
import AdminRatesCalendar from './pages/admin/AdminRatesCalendar';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminLogin = location.pathname === '/admin/login';

  // Admin protected routes

  if (isAdminRoute && !isAdminLogin) {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/analytics" element={
            <ProtectedRoute adminOnly>
              <AdminAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute adminOnly>
              <AdminReports />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute adminOnly>
              <AdminBookings />
            </ProtectedRoute>
          } />
          <Route path="/admin/arrivals" element={
            <ProtectedRoute adminOnly>
              <AdminArrivals />
            </ProtectedRoute>
          } />
          <Route path="/admin/calendar" element={
            <ProtectedRoute adminOnly>
              <AdminCalendar />
            </ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute adminOnly>
              <AdminCustomers />
            </ProtectedRoute>
          } />
          <Route path="/admin/properties" element={
            <ProtectedRoute adminOnly>
              <AdminProperties />
            </ProtectedRoute>
          } />
          <Route path="/admin/nairobi-hotels" element={
            <ProtectedRoute adminOnly>
              <AdminNairobiHotels />
            </ProtectedRoute>
          } />
          <Route path="/admin/media-center" element={
            <ProtectedRoute adminOnly>
              <AdminMediaCenter />
            </ProtectedRoute>
          } />
          <Route path="/admin/reviews" element={
            <ProtectedRoute adminOnly>
              <AdminReviews />
            </ProtectedRoute>
          } />
          <Route path="/admin/cancellations" element={
            <ProtectedRoute adminOnly>
              <AdminCancellationManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/room-availability" element={
            <ProtectedRoute adminOnly>
              <AdminRoomAvailability />
            </ProtectedRoute>
          } />
          <Route path="/admin/packages" element={
            <ProtectedRoute adminOnly>
              <AdminPackages />
            </ProtectedRoute>
          } />
          <Route path="/admin/amenities" element={
            <ProtectedRoute adminOnly>
              <AdminAmenities />
            </ProtectedRoute>
          } />
          <Route path="/admin/rates" element={
            <ProtectedRoute adminOnly>
              <AdminRatesCalendar />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute adminOnly>
              <AdminSettings />
            </ProtectedRoute>
          } />
        </Routes>
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
      {!isAdminRoute && <Navigation />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/property/:propertyId/room/:roomSlug" element={<RoomDetail />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/package/:id" element={<PackageDetail />} />
        <Route path="/book" element={<BookNow />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/media-center" element={<MediaCenter />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/cancellation-request" element={<CancellationRequest />} />
        <Route path="/profile" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        
        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* Add Chatbot to all non-admin pages */}
      {!isAdminRoute && <Chatbot />}
      
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="safari-ui-theme">
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;