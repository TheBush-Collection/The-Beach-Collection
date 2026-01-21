import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  MapPin, 
  Users, 
  Search, 
  Sparkles, 
  Award, 
  Globe,
  Waves,
  Umbrella,
  Building2,
  ArrowRight,
  Heart,
  Sun,
  Shell,
  Wind,
  Coffee
} from 'lucide-react';
import slugify from '@/lib/slugify';
import PropertyCard from '@/components/PropertyCard';
import { useBackendProperties } from '@/hooks/useBackendProperties';
import { Link } from 'react-router-dom';

const Collections = () => {
  const { properties, loading, error } = useBackendProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#CFE7F8]/30 via-white to-[#92AAD1]/20 flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            className="relative w-24 h-24 mx-auto mb-8"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full border-4 border-[#CFE7F8]" />
            <div className="absolute inset-0 rounded-full border-4 border-[#749DD0] border-t-transparent animate-spin" />
            <Waves className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-[#749DD0]" />
          </motion.div>
          <p className="text-[#48547C] text-lg font-medium">Loading beach properties...</p>
          <p className="text-[#92AAD1] text-sm mt-2">Preparing your coastal escape</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#CFE7F8]/30 via-white to-[#92AAD1]/20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Globe className="h-12 w-12 text-red-500" />
          </div>
          <p className="text-red-500 mb-2 text-2xl font-bold">Oops! Something went wrong</p>
          <p className="text-[#48547C]/70">{error}</p>
          <Button 
            className="mt-6 bg-[#749DD0] hover:bg-[#48547C]"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Get unique types and locations
  const propertyTypes = [...new Set(properties.map(p => p.type).filter((type): type is string => type !== null && type !== undefined && typeof type === 'string'))];
  const locations = [...new Set(properties.map(p => p.location).filter((location): location is string => location !== null && location !== undefined && typeof location === 'string'))];

  // Filter properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = (property.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.description && property.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || property.type === selectedType;
    const matchesLocation = selectedLocation === 'all' || property.location === selectedLocation;
    return matchesSearch && matchesType && matchesLocation;
  });

  // Featured properties (first 4)
  const featuredProperties = filteredProperties.slice(0, 4);
  const remainingProperties = filteredProperties.slice(4);

  const safeCapitalize = (str: string | undefined) => {
    if (!str || typeof str !== 'string') return 'Unknown';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Helper to get first image from property (prioritize images over videos for thumbnails)
  const getPropertyThumbnail = (property: typeof properties[0]) => {
    const images = property.images || [];
    const videos = property.videos || [];
    // For thumbnails, prefer images over videos
    if (images.length > 0) return images[0];
    if (videos.length > 0) return videos[0];
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CFE7F8]/20 via-white to-[#92AAD1]/10">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-[#749DD0]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#92AAD1]/15 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
      </div>

      {/* Hero Section - Modern Webflow Style */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#33343B]/95 via-[#33343B]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#33343B]/50 via-transparent to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-12 bg-[#92AAD1]" />
                <Badge className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full">
                  <Waves className="w-4 h-4 inline mr-2" />
                  Beach Collection
                </Badge>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Discover Your
                <span className="block bg-gradient-to-r from-[#CFE7F8] to-[#92AAD1] bg-clip-text text-transparent">
                  Coastal Paradise
                </span>
              </h1>
              
              <p className="text-xl text-white/70 mb-8 leading-relaxed max-w-lg">
                Explore our handpicked collection of luxury beach resorts and coastal retreats 
                along Kenya's pristine shoreline.
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 mb-10">
                {[
                  { value: filteredProperties.length, label: 'Properties' },
                  { value: locations.length, label: 'Destinations' },
                  { value: '4.9', label: 'Avg Rating' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-white/50 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-[#33343B] hover:bg-[#CFE7F8] px-8 py-6 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-xl"
                  onClick={() => document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explore Properties
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link to="/book">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 rounded-full font-semibold text-lg backdrop-blur-sm"
                  >
                    Book Your Stay
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right - Feature Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Umbrella, title: 'Beachfront', desc: 'Direct beach access', color: 'from-[#749DD0] to-[#92AAD1]' },
                  { icon: Sparkles, title: 'Luxury', desc: '5-star amenities', color: 'from-[#92AAD1] to-[#CFE7F8]' },
                  { icon: Sun, title: 'Sunny Days', desc: 'Perfect weather', color: 'from-[#CFE7F8] to-[#749DD0]' },
                  { icon: Heart, title: 'Romance', desc: 'Couples retreats', color: 'from-[#48547C] to-[#749DD0]' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                    <p className="text-white/60 text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Floating Search & Filter Section */}
      <section className="relative z-10 -mt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#749DD0] h-5 w-5" />
                    <Input
                      placeholder="Search by property name, location..."
                      className="pl-12 h-14 text-base bg-[#CFE7F8]/20 border-[#92AAD1]/20 text-[#33343B] placeholder:text-[#48547C]/50 focus:border-[#749DD0] rounded-2xl"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {/* Type Filter */}
                  <div className="lg:w-48">
                    <select
                      className="w-full h-14 px-4 bg-[#CFE7F8]/20 border border-[#92AAD1]/20 text-[#33343B] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#749DD0] focus:border-transparent"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      {propertyTypes.map((type, index) => (
                        <option key={type || `type-${index}`} value={type}>
                          {safeCapitalize(type)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Location Filter */}
                  <div className="lg:w-48">
                    <select
                      className="w-full h-14 px-4 bg-[#CFE7F8]/20 border border-[#92AAD1]/20 text-[#33343B] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#749DD0] focus:border-transparent"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                    >
                      <option value="all">All Locations</option>
                      {locations.map((location, index) => (
                        <option key={location || `loc-${index}`} value={location}>
                          {location || 'Unknown'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filter Tags */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {['Beachfront', 'Pool', 'Spa', 'Restaurant', 'Family-Friendly', 'Romantic'].map((tag) => (
                    <button
                      key={tag}
                      className="px-4 py-2 rounded-full text-sm font-medium bg-[#CFE7F8]/30 text-[#48547C] hover:bg-[#749DD0] hover:text-white transition-all duration-300 border border-[#92AAD1]/20"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-[#749DD0]/10 text-[#749DD0] border border-[#749DD0]/20 px-6 py-2 text-sm mb-6 rounded-full">
              <Shell className="w-4 h-4 inline mr-2" />
              Why The Beach Collection
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[#33343B] mb-6">
              Experience Coastal Excellence
            </h2>
            <p className="text-lg text-[#48547C]/70 max-w-2xl mx-auto">
              Every property is curated to deliver unforgettable beachside experiences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Award, 
                title: 'Luxury Standards', 
                desc: 'Hand-selected properties meeting the highest standards of comfort, service, and coastal charm.',
                gradient: 'from-[#749DD0] to-[#48547C]'
              },
              { 
                icon: MapPin, 
                title: 'Prime Beachfront', 
                desc: 'Strategically located on Kenya\'s most pristine beaches with direct ocean access.',
                gradient: 'from-[#92AAD1] to-[#749DD0]'
              },
              { 
                icon: Globe, 
                title: 'Local Expertise', 
                desc: 'Knowledgeable staff dedicated to creating authentic coastal experiences and memories.',
                gradient: 'from-[#CFE7F8] to-[#92AAD1]'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="group relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="bg-white rounded-3xl p-8 border border-[#92AAD1]/10 hover:border-[#749DD0]/30 hover:shadow-2xl transition-all duration-500 h-full relative overflow-hidden">
                  {/* Decorative gradient */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity`} />
                  
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <item.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-[#33343B] mb-4">{item.title}</h3>
                  <p className="text-[#48547C]/70 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties - Bento Grid */}
      {featuredProperties.length > 0 && (
        <section id="properties" className="py-20 bg-gradient-to-b from-white to-[#CFE7F8]/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div>
                <Badge className="bg-[#749DD0]/10 text-[#749DD0] border border-[#749DD0]/20 px-4 py-2 text-sm mb-4 rounded-full">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Featured Collection
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-[#33343B] mb-3">
                  Our Beach Properties
                </h2>
                <p className="text-lg text-[#48547C]/70 max-w-xl">
                  Discover handpicked luxury accommodations along Kenya's stunning coastline
                </p>
              </div>
              <Link to="/book">
                <Button className="bg-[#749DD0] hover:bg-[#48547C] text-white rounded-full px-6">
                  View All Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Bento Grid for Featured Properties */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {featuredProperties.map((property, index) => (
                <motion.div 
                  key={property.id}
                  className={`group relative ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredProperty(property.id)}
                  onMouseLeave={() => setHoveredProperty(null)}
                >
                  <div className={`relative overflow-hidden rounded-3xl ${index === 0 ? 'h-full min-h-[500px]' : 'h-[280px]'} bg-[#33343B]`}>
                    {/* Image */}
                    {property.images && property.images[0] ? (
                      <img
                        src={property.images[0]}
                        alt={property.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#749DD0] to-[#48547C]" />
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#33343B] via-[#33343B]/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {property.featured && (
                          <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 rounded-full">
                            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                            Featured
                          </Badge>
                        )}
                        <Badge className="bg-[#749DD0]/80 backdrop-blur-sm text-white border-0 rounded-full">
                          {safeCapitalize(property.type)}
                        </Badge>
                      </div>

                      {/* Property Info */}
                      <div>
                        <h3 className={`font-bold text-white mb-2 ${index === 0 ? 'text-3xl' : 'text-xl'}`}>
                          {property.name}
                        </h3>
                        <div className="flex items-center text-white/80 text-sm mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location}
                        </div>
                        
                        {index === 0 && (
                          <p className="text-white/70 text-sm mb-4 line-clamp-2">
                            {property.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center text-white">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                              <span className="font-medium">{property.rating}</span>
                            </div>
                            {property.rooms && property.rooms.length > 0 && (
                              <div className="flex items-center text-white/70 text-sm">
                                <Users className="h-4 w-4 mr-1" />
                                {property.rooms.length} rooms
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-white">${property.basePricePerNight || 0}</span>
                            <span className="text-white/60 text-sm">/night</span>
                          </div>
                        </div>

                        {/* Hover Buttons */}
                        <motion.div 
                          className="flex gap-3 mt-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ 
                            opacity: hoveredProperty === property.id ? 1 : 0,
                            y: hoveredProperty === property.id ? 0 : 20
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <Button 
                            variant="outline" 
                            className="flex-1 border-white/30 text-white hover:bg-white hover:text-[#33343B] rounded-full backdrop-blur-sm"
                            onClick={() => {
                              const slug = slugify(property.name) || property.id || property._id;
                              window.location.href = `/property/${slug}`;
                            }}
                          >
                            View Details
                          </Button>
                          <Button 
                            className="flex-1 bg-white text-[#33343B] hover:bg-[#CFE7F8] rounded-full"
                            onClick={() => {
                              const slug = slugify(property.name) || property.id || property._id;
                              window.location.href = `/book?property=${slug}`;
                            }}
                          >
                            Book Now
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Properties Grid */}
      {remainingProperties.length > 0 && (
        <section className="py-20 bg-[#CFE7F8]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-3xl font-bold text-[#33343B] mb-3">
                More Beach Destinations
              </h3>
              <p className="text-[#48547C]/70">
                Explore our complete collection of coastal properties
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {remainingProperties.map((property, index) => (
                <motion.div 
                  key={property.id}
                  className="group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Beach Experience CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#33343B]/90 to-[#33343B]/70" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="bg-white/10 text-white border border-white/20 px-4 py-2 mb-6 rounded-full">
                <Wind className="w-4 h-4 inline mr-2" />
                The Beach Experience
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                More Than Just 
                <span className="block text-[#CFE7F8]">A Place to Stay</span>
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                Our properties offer curated experiences including water sports, spa treatments, 
                gourmet dining, and guided excursions to make your coastal getaway unforgettable.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Waves, label: 'Water Sports' },
                  { icon: Coffee, label: 'Fine Dining' },
                  { icon: Sparkles, label: 'Spa & Wellness' },
                  { icon: Sun, label: 'Beach Activities' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/80">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-[#CFE7F8]" />
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <Link to="/contact">
                <Button size="lg" className="bg-white text-[#33343B] hover:bg-[#CFE7F8] rounded-full px-8">
                  Plan Your Experience
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              
            </motion.div>
          </div>
        </div>
      </section>

      {/* No Results */}
      {filteredProperties.length === 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div 
              className="max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-[#CFE7F8] to-[#92AAD1]/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Search className="h-12 w-12 text-[#749DD0]" />
              </div>
              <h3 className="text-3xl font-bold text-[#33343B] mb-4">
                No properties found
              </h3>
              <p className="text-[#48547C]/70 mb-8 leading-relaxed">
                We couldn't find any properties matching your criteria. Try adjusting your filters or browse all properties.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedLocation('all');
                }}
                className="bg-gradient-to-r from-[#749DD0] to-[#92AAD1] hover:from-[#48547C] hover:to-[#749DD0] text-white px-8 rounded-full"
                size="lg"
              >
                Clear All Filters
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Stats Section - Modern Bento Layout */}
      <section className="py-24 bg-gradient-to-br from-[#33343B] via-[#48547C] to-[#33343B] relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#749DD0]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#92AAD1]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <Waves className="absolute bottom-20 left-20 h-64 w-64 text-white/5 rotate-12" />
          <Shell className="absolute top-20 right-32 h-32 w-32 text-white/5 -rotate-12" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            
            {/* Large Featured Stat - Properties */}
            <motion.div 
              className="col-span-12 md:col-span-5 row-span-2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-white/10 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#749DD0]/20 rounded-full blur-3xl group-hover:bg-[#749DD0]/30 transition-colors" />
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#749DD0] to-[#92AAD1] rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="h-10 w-10 text-white" />
                  </div>
                  <motion.div 
                    className="text-7xl md:text-8xl font-bold text-white mb-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    {filteredProperties.length}
                  </motion.div>
                  <p className="text-2xl text-white/80 font-medium mb-2">Beach Properties</p>
                  <p className="text-white/50 leading-relaxed">
                    Handpicked luxury coastal retreats across Kenya's stunning shoreline
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Header Section */}
            <motion.div 
              className="col-span-12 md:col-span-7"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 h-full flex flex-col justify-center">
                <Badge className="w-fit bg-[#749DD0]/20 text-[#CFE7F8] border-[#749DD0]/30 px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Our Impact
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  The Beach Collection
                  <span className="block text-[#CFE7F8]">By The Numbers</span>
                </h2>
                <p className="text-white/60 max-w-lg">
                  Your gateway to Kenya's finest coastal experiences, trusted by thousands of travelers.
                </p>
              </div>
            </motion.div>

            {/* Destinations Stat */}
            <motion.div 
              className="col-span-6 md:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="bg-gradient-to-br from-[#92AAD1]/20 to-[#749DD0]/10 backdrop-blur-sm rounded-3xl p-6 border border-white/10 h-full group hover:border-[#92AAD1]/30 transition-all duration-300">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#92AAD1]/30 transition-colors">
                  <MapPin className="h-6 w-6 text-[#CFE7F8]" />
                </div>
                <motion.div 
                  className="text-4xl md:text-5xl font-bold text-white mb-2"
                  whileHover={{ scale: 1.1 }}
                >
                  {locations.length}
                </motion.div>
                <p className="text-white/60 text-sm">Coastal Destinations</p>
              </div>
            </motion.div>

            {/* Rating Stat */}
            <motion.div 
              className="col-span-6 md:col-span-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 backdrop-blur-sm rounded-3xl p-6 border border-amber-500/20 h-full group hover:border-amber-500/40 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                    <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <motion.div 
                  className="text-4xl md:text-5xl font-bold text-white mb-2"
                  whileHover={{ scale: 1.1 }}
                >
                  4.9
                </motion.div>
                <p className="text-white/60 text-sm">Average Guest Rating</p>
              </div>
            </motion.div>

            {/* Guests Stat - Wide */}
            <motion.div 
              className="col-span-12 md:col-span-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-white/10 group hover:border-white/20 transition-all duration-300 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#CFE7F8]/10 rounded-full blur-2xl group-hover:bg-[#CFE7F8]/20 transition-colors" />
                <div className="relative flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#CFE7F8]/30 to-[#92AAD1]/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-[#CFE7F8]" />
                  </div>
                  <div>
                    <motion.div 
                      className="text-4xl md:text-5xl font-bold text-white mb-1"
                      whileHover={{ scale: 1.05 }}
                    >
                      500+
                    </motion.div>
                    <p className="text-white/60">Happy Guests & Counting</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Experience Years */}
            <motion.div 
              className="col-span-6 md:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="bg-gradient-to-br from-[#749DD0]/20 to-transparent backdrop-blur-sm rounded-3xl p-6 border border-white/10 h-full text-center group hover:border-[#749DD0]/30 transition-all duration-300">
                <motion.div 
                  className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#CFE7F8] to-[#92AAD1] bg-clip-text text-transparent mb-2"
                  whileHover={{ scale: 1.1 }}
                >
                  10+
                </motion.div>
                <p className="text-white/60 text-sm">Years of Excellence</p>
              </div>
            </motion.div>

            {/* Satisfaction Guarantee */}
            <motion.div 
              className="col-span-6 md:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-sm rounded-3xl p-6 border border-emerald-500/20 h-full text-center group hover:border-emerald-500/40 transition-all duration-300">
                <motion.div 
                  className="text-5xl md:text-6xl font-bold text-emerald-400 mb-2"
                  whileHover={{ scale: 1.1 }}
                >
                  98%
                </motion.div>
                <p className="text-white/60 text-sm">Guest Satisfaction</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#33343B] text-white py-20 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#749DD0]/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#92AAD1]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#749DD0] to-[#92AAD1] rounded-xl flex items-center justify-center">
                  <Waves className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">The Beach Collection</h3>
              </div>
              <p className="text-white/60 mb-6 leading-relaxed max-w-md">
                Curated luxury beach experiences along Kenya's stunning coastline. 
                We bring you the finest coastal retreats for unforgettable seaside getaways.
              </p>
              <div className="flex gap-4">
                {['facebook', 'twitter', 'instagram'].map((social) => (
                  <a 
                    key={social}
                    href={`#${social}`}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#749DD0] transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <Globe className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-white/60">
                {[
                  { label: 'All Properties', href: '#properties' },
                  { label: 'About Us', href: '/about' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'FAQ', href: '/faq' }
                ].map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href}
                      className="hover:text-[#CFE7F8] transition-colors flex items-center gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Contact Us</h4>
              <ul className="space-y-4 text-white/60">
                <li className="flex items-center gap-3 hover:text-[#CFE7F8] transition-colors">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-[#CFE7F8]" />
                  </div>
                  <span className="text-sm">Diani Beach, Kenya</span>
                </li>
                <li className="flex items-center gap-3 hover:text-[#CFE7F8] transition-colors">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <Globe className="h-4 w-4 text-[#CFE7F8]" />
                  </div>
                  <span className="text-sm">info@thebeachcollection.africa</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/50 text-sm">&copy; 2026 The Beach Collection. All rights reserved.</p>
            <div className="flex gap-6 text-white/50 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Collections;