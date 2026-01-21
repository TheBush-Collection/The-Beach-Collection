import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, Users, Bed, Bath, Wifi, Wind, Coffee, Star, ArrowLeft, Check, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBackendProperties } from '@/hooks/useBackendProperties';
import type { Property } from '@/hooks/useBackendProperties';
import slugify from '@/lib/slugify';
import { motion } from 'framer-motion';

interface Room {
  id?: string;
  _id?: string;
  name: string;
  description?: string;
  type: string;
  maxGuests?: number;
  max_guests?: number;
  price: number;
  available: boolean;
  amenities: string[];
  images?: string[];
}

export default function RoomDetail() {
  const { propertyId, roomSlug } = useParams<{ propertyId?: string; roomSlug?: string }>();
  
  const { properties, loading, error } = useBackendProperties();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (!properties || properties.length === 0) return;

    // Resolve property by id or slug (propertyId param may be an id, slug, or slugified name)
    const effectivePropertyId = propertyId;
    let foundProperty = null as Property | null;
    if (effectivePropertyId) {
      foundProperty = properties.find(p => {
        const pId = p.id || (p as any)._id;
        const pSlug = (p as any).slug || '';
        return pId === effectivePropertyId || pSlug === effectivePropertyId || slugify(p.name) === effectivePropertyId;
      }) || null;
    }

    if (foundProperty) {
      setProperty(foundProperty);
      // Resolve room by slug within the found property
      if (roomSlug) {
        const foundRoom = (foundProperty.rooms || []).find(r => {
          const rSlug = (r as any).slug || slugify(r.name || '');
          return rSlug === roomSlug;
        }) as Room | undefined;
        setSelectedRoom(foundRoom || null);
      } else {
        setSelectedRoom(null);
      }
      return;
    }

    // If property wasn't found (edge cases), try searching across properties by room slug
    if (roomSlug) {
      let foundProp: Property | undefined;
      let foundRoom: Room | undefined;
      for (const p of properties) {
        const rooms = p.rooms || [];
        const match = rooms.find(r => {
          const rSlug = (r as any).slug || slugify(r.name || '');
          return rSlug === roomSlug;
        });
        if (match) {
          foundProp = p;
          foundRoom = match as Room;
          break;
        }
      }
      if (foundProp) setProperty(foundProp || null);
      else setProperty(null);
      setSelectedRoom(foundRoom || null);
    }
  }, [properties, propertyId, roomSlug]);

  const nextImage = () => {
    if (selectedRoom?.images && selectedRoom.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedRoom.images!.length);
    }
  };

  const prevImage = () => {
    if (selectedRoom?.images && selectedRoom.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedRoom.images!.length) % selectedRoom.images!.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#33343B] to-[#48547C] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#92AAD1] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-xl font-light">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (error || !property || !selectedRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#33343B] to-[#48547C] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#48547C] flex items-center justify-center">
            <Bed className="w-12 h-12 text-[#92AAD1]" />
          </div>
          <h2 className="text-white text-2xl font-semibold mb-2">Room Not Found</h2>
          <p className="text-white/70 mb-6">The room you're looking for doesn't exist or has been removed.</p>
          <Link to="/collections">
            <Button className="bg-[#749DD0] hover:bg-[#48547C] text-white rounded-full px-8">
              Browse Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const roomImages = selectedRoom.images && selectedRoom.images.length > 0 
    ? selectedRoom.images 
    : property.images || [];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-[#CFE7F8]"
    >
      {/* Back Navigation */}
      <div className="fixed top-6 left-6 z-50">
        <Link 
          to={`/property/${propertyId}`}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg hover:bg-white transition-all group"
        >
          <ArrowLeft className="w-5 h-5 text-[#33343B] group-hover:-translate-x-1 transition-transform" />
          <span className="text-[#33343B] font-medium">Back to {property.name}</span>
        </Link>
      </div>

      {/* Hero Section - Immersive Gallery */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          {roomImages.length > 0 && (
            <motion.img
              key={currentImageIndex}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7 }}
              src={roomImages[currentImageIndex]}
              alt={selectedRoom.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#33343B] via-transparent to-[#33343B]/30"></div>
        </div>

        {/* Navigation Arrows */}
        {roomImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center transition-all group"
            >
              <ChevronLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center transition-all group"
            >
              <ChevronRight className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
          </>
        )}

        {/* Hero Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-1.5 bg-[#749DD0] text-white text-sm font-medium rounded-full">
                  {selectedRoom.type}
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {selectedRoom.name}
              </h1>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{property.location || property.name}</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Image Counter */}
        {roomImages.length > 1 && (
          <div className="absolute bottom-8 right-8 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
            <span className="text-white font-medium">{currentImageIndex + 1} / {roomImages.length}</span>
          </div>
        )}
      </section>

      {/* Thumbnail Gallery Strip */}
      {roomImages.length > 1 && (
        <div className="bg-[#33343B] py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {roomImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all ${
                    idx === currentImageIndex 
                      ? 'ring-2 ring-[#749DD0] ring-offset-2 ring-offset-[#33343B] scale-105' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Room Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Info Cards */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#92AAD1]/20 text-center">
                <Users className="w-7 h-7 text-[#749DD0] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#33343B]">{selectedRoom.max_guests || selectedRoom.maxGuests || 2}</p>
                <p className="text-sm text-[#48547C]">Guests</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#92AAD1]/20 text-center">
                <Bed className="w-7 h-7 text-[#749DD0] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#33343B]">1</p>
                <p className="text-sm text-[#48547C]">Bedroom</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#92AAD1]/20 text-center">
                <Bath className="w-7 h-7 text-[#749DD0] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#33343B]">1</p>
                <p className="text-sm text-[#48547C]">Bathroom</p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#92AAD1]/20 text-center">
                <Wind className="w-7 h-7 text-[#749DD0] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#33343B]">AC</p>
                <p className="text-sm text-[#48547C]">Climate</p>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-[#92AAD1]/20"
            >
              <h2 className="text-2xl font-bold text-[#33343B] mb-4">About This Room</h2>
              <p className="text-[#48547C] leading-relaxed text-lg">
                {selectedRoom.description || `Experience luxury and comfort in our ${selectedRoom.name}. This beautifully appointed accommodation offers the perfect blend of modern amenities and natural surroundings, creating an unforgettable retreat at ${property.name}.`}
              </p>
            </motion.div>

            {/* Amenities */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-[#92AAD1]/20"
            >
              <h2 className="text-2xl font-bold text-[#33343B] mb-6">Room Amenities</h2>
              {selectedRoom.amenities && selectedRoom.amenities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRoom.amenities.map((amenity, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 p-3 bg-[#CFE7F8]/30 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-[#749DD0]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-[#749DD0]" />
                      </div>
                      <span className="text-[#33343B] font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { icon: Wifi, name: 'Free WiFi' },
                    { icon: Wind, name: 'Air Conditioning' },
                    { icon: Coffee, name: 'Coffee Maker' },
                    { icon: Bath, name: 'Private Bathroom' },
                    { icon: Bed, name: 'Premium Bedding' },
                    { icon: Shield, name: '24/7 Security' },
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 p-3 bg-[#CFE7F8]/30 rounded-xl"
                    >
                      <item.icon className="w-5 h-5 text-[#749DD0]" />
                      <span className="text-[#33343B]">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Additional Notes */}
            {selectedRoom.amenities && selectedRoom.amenities.some(a => a.includes('*')) && (
              <div className="bg-[#92AAD1]/10 rounded-2xl p-6 border border-[#92AAD1]/30">
                <p className="text-sm text-[#48547C]">
                  * Additional services may be available at extra cost or subject to availability.
                </p>
                {selectedRoom.amenities.some(a => a.includes('**')) && (
                  <p className="text-sm text-[#48547C] mt-2">
                    ** Services run at no extra charge.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="sticky top-6"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-[#92AAD1]/20">
                {/* Price */}
                <div className="text-center mb-6 pb-6 border-b border-[#92AAD1]/20">
                  <p className="text-sm text-[#48547C] mb-1">Starting from</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-[#33343B]">${selectedRoom.price}</span>
                    <span className="text-[#48547C]">/ night</span>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#33343B]">Free Cancellation</p>
                      <p className="text-sm text-[#48547C]">Up to 24 hours before check-in</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#CFE7F8] rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#749DD0]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#33343B]">Flexible Dates</p>
                      <p className="text-sm text-[#48547C]">Change dates anytime</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium text-[#33343B]">Best Price Guarantee</p>
                      <p className="text-sm text-[#48547C]">We match any lower price</p>
                    </div>
                  </div>
                </div>

                {/* Guest Info */}
                <div className="bg-[#CFE7F8]/40 rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#749DD0]" />
                      <span className="text-[#33343B] font-medium">Maximum Guests</span>
                    </div>
                    <span className="text-[#33343B] font-bold">{selectedRoom.max_guests || selectedRoom.maxGuests || 2}</span>
                  </div>
                </div>

                {/* Book Button */}
                <Link to={`/book?property=${property.id}&room=${selectedRoom.id}`} className="block">
                  <Button className="w-full bg-gradient-to-r from-[#749DD0] to-[#48547C] hover:from-[#48547C] hover:to-[#33343B] text-white py-7 text-lg font-semibold rounded-2xl shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]">
                    Book This Room
                  </Button>
                </Link>

                {/* Security Note */}
                <p className="text-center text-sm text-[#48547C] mt-4">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Secure booking with instant confirmation
                </p>
              </div>

              {/* Property Link */}
              <div className="mt-6 text-center">
                <Link 
                  to={`/property/${propertyId}`}
                  className="text-[#749DD0] hover:text-[#48547C] font-medium transition-colors"
                >
                  View all rooms at {property.name} →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#33343B] text-white py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4 text-[#92AAD1]">Quick Links</h4>
              <ul className="space-y-3 text-white/70">
                <li><Link to="/about" className="hover:text-[#92AAD1] transition-colors">About Us</Link></li>
                <li><Link to="/packages" className="hover:text-[#92AAD1] transition-colors">Safari Packages</Link></li>
                <li><Link to="/collections" className="hover:text-[#92AAD1] transition-colors">Collections</Link></li>
                <li><Link to="/contact" className="hover:text-[#92AAD1] transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-[#92AAD1]">Destinations</h4>
              <ul className="space-y-3 text-white/70">
                <li>Kenya</li>
                <li>Tanzania</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-[#92AAD1]">Contact</h4>
              <ul className="space-y-3 text-white/70">
                <li>+254 116072343</li>
                <li>info@thebushcollection.africa</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-[#92AAD1]">Address</h4>
              <p className="text-white/70">42 Claret Close, Silanga Road, Karen.<br/>P.O BOX 58671-00200, Nairobi</p>
            </div>
          </div>
          <div className="border-t border-[#48547C] mt-12 pt-8 text-center text-white/60">
            <p>&copy; 2024 The Bush Collection. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}