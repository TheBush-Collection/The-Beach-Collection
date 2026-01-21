import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Calendar, Users, Search, Filter, ChevronDown, ArrowRight, Waves, Building2, Sparkles, Heart, Shield, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBackendProperties } from '@/hooks/useBackendProperties';
import PropertyCard from '@/components/PropertyCard';
import OptimizedImage from '@/components/OptimizedImage';
import ReviewsSection from '@/components/ReviewsSection';
import { subscribeToMailchimp } from '@/lib/mailchimp';
import { toast } from 'sonner';

export default function Index() {
  const { properties, loading, error } = useBackendProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  const carouselData = useMemo(() => [
    {
      place: 'Mwazaro',
      title: 'Witness The',
      title2: 'Great Migration',
      description: 'Experience one of nature\'s most spectacular wonders on Kenya\'s coast. At Mwazaro Beach Lodge, you\'ll wake to the sound of the Indian Ocean, stroll along 300 metres of untouched beach and mangroves, and feel the true rhythm of coastal Kenya.',
      image: 'https://obbrmdtdcevckizykfzu.supabase.co/storage/v1/object/sign/images/Mwazaro-1.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMmQyZDM5YS1mOGUyLTQwNGItOTJlMy1mZjc1ZGJjYmQ5ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvTXdhemFyby0xLmpwZyIsImlhdCI6MTc2MzYyOTcwNCwiZXhwIjoxNzk1MTY1NzA0fQ.Ihw6Bmfj9cx-SsrMzKzH0bt-4Qej5J0sfxw-JgKWllA'
    },
    {
      place: 'Mwazaro',
      title: 'Explore The',
      title2: 'Water Wilderness',
      description: 'Dive into a unique aquatic landscape where the lagoon meets ocean, and mangrove channels beckon. Kayak, kite‑surf, snorkel or simply drift into calm as the tides spin their magic in this hidden gem south of Mombasa.',
      image: 'https://obbrmdtdcevckizykfzu.supabase.co/storage/v1/object/sign/images/Mwazaro-21.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMmQyZDM5YS1mOGUyLTQwNGItOTJlMy1mZjc1ZGJjYmQ5ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvTXdhemFyby0yMS5qcGciLCJpYXQiOjE3NjM2Mjk3NTksImV4cCI6MTc5NTE2NTc1OX0.Pvrn4sSkN6u8EJQqmuvj-epoOj--T1DlEUKWJlJRhrc'
    },
    {
      place: 'Mwazaro',
      title: 'Experience The',
      title2: 'Magic of The Beach',
      description: 'Mwazaro Beach Lodge offers a rare blend of tranquility and adventure. As the Indian Ocean meets lush mangroves, this lodge is your gateway to Kenya\'s wildlife and coastal charm.',
      image: 'https://obbrmdtdcevckizykfzu.supabase.co/storage/v1/object/sign/images/Mwazaro-14.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMmQyZDM5YS1mOGUyLTQwNGItOTJlMy1mZjc1ZGJjYmQ5ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvTXdhemFyby0xNC5qcGciLCJpYXQiOjE3NjM2Mjk4NzksImV4cCI6MTc5NTE2NTg3OX0.CeuwjPVvymlgWfQ5QjVAw8KH9n36zolqfx1Ahmdrbq8'
    },
    {
      place: 'Mwazaro',
      title: 'Discover The',
      title2: 'Secret Coastline',
      description: 'Escape to Mwazaro Beach Lodge, where the turquoise waters of the Indian Ocean meet the serene beauty of untouched nature.',
      image: 'https://obbrmdtdcevckizykfzu.supabase.co/storage/v1/object/sign/images/Mwazaro-13.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8zMmQyZDM5YS1mOGUyLTQwNGItOTJlMy1mZjc1ZGJjYmQ5ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvTXdhemFyby0xMy5qcGciLCJpYXQiOjE3NjM2Mjk4MzIsImV4cCI6MTc5NTE2NTgzMn0.4L16wdz4HQcyZubogPX0d0u4VwXtXedbJ1Br7odFfiw'
    }
  ], []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselData.length) % carouselData.length);
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [carouselData.length]);

  // Preload all carousel images on mount to make initial paint immediate
  useEffect(() =>{
    const imgs: HTMLImageElement[] = [];
    carouselData.forEach((s) => {
      const img = new Image();
      img.src = s.image;
      imgs.push(img);
    });

    return () => {
      // clear src to allow GC
      imgs.forEach(i => { try { i.src = ''; } catch (e) { void e; } });
    };
  }, [carouselData]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#33343B] to-[#48547C]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#92AAD1] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/80">Loading beach properties...</p>
        </div>
      </div>
    );
  }
  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#33343B] to-[#48547C]">
        <div className="text-center">
          <p className="text-red-400 mb-2">Error loading properties</p>
          <p className="text-white/60 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Filter properties based on search, type, and exclude Nairobi hotels
  const filteredProperties = properties.filter(property => {
    const matchesSearch =
      (property.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.location || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'all' || property.type === selectedType;

    // Exclude Nairobi hotels
    const isNairobiHotel =
      property.location?.toLowerCase().includes('nairobi') ||
      property.name?.toLowerCase().includes('nairobi');

    return matchesSearch && matchesType && !isNairobiHotel;
  });

  // Featured properties excluding Nairobi hotels
  const featuredProperties = properties.filter(
    property =>
      property.featured &&
      !property.location?.toLowerCase().includes('nairobi') &&
      !property.name?.toLowerCase().includes('nairobi')
  );

  // Filter out undefined/null types and get unique property types
  const propertyTypes = [
    ...new Set(
      properties
        .map(p => p.type)
        .filter(
          (type): type is string =>
            type !== null && type !== undefined && typeof type === 'string'
        )
    ),
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Floating subscribe button */}
      <button
        onClick={() => setShowSubscribeModal(true)}
        aria-label="Subscribe to newsletter"
        className="fixed right-8 bottom-8 z-50 flex items-center gap-3 bg-gradient-to-r from-[#749DD0] to-[#48547C] text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18" />
        </svg>
        <span className="font-medium">Subscribe</span>
      </button>

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowSubscribeModal(false)} />
          <div className="relative z-50 w-full max-w-md px-4">
            <div className="bg-transparent">
              <div onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => setShowSubscribeModal(false)}
                    className="text-white text-xl leading-none p-2"
                    aria-label="Close subscribe modal"
                  >
                    ×
                  </button>
                </div>
                <div className="mx-auto">
                  <div className="p-0">
                    <NewsletterForm onClose={() => setShowSubscribeModal(false)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Hero Section with Carousel */}
      <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
        {/* Background Slides */}
        {carouselData.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <OptimizedImage
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              loading={index === currentSlide ? 'eager' : 'lazy'}
              decoding="async"
              placeholder="/placeholder-image.png"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#33343B]/80 via-[#33343B]/40 to-transparent"></div>
          </div>
        ))}

        {/* Property Tag - Top Left */}
        <div className="absolute top-8 left-8 z-20">
          <span className="px-4 py-2 bg-[#749DD0]/80 backdrop-blur-sm text-white text-sm md:text-base font-medium rounded-full">
            {carouselData[currentSlide].place}
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 text-left max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-3xl">
            {/* Main Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white block">{carouselData[currentSlide].title}</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#92AAD1] to-[#CFE7F8] block">{carouselData[currentSlide].title2}</span>
            </h1>
            
            {/* Description */}
            <p className="text-base md:text-lg mb-8 text-white/90 max-w-2xl leading-relaxed">
              {carouselData[currentSlide].description}
            </p>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/collections">
                <Button size="lg" className="bg-white hover:bg-[#CFE7F8] text-[#33343B] px-8 py-3 text-base font-semibold rounded-full transition-all hover:scale-105 shadow-lg">
                  Explore Properties
                </Button>
              </Link>
              <Link to="/book">
                <Button size="lg" className="bg-gradient-to-r from-[#749DD0] to-[#48547C] hover:from-[#48547C] hover:to-[#33343B] text-white border-0 px-8 py-3 text-base font-semibold rounded-full transition-all hover:scale-105 shadow-lg">
                  Book Now
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Navigation - Right Side */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 flex flex-col space-y-4">
          <button
            onClick={prevSlide}
            className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 group"
            aria-label="Previous slide"
          >
            <svg 
              className="w-6 h-6 text-white group-hover:scale-110 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 group"
            aria-label="Next slide"
          >
            <svg 
              className="w-6 h-6 text-white group-hover:scale-110 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Slide Indicators - Right Side with Number */}
        <div className="absolute right-8 bottom-8 z-20 flex flex-col items-center space-y-3">
          {/* Slide Dots - Horizontal */}
          <div className="flex space-x-2">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-white w-10 h-3' 
                    : 'bg-white/40 w-3 h-3 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          
          {/* Current Slide Number */}
          <div className="text-white text-4xl font-bold">
            {String(currentSlide + 1).padStart(2, '0')}
          </div>
        </div>
      </section>

      {/* Search Section - Modern Floating Design */}
      <section className="relative -mt-24 z-20 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#CFE7F8]/50 p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-[#48547C]">Where to?</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#92AAD1] h-5 w-5" />
                  <Input
                    placeholder="Search beaches, lodges, destinations..."
                    className="pl-12 h-14 bg-[#CFE7F8]/20 text-[#33343B] border-[#CFE7F8] placeholder:text-[#48547C]/50 rounded-xl text-base focus:ring-2 focus:ring-[#749DD0] focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full lg:w-48 space-y-2">
                <label className="text-sm font-medium text-[#48547C]">Property Type</label>
                <select
                  className="w-full h-14 px-4 bg-[#CFE7F8]/20 text-[#33343B] border border-[#CFE7F8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#749DD0]"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  {propertyTypes.map((type, index) => (
                    <option key={type || `type-${index}`} value={type}>
                      {type && typeof type === 'string' ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>
              <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-[#749DD0] to-[#48547C] hover:from-[#48547C] hover:to-[#33343B] text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 w-full lg:w-auto">
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-6 border-t border-[#CFE7F8]/50">
              <div className="flex items-center gap-2 text-[#48547C]">
                <div className="w-8 h-8 bg-[#749DD0]/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-[#749DD0]" />
                </div>
                <span className="text-sm"><strong className="text-[#33343B]">{properties.length}</strong> Properties</span>
              </div>
              <div className="flex items-center gap-2 text-[#48547C]">
                <div className="w-8 h-8 bg-[#92AAD1]/10 rounded-lg flex items-center justify-center">
                  <Waves className="w-4 h-4 text-[#92AAD1]" />
                </div>
                <span className="text-sm"><strong className="text-[#33343B]">5+</strong> Beach Locations</span>
              </div>
              <div className="flex items-center gap-2 text-[#48547C]">
                <div className="w-8 h-8 bg-[#CFE7F8] rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-[#749DD0]" />
                </div>
                <span className="text-sm"><strong className="text-[#33343B]">4.9</strong> Avg Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties - Modern Bento Grid */}
      {featuredProperties.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-white via-[#CFE7F8]/10 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#92AAD1]/20 text-[#48547C] rounded-full text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  Featured Collection
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-[#33343B] mb-3">
                  Handpicked Beach
                  <span className="block bg-gradient-to-r from-[#749DD0] to-[#92AAD1] bg-clip-text text-transparent">
                    Destinations
                  </span>
                </h2>
                <p className="text-lg text-[#48547C]/80 max-w-xl">
                  Discover our carefully curated selection of Kenya's finest coastal retreats
                </p>
              </div>
              <Link to="/collections" className="group flex items-center gap-2 text-[#749DD0] font-semibold hover:text-[#48547C] transition-colors">
                View all properties
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Bento Grid for Featured Properties */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProperties.slice(0, 5).map((property, index) => {
                // First property - large featured card
                if (index === 0) {
                  return (
                    <Link 
                      key={property.id} 
                      to={`/property/${property.id}`}
                      className="md:col-span-2 md:row-span-2 group relative rounded-3xl overflow-hidden min-h-[500px] lg:min-h-[600px]"
                    >
                      <OptimizedImage
                        src={property.images?.[0] || '/placeholder-image.png'}
                        alt={property.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#33343B] via-[#33343B]/40 to-transparent" />
                      
                      {/* Featured Badge */}
                      <div className="absolute top-6 left-6">
                        <Badge className="bg-gradient-to-r from-[#749DD0] to-[#92AAD1] text-white border-0 px-4 py-2 text-sm font-medium shadow-lg">
                          ✨ Featured
                        </Badge>
                      </div>
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                          <MapPin className="w-4 h-4" />
                          {property.location}
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-bold text-white mb-3 group-hover:text-[#CFE7F8] transition-colors">
                          {property.name}
                        </h3>
                        <p className="text-white/70 mb-4 line-clamp-2 max-w-lg">
                          {property.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                              <span className="text-white font-semibold">{property.rating || '4.9'}</span>
                            </div>
                            <span className="text-white/50">•</span>
                            <span className="text-white/70">{property.reviews || 0} reviews</span>
                          </div>
                          <div className="text-white font-bold text-xl">
                            From ${property.basePricePerNight}<span className="text-sm font-normal text-white/60">/night</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                }
                
                // Other featured cards - smaller
                return (
                  <Link 
                    key={property.id} 
                    to={`/property/${property.id}`}
                    className="group relative rounded-2xl overflow-hidden min-h-[280px] bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="absolute inset-0">
                      <OptimizedImage
                        src={property.images?.[0] || '/placeholder-image.png'}
                        alt={property.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#33343B]/90 via-[#33343B]/30 to-transparent" />
                    </div>
                    
                    {/* Rating Badge */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-[#33343B]">{property.rating || '4.9'}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center gap-1.5 text-white/70 text-xs mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {property.location}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#CFE7F8] transition-colors line-clamp-1">
                        {property.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60 text-sm">{property.type}</span>
                        <span className="text-white font-semibold">
                          ${property.basePricePerNight}<span className="text-xs font-normal text-white/50">/night</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* All Properties - Modern Grid */}
      <section className="py-24 bg-gradient-to-br from-[#33343B] via-[#48547C] to-[#33343B] relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#749DD0]/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#92AAD1]/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-[#CFE7F8] rounded-full text-sm font-medium mb-6 border border-white/10">
              <Waves className="w-4 h-4" />
              Explore All
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              All Beach Properties
            </h2>
            <p className="text-xl text-[#CFE7F8]/70 max-w-2xl mx-auto">
              {filteredProperties.length} stunning coastal retreats waiting for you
            </p>
          </div>

          {filteredProperties.length > 0 ? (
            <>
              {/* Modern Masonry-Style Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property, index) => (
                  <Link 
                    key={property.id} 
                    to={`/property/${property.id}`}
                    className={`group relative rounded-3xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#92AAD1]/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#749DD0]/20
                      ${index % 5 === 0 ? 'md:row-span-2 min-h-[400px] lg:min-h-[500px]' : 'min-h-[280px]'}
                    `}
                  >
                    {/* Image */}
                    <div className="absolute inset-0">
                      <OptimizedImage
                        src={property.images?.[0] || '/placeholder-image.png'}
                        alt={property.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#33343B] via-[#33343B]/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                    </div>
                    
                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <Badge className="bg-white/90 backdrop-blur-sm text-[#48547C] border-0 px-3 py-1 text-xs font-medium">
                        {property.type || 'Beach Lodge'}
                      </Badge>
                      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-bold text-[#33343B]">{property.rating || '4.9'}</span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2 text-[#CFE7F8]/80 text-sm mb-2">
                        <MapPin className="w-4 h-4" />
                        {property.location}
                      </div>
                      <h3 className={`font-bold text-white mb-3 group-hover:text-[#92AAD1] transition-colors
                        ${index % 5 === 0 ? 'text-2xl lg:text-3xl' : 'text-xl'}
                      `}>
                        {property.name}
                      </h3>
                      {index % 5 === 0 && (
                        <p className="text-white/60 text-sm mb-4 line-clamp-2">
                          {property.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center gap-3">
                          {property.amenities?.slice(0, 2).map((amenity: string, i: number) => (
                            <span key={i} className="text-xs text-[#CFE7F8]/60 bg-white/5 px-2 py-1 rounded">
                              {amenity}
                            </span>
                          ))}
                        </div>
                        <div className="text-white font-bold">
                          ${property.basePricePerNight}
                          <span className="text-xs font-normal text-white/50">/night</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover Arrow */}
                    <div className="absolute top-1/2 right-6 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-4">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* View More Button */}
              <div className="text-center mt-12">
                <Link to="/collections">
                  <Button size="lg" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-6 rounded-full text-lg font-semibold backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                    View All Properties
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-[#CFE7F8]/50" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">No properties found</h3>
              <p className="text-[#CFE7F8]/70 max-w-md mx-auto">Try adjusting your search criteria to discover our amazing beach properties</p>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Partners Section */}
      <section className="py-20 bg-gradient-to-r from-[#749DD0] to-[#92AAD1] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 bg-white/20 text-white rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
              🤝 Trusted Partners
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Partners
            </h2>
            <p className="text-xl text-white/80">
              Trusted by leading travel platforms worldwide
            </p>
          </div>
        </div>
        
        {/* Scrolling Partners Container */}
        <div className="relative">
          <div className="flex animate-scroll">
            {/* First set of partners */}
            <div className="flex items-center gap-16 px-8 min-w-max">
              {/* Booking.com */}
              <div className="w-64 md:w-56 h-24 flex items-center justify-center bg-white rounded-lg shadow-lg px-6">
                <div className="flex items-center gap-4">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect width="24" height="24" rx="4" fill="#003580"/>
                    <text x="12" y="16" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">B</text>
                  </svg>
                  <span className="text-lg font-semibold text-[#003580]">Booking.com</span>
                </div>
              </div>
              
              {/* Expedia */}
              <div className="w-64 md:w-56 h-24 flex items-center justify-center bg-white rounded-lg shadow-lg px-6">
                <div className="flex items-center gap-4">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" fill="#FFCB05"/>
                    <path d="M12 6L15 12L12 18L9 12Z" fill="#003087"/>
                  </svg>
                  <span className="text-lg font-semibold text-[#003087]">Expedia</span>
                </div>
              </div>
              
              {/* TripAdvisor */}
              <div className="w-64 md:w-56 h-24 flex items-center justify-center bg-white rounded-lg shadow-lg px-6">
                <div className="flex items-center gap-4">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="8" cy="12" r="4" fill="#34E0A1"/>
                    <circle cx="16" cy="12" r="4" fill="#34E0A1"/>
                    <circle cx="8" cy="12" r="2" fill="#000"/>
                    <circle cx="16" cy="12" r="2" fill="#000"/>
                    <path d="M4 8C4 8 6 6 12 6C18 6 20 8 20 8" stroke="#34E0A1" strokeWidth="2" fill="none"/>
                  </svg>
                  <span className="text-lg font-semibold text-[#34E0A1]">TripAdvisor</span>
                </div>
              </div>
              
              {/* Airbnb */}
              <div className="w-64 md:w-56 h-24 flex items-center justify-center bg-white rounded-lg shadow-lg px-6">
                <div className="flex items-center gap-4">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2ZM12 8C9.8 8 8 9.8 8 12C8 14.2 9.8 16 12 16C14.2 16 16 14.2 16 12C16 9.8 14.2 8 12 8ZM12 18C8.7 18 6 20.7 6 24H18C18 20.7 15.3 18 12 18Z" fill="#FF5A5F"/>
                  </svg>
                  <span className="text-lg font-semibold text-[#FF5A5F]">Airbnb</span>
                </div>
              </div>
              
              {/* Hotels.com */}
              <div className="w-64 md:w-56 h-24 flex items-center justify-center bg-white rounded-lg shadow-lg px-6">
                <div className="flex items-center gap-4">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="4" y="4" width="16" height="16" rx="2" fill="#D32F2F"/>
                    <path d="M8 8H16V10H8V8ZM8 11H16V13H8V11ZM8 14H13V16H8V14Z" fill="white"/>
                  </svg>
                  <span className="text-lg font-semibold text-[#D32F2F]">Hotels.com</span>
                </div>
              </div>
              
              {/* Agoda */}
              <div className="w-64 md:w-56 h-24 flex items-center justify-center bg-white rounded-lg shadow-lg px-6">
                <div className="flex items-center gap-4">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" fill="#FF6B00"/>
                    <path d="M8 10L12 6L16 10L12 14Z" fill="white"/>
                    <path d="M8 14L12 18L16 14L12 10Z" fill="white" opacity="0.7"/>
                  </svg>
                  <span className="text-lg font-semibold text-[#FF6B00]">Agoda</span>
                </div>
              </div>
            </div>
            
            {/* Duplicate set for seamless loop */}
            <div className="flex items-center gap-16 px-8 min-w-max">
              {/* Booking.com */}
              <div className="flex items-center justify-center h-24 px-12 bg-white rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                    <rect width="24" height="24" rx="4" fill="#003580"/>
                    <text x="12" y="16" fontSize="14" fontWeight="bold" fill="white" textAnchor="middle">B</text>
                  </svg>
                  <span className="text-2xl font-bold text-[#003580]">Booking.com</span>
                </div>
              </div>
              
              {/* Expedia */}
              <div className="flex items-center justify-center h-24 px-12 bg-white rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#FFCB05"/>
                    <path d="M12 6L15 12L12 18L9 12Z" fill="#003087"/>
                  </svg>
                  <span className="text-2xl font-bold text-[#003087]">Expedia</span>
                </div>
              </div>
              
              {/* TripAdvisor */}
              <div className="flex items-center justify-center h-24 px-12 bg-white rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                    <circle cx="8" cy="12" r="4" fill="#34E0A1"/>
                    <circle cx="16" cy="12" r="4" fill="#34E0A1"/>
                    <circle cx="8" cy="12" r="2" fill="#000"/>
                    <circle cx="16" cy="12" r="2" fill="#000"/>
                    <path d="M4 8C4 8 6 6 12 6C18 6 20 8 20 8" stroke="#34E0A1" strokeWidth="2" fill="none"/>
                  </svg>
                  <span className="text-2xl font-bold text-[#34E0A1]">TripAdvisor</span>
                </div>
              </div>
              
              {/* Airbnb */}
              <div className="flex items-center justify-center h-24 px-12 bg-white rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2ZM12 8C9.8 8 8 9.8 8 12C8 14.2 9.8 16 12 16C14.2 16 16 14.2 16 12C16 9.8 14.2 8 12 8ZM12 18C8.7 18 6 20.7 6 24H18C18 20.7 15.3 18 12 18Z" fill="#FF5A5F"/>
                  </svg>
                  <span className="text-2xl font-bold text-[#FF5A5F]">Airbnb</span>
                </div>
              </div>
              
              {/* Hotels.com */}
              <div className="flex items-center justify-center h-24 px-12 bg-white rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="16" height="16" rx="2" fill="#D32F2F"/>
                    <path d="M8 8H16V10H8V8ZM8 11H16V13H8V11ZM8 14H13V16H8V14Z" fill="white"/>
                  </svg>
                  <span className="text-2xl font-bold text-[#D32F2F]">Hotels.com</span>
                </div>
              </div>
              
              {/* Agoda */}
              <div className="flex items-center justify-center h-24 px-12 bg-white rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#FF6B00"/>
                    <path d="M8 10L12 6L16 10L12 14Z" fill="white"/>
                    <path d="M8 14L12 18L16 14L12 10Z" fill="white" opacity="0.7"/>
                  </svg>
                  <span className="text-2xl font-bold text-[#FF6B00]">Agoda</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* CTA Section - Modern Design */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#CFE7F8]/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#92AAD1]/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-br from-[#33343B] via-[#48547C] to-[#33343B] rounded-[3rem] p-12 lg:p-16 relative overflow-hidden">
            {/* Inner Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }} />
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#749DD0]/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#92AAD1]/15 rounded-full blur-[80px]" />
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-[#CFE7F8] rounded-full text-sm font-medium mb-6 border border-white/10">
                  <Waves className="w-4 h-4" />
                  Start Your Journey
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Ready for Your
                  <span className="block bg-gradient-to-r from-[#92AAD1] to-[#CFE7F8] bg-clip-text text-transparent">
                    Beach Getaway?
                  </span>
                </h2>
                <p className="text-lg text-[#CFE7F8]/80 mb-8 max-w-lg leading-relaxed">
                  Book your dream coastal escape today. Experience luxury accommodations, pristine beaches, and unforgettable memories on Kenya's stunning coastline.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/book">
                    <Button size="lg" className="bg-gradient-to-r from-[#749DD0] to-[#92AAD1] hover:from-[#92AAD1] hover:to-[#749DD0] text-white px-8 py-6 rounded-full text-lg font-semibold shadow-lg shadow-[#749DD0]/25 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                      Book Your Stay
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 rounded-full text-lg font-semibold transition-all duration-300">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Right - Feature Cards Stack */}
              <div className="hidden lg:block relative">
                <div className="space-y-4">
                  {/* Card 1 */}
                  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition-colors">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#749DD0] to-[#92AAD1] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Best Price Guarantee</h4>
                      <p className="text-white/60 text-sm">Find a lower price? We'll match it</p>
                    </div>
                  </div>
                  
                  {/* Card 2 */}
                  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition-colors">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#92AAD1] to-[#CFE7F8] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Heart className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">Handpicked Properties</h4>
                      <p className="text-white/60 text-sm">Only the finest coastal retreats</p>
                    </div>
                  </div>
                  
                  {/* Card 3 */}
                  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition-colors">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#48547C] to-[#749DD0] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">24/7 Guest Support</h4>
                      <p className="text-white/60 text-sm">We're here whenever you need us</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Modern Design */}
      <footer className="bg-[#33343B] text-[#CFE7F8] pt-20 pb-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#48547C]/30 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#749DD0]/20 rounded-full blur-[100px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#92AAD1] to-[#CFE7F8] bg-clip-text text-transparent">
                The Beach Collection
              </h3>
              <p className="text-[#CFE7F8]/60 mb-6 leading-relaxed">
                Curating Kenya's finest coastal escapes. Experience luxury beachfront living at its best.
              </p>
              {/* Social Icons */}
              <div className="flex space-x-3">
                {['facebook', 'instagram', 'twitter'].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="w-10 h-10 rounded-xl bg-[#48547C]/50 hover:bg-[#749DD0] flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                  >
                    <span className="sr-only">{social}</span>
                  </a>
                ))}
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-6 text-white text-lg">Quick Links</h4>
              <ul className="space-y-4 text-[#CFE7F8]/60">
                <li><Link to="/about" className="hover:text-[#92AAD1] transition-colors duration-200 flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-[#92AAD1]/30 group-hover:bg-[#92AAD1] transition-colors"></span>About Us</Link></li>
                <li><Link to="/collections" className="hover:text-[#92AAD1] transition-colors duration-200 flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-[#92AAD1]/30 group-hover:bg-[#92AAD1] transition-colors"></span>Properties</Link></li>
                <li><Link to="/book" className="hover:text-[#92AAD1] transition-colors duration-200 flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-[#92AAD1]/30 group-hover:bg-[#92AAD1] transition-colors"></span>Book Now</Link></li>
                <li><Link to="/contact" className="hover:text-[#92AAD1] transition-colors duration-200 flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-[#92AAD1]/30 group-hover:bg-[#92AAD1] transition-colors"></span>Contact</Link></li>
                <li><Link to="/faq" className="hover:text-[#92AAD1] transition-colors duration-200 flex items-center gap-3 group"><span className="w-1.5 h-1.5 rounded-full bg-[#92AAD1]/30 group-hover:bg-[#92AAD1] transition-colors"></span>FAQ</Link></li>
              </ul>
            </div>
            
            {/* Destinations */}
            <div>
              <h4 className="font-semibold mb-6 text-white text-lg">Destinations</h4>
              <ul className="space-y-4 text-[#CFE7F8]/60">
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#92AAD1]/30"></span>Diani Beach</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#92AAD1]/30"></span>Mombasa</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#92AAD1]/30"></span>Watamu</li>
                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#92AAD1]/30"></span>Malindi</li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-6 text-white text-lg">Contact Us</h4>
              <ul className="space-y-4 text-[#CFE7F8]/60">
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#48547C]/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-[#92AAD1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">+254 116 072 343</p>
                    <p className="text-sm">Mon-Sat, 8am-6pm</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#48547C]/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-[#92AAD1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">info@thebeachcollection.co.ke</p>
                    <p className="text-sm">We reply within 24hrs</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#48547C]/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-[#92AAD1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">Nairobi, Kenya</p>
                    <p className="text-sm">42 Claret Close, Karen</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-[#48547C]/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#CFE7F8]/50 text-sm">&copy; 2024 The Beach Collection. All rights reserved.</p>
            <div className="flex items-center space-x-6 text-sm text-[#CFE7F8]/50">
              <a href="#" className="hover:text-[#92AAD1] transition-colors">Privacy Policy</a>
              <span className="w-1 h-1 rounded-full bg-[#48547C]"></span>
              <a href="#" className="hover:text-[#92AAD1] transition-colors">Terms of Service</a>
              <span className="w-1 h-1 rounded-full bg-[#48547C]"></span>
              <a href="#" className="hover:text-[#92AAD1] transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NewsletterForm({ onClose }: { onClose?: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  // const toast = useToast();

  const handleSubscribe = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) return toast.error('Enter a valid email');
    setLoading(true);
    try {
      const res = await subscribeToMailchimp({ email });
      if (res.success) {
        // Backend may return mailchimp_status (pending/subscribed) to indicate whether
        // Mailchimp will send a confirmation email (pending) or the member is active (subscribed)
        const status = (res as any).mailchimp_status || (res as any).data?.status;
        if (status === 'pending') {
          toast('Please check your email to confirm your subscription', { type: 'info' });
        } else {
          toast.success('Subscribed — check your inbox for updates');
        }
        setEmail('');
        if (onClose) onClose();
      } else {
        toast.error(res.error || 'Subscription failed');
      }
    } catch (err) {
      console.error('Subscribe error:', err);
      toast.error('Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="relative bg-[#33343B] border border-[#92AAD1] rounded-lg p-8 text-center shadow-lg">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#92AAD1] rounded-full w-12 h-12 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m0 0l4-4m-4 4l4 4" />
          </svg>
        </div>

        <h3 className="text-2xl font-semibold text-[#CFE7F8] mb-2">Subscribe to Our Newsletter</h3>
        <p className="text-sm text-[#CFE7F8]/70 mb-6">Get exclusive safari deals, travel tips, and updates delivered to your inbox.</p>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-3">
          <Input
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="bg-[#48547C] border-[#749DD0] text-[#CFE7F8]"
          />
          <Button type="submit" className="bg-[#92AAD1] text-[#33343B] px-6" disabled={loading}>
            {loading ? 'Subscribing...' : 'Subscribe Now'}
          </Button>
        </form>

        <p className="text-xs text-[#CFE7F8]/50 mt-4">We respect your privacy. Unsubscribe at any time.</p>
      </div>
    </div>
  );
}