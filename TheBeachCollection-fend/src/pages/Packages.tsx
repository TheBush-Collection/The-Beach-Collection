import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Users, Calendar, Clock, Camera, Binoculars, Plane, Car, Utensils, Shield, Check, Search, Filter, Building2, ImageOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBackendPackages } from '@/hooks/useBackendPackages';
import { Package } from '@/types/package';
import slugify from '@/lib/slugify';

export default function Packages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'duration'>('featured');

  // Convert price filter to min/max values for API
  const getPriceRange = (filter: string) => {
    switch (filter) {
      case 'budget':
        return { minPrice: 0, maxPrice: 2500 };
      case 'mid':
        return { minPrice: 2500, maxPrice: 3500 };
      case 'luxury':
        return { minPrice: 3500, maxPrice: undefined };
      default:
        return { minPrice: undefined, maxPrice: undefined };
    }
  };

  const priceRange = getPriceRange(priceFilter);

  // Memoize options object so identity doesn't change each render
  const packagesOptions = useMemo(() => ({
    search: searchTerm || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    minPrice: priceRange.minPrice,
    maxPrice: priceRange.maxPrice,
    duration: durationFilter !== 'all' ? durationFilter : undefined,
    sortBy,
    page: 1,
    limit: 12
  }), [searchTerm, categoryFilter, priceRange.minPrice, priceRange.maxPrice, durationFilter, sortBy]);

  // Fetch packages from backend with filters
  const { 
    packages: sortedPackages, 
    loading, 
    error 
  } = useBackendPackages(packagesOptions);

  // Get unique categories and durations from loaded packages for filter options
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(sortedPackages.map(p => p.category))];
    return uniqueCategories.sort();
  }, [sortedPackages]);

  const durations = useMemo(() => {
    const uniqueDurations = [...new Set(sortedPackages.map(p => p.duration.split(' ')[0]))];
    return uniqueDurations.sort((a, b) => parseInt(a) - parseInt(b));
  }, [sortedPackages]);

  // Helper function to get display location
  const getDisplayLocation = (pkg: Package) => {
    return pkg.location || pkg.destinations?.slice(0, 2).join(', ') || 'Multiple Destinations';
  };

  // Get featured packages from all packages (client-side filtering for featured section)
  const featuredPackages = useMemo(() => {
    return sortedPackages.filter(p => p.featured);
  }, [sortedPackages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#CFE7F8] rounded-2xl mb-6 animate-pulse">
              <Search className="h-8 w-8 text-[#749DD0]" />
            </div>
            <h1 className="text-2xl font-bold text-[#33343B] mb-4">Loading packages...</h1>
            <p className="text-[#AAA59F]">Please wait while we load the available packages.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-6">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-[#33343B] mb-4">Error Loading Packages</h1>
            <p className="text-[#AAA59F] mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-[#749DD0] hover:bg-[#48547C] text-white rounded-full px-8">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Modern Split Design */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-gradient-to-br from-[#33343B] via-[#48547C] to-[#33343B]">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        {/* Floating Shapes */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#749DD0] rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#92AAD1] rounded-full opacity-15 blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="text-center">
            {/* Eyebrow */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-px w-12 bg-[#92AAD1]" />
              <span className="text-[#92AAD1] font-medium tracking-wider uppercase text-sm">Safari Experiences</span>
              <div className="h-px w-12 bg-[#92AAD1]" />
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Safari Tour
              <span className="block text-[#92AAD1]">Packages</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto mb-10">
              Carefully crafted safari experiences with expert guides, luxury accommodations, and unforgettable adventures across Africa
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-[#749DD0] hover:bg-[#92AAD1] text-white px-10 py-6 rounded-full text-lg font-semibold transition-all duration-300 hover:shadow-xl">
                Browse All Packages
              </Button>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white hover:text-[#33343B] px-10 py-6 rounded-full text-lg font-semibold transition-all duration-300">
                  Custom Package
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filters - Modern Floating Card */}
      <section className="py-8 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
          <Card className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#AAA59F] h-5 w-5" />
                    <Input
                      placeholder="Search packages by destination, property, activities..."
                      className="pl-12 h-14 bg-[#CFE7F8]/30 text-[#33343B] border-0 rounded-2xl placeholder:text-[#AAA59F] focus:ring-2 focus:ring-[#749DD0]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="sm:w-44">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="h-14 rounded-2xl bg-[#CFE7F8]/30 border-0 text-[#33343B]">
                        <Filter className="h-4 w-4 mr-2 text-[#749DD0]" />
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="sm:w-44">
                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                      <SelectTrigger className="h-14 rounded-2xl bg-[#CFE7F8]/30 border-0 text-[#33343B]">
                        <SelectValue placeholder="Price Range" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="budget">Under $2,500</SelectItem>
                        <SelectItem value="mid">$2,500 - $3,500</SelectItem>
                        <SelectItem value="luxury">$3,500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="sm:w-44">
                    <Select value={durationFilter} onValueChange={setDurationFilter}>
                      <SelectTrigger className="h-14 rounded-2xl bg-[#CFE7F8]/30 border-0 text-[#33343B]">
                        <Clock className="h-4 w-4 mr-2 text-[#749DD0]" />
                        <SelectValue placeholder="Duration" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">All Durations</SelectItem>
                        {durations.map(duration => (
                          <SelectItem key={duration} value={duration}>
                            {duration} Days
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="sm:w-44">
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                      <SelectTrigger className="h-14 rounded-2xl bg-[#749DD0] border-0 text-white">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="featured">Featured First</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="duration">Duration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

{/* Featured Packages */}
{featuredPackages.length > 0 && (
  <section className="py-20 bg-gradient-to-b from-white to-[#CFE7F8]/20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <span className="text-[#749DD0] font-medium tracking-wider uppercase text-sm">Handpicked Selection</span>
        <h2 className="text-4xl md:text-5xl font-bold text-[#33343B] mt-4 mb-4">
          Featured Safari Packages
        </h2>
        <p className="text-lg text-[#AAA59F] max-w-2xl mx-auto">
          Our most popular and highly-rated safari experiences curated for unforgettable adventures
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredPackages.map((pkg) => (
          <Card key={pkg.id} className="group overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl hover:-translate-y-2">
            <div className="relative h-64 overflow-hidden">
              <img
                src={pkg.image}
                alt={pkg.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Featured and Itinerary badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <Badge className="bg-[#749DD0] text-white border-0 rounded-full px-4">
                  ⭐ Featured
                </Badge>
                {pkg.itinerary && pkg.itinerary.length > 0 && (
                  <Badge className="bg-white/90 backdrop-blur text-[#33343B] text-xs border-0 rounded-full">
                    <Calendar className="h-3 w-3 mr-1" />
                    Itinerary
                  </Badge>
                )}
              </div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500 text-white border-0 rounded-full px-4">
                  Save ${pkg.originalPrice - pkg.price}
                </Badge>
              </div>
              
              {/* Bottom Info on Image */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{getDisplayLocation(pkg)}</span>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#33343B] mb-2 group-hover:text-[#749DD0] transition-colors">
                    {pkg.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-[#AAA59F]">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-[#749DD0]" />
                      <span>{pkg.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-[#749DD0]" />
                      <span>{pkg.groupSize}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center bg-[#CFE7F8] px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 text-[#f59e0b] mr-1" />
                  <span className="text-sm font-semibold text-[#33343B]">{pkg.rating}</span>
                </div>
              </div>

              <div className="mb-5">
                <div className="space-y-2">
                  {pkg.highlights.slice(0, 3).map((highlight, index) => (
                    <div key={index} className="flex items-center text-sm text-[#AAA59F]">
                      <Check className="h-4 w-4 text-[#749DD0] mr-2 flex-shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-5 pt-4 border-t border-[#CFE7F8]">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#749DD0]">
                      ${pkg.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-[#AAA59F] line-through">
                      ${pkg.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#AAA59F]">per person</p>
                </div>
                <Badge className="bg-[#CFE7F8] text-[#48547C] border-0 rounded-full">
                  {pkg.category}
                </Badge>
              </div>

              <div className="flex gap-3">
                <Link to={`/book?package=${(pkg as Package & { slug?: string }).slug || slugify(pkg.name) || pkg.id}`} className="flex-1">
                  <Button className="w-full bg-[#749DD0] hover:bg-[#48547C] text-white rounded-full transition-all duration-300">
                    Book Now
                  </Button>
                </Link>
                <Link to={`/package/${(pkg as Package & { slug?: string }).slug || slugify(pkg.name) || pkg.id}`} className="flex-1">
                  <Button variant="outline" className="w-full border-2 border-[#749DD0] text-[#749DD0] hover:bg-[#749DD0] hover:text-white rounded-full transition-all duration-300">
                    Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
)}

{/* All Packages */}
<section className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-[#33343B] mb-2">
          All Safari Packages
        </h2>
        <p className="text-[#AAA59F]">Discover your perfect African adventure</p>
      </div>
      <div className="mt-4 md:mt-0 flex items-center gap-2 bg-[#CFE7F8]/50 px-4 py-2 rounded-full">
        <span className="text-[#48547C] font-medium">
          {sortedPackages.length} packages found
        </span>
      </div>
    </div>

    {sortedPackages.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedPackages.map((pkg) => (
          <Card key={pkg.id} className="group overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl hover:-translate-y-2">
            <div className="relative h-64 overflow-hidden bg-[#CFE7F8]">
              {pkg.image ? (
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#749DD0] to-[#48547C]">
                  <ImageOff className="h-12 w-12 text-white/50" />
                </div>
              )}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Itinerary indicator */}
              {pkg.itinerary && pkg.itinerary.length > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white/90 backdrop-blur text-[#33343B] text-xs border-0 rounded-full">
                    <Calendar className="h-3 w-3 mr-1" />
                    Itinerary
                  </Badge>
                </div>
              )}
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500 text-white border-0 rounded-full px-3">
                  Save ${pkg.originalPrice - pkg.price}
                </Badge>
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <Badge className={`${
                  pkg.difficulty === 'easy' ? 'bg-green-400' :
                  pkg.difficulty === 'moderate' ? 'bg-amber-400' :
                  'bg-orange-400'
                } text-white border-0 rounded-full`}>
                  {pkg.difficulty.charAt(0).toUpperCase() + pkg.difficulty.slice(1)}
                </Badge>
                <div className="flex items-center text-white/90 text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{getDisplayLocation(pkg)}</span>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#33343B] mb-2 group-hover:text-[#749DD0] transition-colors">
                    {pkg.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-[#AAA59F]">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-[#749DD0]" />
                      <span>{pkg.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-[#749DD0]" />
                      <span>{pkg.groupSize}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center bg-[#CFE7F8] px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 text-[#f59e0b] mr-1" />
                  <span className="text-sm font-semibold text-[#33343B]">{pkg.rating}</span>
                  <span className="text-xs text-[#AAA59F] ml-1">({pkg.reviews})</span>
                </div>
              </div>

              <div className="mb-5">
                <div className="space-y-2">
                  {pkg.highlights.slice(0, 3).map((highlight, index) => (
                    <div key={index} className="flex items-center text-sm text-[#AAA59F]">
                      <Check className="h-4 w-4 text-[#749DD0] mr-2 flex-shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                  {pkg.highlights.length > 3 && (
                    <p className="text-xs text-[#749DD0] font-medium">+{pkg.highlights.length - 3} more highlights</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-5 pt-4 border-t border-[#CFE7F8]">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-[#749DD0]">
                      ${pkg.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-[#AAA59F] line-through">
                      ${pkg.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#AAA59F]">per person</p>
                </div>
                <Badge className="bg-[#CFE7F8] text-[#48547C] border-0 rounded-full">
                  {pkg.category}
                </Badge>
              </div>

              <div className="flex gap-3">
                <Link to={`/book?package=${(pkg as Package & { slug?: string }).slug || slugify(pkg.name) || pkg.id}`} className="flex-1">
                  <Button className="w-full bg-[#749DD0] hover:bg-[#48547C] text-white rounded-full transition-all duration-300">
                    Book Now
                  </Button>
                </Link>
                <Link to={`/package/${(pkg as Package & { slug?: string }).slug || slugify(pkg.name) || pkg.id}`} className="flex-1">
                  <Button variant="outline" className="w-full border-2 border-[#749DD0] text-[#749DD0] hover:bg-[#749DD0] hover:text-white rounded-full transition-all duration-300">
                    Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Main Coming Soon Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#33343B] via-[#48547C] to-[#33343B] p-1">
            {/* Animated Border Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#749DD0] via-[#92AAD1] to-[#749DD0] opacity-50 blur-xl animate-pulse" />
            
            <div className="relative rounded-[22px] bg-gradient-to-br from-[#33343B] to-[#48547C] overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 opacity-5" style={{ 
                  backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                  backgroundSize: '32px 32px'
                }} />
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#749DD0]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#92AAD1]/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
              </div>

              <div className="relative px-8 py-16 md:py-24 text-center">
                {/* Floating Icons Animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-12 left-[15%] animate-bounce" style={{ animationDuration: '3s', animationDelay: '0s' }}>
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center rotate-12">
                      <Binoculars className="w-6 h-6 text-[#92AAD1]" />
                    </div>
                  </div>
                  <div className="absolute top-20 right-[12%] animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center -rotate-12">
                      <Camera className="w-7 h-7 text-[#CFE7F8]" />
                    </div>
                  </div>
                  <div className="absolute bottom-16 left-[10%] animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center rotate-6">
                      <MapPin className="w-5 h-5 text-[#749DD0]" />
                    </div>
                  </div>
                  <div className="absolute bottom-24 right-[8%] animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '1.5s' }}>
                    <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center -rotate-6">
                      <Star className="w-5 h-5 text-[#92AAD1]" />
                    </div>
                  </div>
                </div>

                {/* Central Content */}
                <div className="relative z-10">
                  {/* Animated Icon */}
                  <div className="relative inline-block mb-8">
                    <div className="absolute inset-0 w-28 h-28 mx-auto rounded-full bg-[#749DD0]/30 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="relative w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-[#749DD0] to-[#92AAD1] flex items-center justify-center shadow-2xl shadow-[#749DD0]/40">
                      <Plane className="w-12 h-12 text-white transform -rotate-45" />
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/10 backdrop-blur-md rounded-full mb-8 border border-white/20">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                    </span>
                    <span className="text-sm font-medium text-white/90 tracking-wide">Exciting Packages in Development</span>
                  </div>

                  {/* Heading */}
                  <h3 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
                    Coming
                    <span className="block bg-gradient-to-r from-[#92AAD1] via-[#CFE7F8] to-[#92AAD1] bg-clip-text text-transparent">
                      Soon
                    </span>
                  </h3>

                  {/* Description */}
                  <p className="text-lg md:text-xl text-white/70 mb-12 max-w-xl mx-auto leading-relaxed">
                    We're curating extraordinary safari adventures that will take your breath away. 
                    Be the first to explore our handcrafted journeys.
                  </p>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {[
                      { icon: Binoculars, text: 'Wildlife Expeditions' },
                      { icon: Camera, text: 'Photography Tours' },
                      { icon: Building2, text: 'Luxury Lodges' },
                      { icon: Car, text: 'Private Safaris' },
                      { icon: Utensils, text: 'Culinary Journeys' }
                    ].map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-default group"
                      >
                        <item.icon className="w-4 h-4 text-[#92AAD1] group-hover:text-[#CFE7F8] transition-colors" />
                        <span className="text-sm text-white/80 group-hover:text-white transition-colors">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Section */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link to="/contact">
                      <Button className="group bg-white hover:bg-[#CFE7F8] text-[#33343B] px-8 py-6 rounded-full text-base font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <span className="mr-3">Notify Me When Ready</span>
                        <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </Button>
                    </Link>
                    <Button 
                      onClick={() => {
                        setSearchTerm('');
                        setCategoryFilter('all');
                        setPriceFilter('all');
                        setDurationFilter('all');
                        setSortBy('featured');
                      }}
                      variant="outline"
                      className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-6 rounded-full text-base font-semibold transition-all duration-300"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom Decorative Wave */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#92AAD1] to-transparent opacity-50" />
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-center">
            {[
              { value: '50+', label: 'Destinations Planned' },
              { value: '100%', label: 'Handcrafted Experiences' },
              { value: '24/7', label: 'Expert Support' }
            ].map((stat, index) => (
              <div key={index} className="px-6">
                <div className="text-2xl md:text-3xl font-bold text-[#749DD0]">{stat.value}</div>
                <div className="text-sm text-[#48547C]/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
</section>

      {/* Package Categories 
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Browse by Safari Type
            </h2>
            <p className="text-xl text-gray-600">
              Find the perfect safari experience for your adventure style
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map(category => {
              const categoryPackages = tourPackages.filter(p => p.category === category);
              const avgPrice = Math.round(categoryPackages.reduce((sum, p) => sum + p.price, 0) / categoryPackages.length);
              const packagesWithItinerary = categoryPackages.filter(p => p.itinerary && p.itinerary.length > 0).length;
              const icon = category.includes('Wildlife') ? Binoculars :
                          category.includes('Luxury') ? Star :
                          category.includes('Adventure') ? Camera :
                          category.includes('Water') ? Car :
                          category.includes('Desert') ? Plane :
                          Users;
              const IconComponent = icon;

              return (
                <Card key={category} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCategoryFilter(category)}>
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {category}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {categoryPackages.length} packages available
                      {packagesWithItinerary > 0 && (
                        <span className="text-blue-600"> • {packagesWithItinerary} with detailed itineraries</span>
                      )}
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        From ${avgPrice.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500" />
                        {(categoryPackages.reduce((sum, p) => sum + p.rating, 0) / categoryPackages.length).toFixed(1)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-24 bg-[#749DD0] relative overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#92AAD1] rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#48547C] rounded-full translate-y-1/2 -translate-x-1/2 opacity-30" />
        
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Ready for Your Safari Adventure?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Book your dream safari package today and create memories that will last a lifetime
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-[#749DD0] hover:bg-[#CFE7F8] px-10 py-6 rounded-full text-lg font-semibold transition-all duration-300 hover:shadow-xl">
              Book Any Package
            </Button>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-[#749DD0] px-10 py-6 rounded-full text-lg font-semibold transition-all duration-300">
                Speak to Expert
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#33343B] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#92AAD1]">Safari Packages</h3>
              <p className="text-[#AAA59F] mb-4">
                Creating unforgettable safari experiences across Africa's most spectacular destinations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#92AAD1]">Package Types</h4>
              <ul className="space-y-3 text-[#AAA59F]">
                {categories.map(category => (
                  <li key={category}>
                    <button 
                      onClick={() => setCategoryFilter(category)}
                      className="hover:text-white transition-colors"
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#92AAD1]">Quick Links</h4>
              <ul className="space-y-3 text-[#AAA59F]">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/collections" className="hover:text-white transition-colors">Properties</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#92AAD1]">Contact</h4>
              <ul className="space-y-3 text-[#AAA59F]">
                <li>+254 116072343</li>
                <li>info@thebushcollection.africa</li>
                <li>42 Claret Close, Silanga Road, Karen.</li>
                <li>P.O BOX 58671-00200, Nairobi</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#48547C] mt-12 pt-8 text-center text-[#AAA59F]">
            <p>&copy; {new Date().getFullYear()} The Bush Collection. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}