import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown, Settings, Calendar, Star, Home, Info, Package, Grid3X3, Image, Phone } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import UserBookingsModal from '@/components/UserBookingsModal';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY || window.pageYOffset;
      
      // Track if scrolled for background change
      setIsScrolled(currentY > 20);

      // Throttle updates with requestAnimationFrame
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const delta = currentY - lastScrollY.current;

          // Only trigger when user has scrolled a bit to avoid jitter
          if (Math.abs(delta) > 10) {
            // If scrolling down and past 100px, hide nav
            if (delta > 0 && currentY > 100) {
              setIsHidden(true);
            } else {
              // Scrolling up — show nav
              setIsHidden(false);
            }
            lastScrollY.current = currentY;
          }

          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // When mobile menu opens we want the nav visible
  useEffect(() => {
    if (isMenuOpen) setIsHidden(false);
  }, [isMenuOpen]);

  // Support both backend user shape and frontend user properties
  const displayName =
    user?.fullName || user?.name ||
    (user?.email ? user.email.split('@')[0] : 'User');

  const navItems = [
    { path: '/', label: 'Home', icon: Home }, 
    { path: '/about', label: 'About', icon: Info }, 
    { path: '/packages', label: 'Packages', icon: Package }, 
    { path: '/collections', label: 'Collections', icon: Grid3X3 },
    { path: '/media-center', label: 'Media Center', icon: Image },
    { path: '/contact', label: 'Contact', icon: Phone } 
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isHidden ? '-translate-y-full' : 'translate-y-0'} ${isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg shadow-[#33343B]/5' : 'bg-white/80 backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/images/Bush Collection Logo.webp"
              alt="The Bush Collection"
              className="h-14 w-auto transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <div className="flex items-center bg-[#CFE7F8]/50 rounded-full p-1.5">
              {navItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-[#749DD0] text-white shadow-md shadow-[#749DD0]/30'
                        : 'text-[#33343B] hover:bg-white/80'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-[#CFE7F8]/50 transition-colors">
                    <div className="w-9 h-9 bg-gradient-to-br from-[#749DD0] to-[#48547C] rounded-full flex items-center justify-center ring-2 ring-white shadow-md">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-[#33343B] max-w-[100px] truncate">{displayName}</span>
                    <ChevronDown className="h-4 w-4 text-[#48547C]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-[#92AAD1]/20 shadow-xl">
                  <DropdownMenuLabel className="font-normal px-4 py-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold text-[#33343B]">{displayName}</p>
                      <p className="text-xs text-[#48547C]">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#92AAD1]/20" />
                  <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer hover:bg-[#CFE7F8]/50 rounded-xl mx-2">
                    <Link to="/dashboard" className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#CFE7F8] rounded-lg flex items-center justify-center">
                        <Star className="h-4 w-4 text-[#749DD0]" />
                      </div>
                      <span className="text-[#33343B]">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer hover:bg-[#CFE7F8]/50 rounded-xl mx-2">
                    <UserBookingsModal>
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 bg-[#CFE7F8] rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-[#749DD0]" />
                        </div>
                        <span className="text-[#33343B]">My Bookings</span>
                      </div>
                    </UserBookingsModal>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="px-4 py-2.5 cursor-pointer hover:bg-[#CFE7F8]/50 rounded-xl mx-2">
                    <Link to="/profile" className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#CFE7F8] rounded-lg flex items-center justify-center">
                        <Settings className="h-4 w-4 text-[#749DD0]" />
                      </div>
                      <span className="text-[#33343B]">My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#92AAD1]/20" />
                  <DropdownMenuItem onClick={logout} className="px-4 py-2.5 cursor-pointer hover:bg-red-50 rounded-xl mx-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <LogOut className="h-4 w-4 text-red-500" />
                      </div>
                      <span className="text-red-600">Log out</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="outline" className="rounded-full px-5 border-[#92AAD1] text-[#48547C] hover:bg-[#CFE7F8]/50 hover:border-[#749DD0]">
                  Login
                </Button>
              </Link>
            )}

            <Link to="/book">
              <Button className="rounded-full px-6 bg-gradient-to-r from-[#749DD0] to-[#48547C] hover:from-[#48547C] hover:to-[#33343B] text-white shadow-lg shadow-[#749DD0]/30 transition-all hover:shadow-xl hover:scale-105">
                Book Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 rounded-full hover:bg-[#CFE7F8]/50"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-[#33343B]" />
              ) : (
                <Menu className="h-5 w-5 text-[#33343B]" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ${isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white/95 backdrop-blur-xl border-t border-[#92AAD1]/20 px-4 py-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-[#749DD0] text-white shadow-md'
                      : 'text-[#33343B] hover:bg-[#CFE7F8]/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Authentication */}
          <div className="mt-6 pt-6 border-t border-[#92AAD1]/20 space-y-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 bg-[#CFE7F8]/30 rounded-2xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#749DD0] to-[#48547C] rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#33343B]">{displayName}</p>
                    <p className="text-xs text-[#48547C]">{user.email}</p>
                  </div>
                </div>
                
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[#33343B] hover:bg-[#CFE7F8]/50 transition-colors">
                  <Star className="w-5 h-5 text-[#749DD0]" />
                  <span>Dashboard</span>
                </Link>
                
                <UserBookingsModal>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[#33343B] hover:bg-[#CFE7F8]/50 transition-colors w-full" onClick={() => setIsMenuOpen(false)}>
                    <Calendar className="w-5 h-5 text-[#749DD0]" />
                    <span>My Bookings</span>
                  </div>
                </UserBookingsModal>
                
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[#33343B] hover:bg-[#CFE7F8]/50 transition-colors">
                  <Settings className="w-5 h-5 text-[#749DD0]" />
                  <span>My Profile</span>
                </Link>
                
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log out</span>
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-2xl border-[#92AAD1] text-[#48547C] hover:bg-[#CFE7F8]/50 py-6">
                  Login
                </Button>
              </Link>
            )}

            <Link to="/book" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full rounded-2xl bg-gradient-to-r from-[#749DD0] to-[#48547C] hover:from-[#48547C] hover:to-[#33343B] text-white py-6 shadow-lg">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}