import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  MapPin,
  Users,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Play,
  Eye,
  Plus,
  Minus,
  X,
  Waves,
  Heart,
  Share2,
  Sparkles,
  UtensilsCrossed,
  Bath,
  Tv,
  Wind,
  Sun,
  Shell,
  Bed,
  Phone,
  Mail,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useBackendProperties } from '@/hooks/useBackendProperties';
import slugify from '@/lib/slugify';

interface AmenityIconMap {
  [key: string]: React.ComponentType<{ className?: string }>;
}

interface Room {
  id: string;
  name: string;
  description: string;
  type: string;
  maxGuests: number;
  price: number;
  available: boolean;
  bookedUntil?: string;
  availableFrom?: string;
  amenities: string[];
  images?: string[];
}

interface GroupedRoom {
  name: string;
  type: string;
  maxGuests: number;
  price: number;
  availableCount: number;
  totalCount: number;
  amenities: string[];
  images?: string[];
  description: string;
  sampleRoomId: string;
  sampleRoomSlug?: string;
}

const amenityIcons: AmenityIconMap = {
  'Free WiFi': Wifi,
  'Parking': Car,
  'Restaurant': Utensils,
  'Coffee': Coffee,
};

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const { properties, loading, error } = useBackendProperties();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [roomImageIndexes, setRoomImageIndexes] = useState<{ [key: string]: number }>({});
  const [roomQuantities, setRoomQuantities] = useState<{ [key: string]: number }>({});
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomDetailsOpen, setRoomDetailsOpen] = useState(false);
  const [roomDetailImageIndex, setRoomDetailImageIndex] = useState(0);

  // Combine images and videos into a single media array
  const getPropertyMedia = (prop: typeof properties[0] | undefined) => {
    if (!prop) return [];
    const images = prop.images || [];
    const videos = prop.videos || [];
    // Put videos first to showcase them, then images
    return [...videos, ...images].filter(Boolean);
  };

  // Image navigation functions - now use combined media
  const nextImage = () => {
    const media = getPropertyMedia(property);
    if (media.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % media.length);
    }
  };

  const prevImage = () => {
    const media = getPropertyMedia(property);
    if (media.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + media.length) % media.length);
    }
  };

  // Room image navigation
  const nextRoomImage = (roomId: string, totalImages: number) => {
    setRoomImageIndexes(prev => ({
      ...prev,
      [roomId]: ((prev[roomId] || 0) + 1) % totalImages
    }));
  };

  const prevRoomImage = (roomId: string, totalImages: number) => {
    setRoomImageIndexes(prev => ({
      ...prev,
      [roomId]: ((prev[roomId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  // Room details functions
  const openRoomDetails = (room: Room) => {
    setSelectedRoom(room);
    setRoomDetailImageIndex(roomImageIndexes[room.id] || 0);
    setRoomDetailsOpen(true);
  };

  const closeRoomDetails = () => {
    setRoomDetailsOpen(false);
  };

  const nextRoomDetailImage = () => {
    if (selectedRoom && selectedRoom.images) {
      setRoomDetailImageIndex((prev) => (prev + 1) % selectedRoom.images!.length);
    }
  };

  const prevRoomDetailImage = () => {
    if (selectedRoom && selectedRoom.images) {
      setRoomDetailImageIndex((prev) => (prev - 1 + selectedRoom.images!.length) % selectedRoom.images!.length);
    }
  };

  // Handle room quantity changes
  const updateRoomQuantity = (roomName: string, quantity: number) => {
    setRoomQuantities(prev => ({
      ...prev,
      [roomName]: Math.max(0, Math.min(quantity, groupedRooms.find(g => g.name === roomName)?.availableCount || 0))
    }));
  };

  const getRoomQuantity = (roomName: string) => {
    return roomQuantities[roomName] || 0;
  };

  // Enhanced video detection function
  const isVideo = (url: string) => {
    if (!url || typeof url !== 'string') return false;

    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.wmv'];
    const videoHosts = [
      'youtube.com',
      'youtu.be',
      'vimeo.com',
      'dailymotion.com'
    ];

    // Microsoft services that should be treated as images, not videos
    const microsoftImageServices = [
      'microsoftpersonalcontent.com',
      'southcentralus1-mediap.svc.ms',
      'mediap.svc.ms'
    ];

    // Check for video file extensions
    const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));

    // Check for video hosting platforms (excluding Microsoft services)
    const isVideoHost = videoHosts.some(host => url.toLowerCase().includes(host));

    // Check for Microsoft services (treat as images, not videos)
    const isMicrosoftService = microsoftImageServices.some(host => url.toLowerCase().includes(host));

    // Check for explicit video indicators
    const hasVideoIndicator = url.toLowerCase().includes('video');

    // Return true only for actual video hosts, not Microsoft services
    return hasVideoExtension || (isVideoHost && !isMicrosoftService) || (hasVideoIndicator && !isMicrosoftService);
  };

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
          <p className="text-[#48547C] text-lg font-medium">Loading property details...</p>
          <p className="text-[#92AAD1] text-sm mt-2">Preparing your coastal retreat</p>
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
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <p className="text-red-500 mb-2 text-2xl font-bold">Error loading property</p>
          <p className="text-[#48547C]/70">{error}</p>
          <Link to="/collections">
            <Button className="mt-6 bg-[#749DD0] hover:bg-[#48547C] text-white rounded-full px-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // allow looking up by id, slug, or generated slug from name
  const property = properties.find(p => {
    const pId = p.id || (p as any)._id;
    const pSlug = (p as any).slug || '';
    return pId === id || pSlug === id || slugify(p.name) === id;
  });

  if (!property) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#CFE7F8]/30 via-white to-[#92AAD1]/20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-[#CFE7F8] to-[#92AAD1]/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shell className="h-12 w-12 text-[#749DD0]" />
          </div>
          <h1 className="text-3xl font-bold text-[#33343B] mb-4">Property Not Found</h1>
          <p className="text-[#48547C]/70 mb-8">The property you're looking for doesn't exist or may have been moved.</p>
          <Link to="/collections">
            <Button className="bg-gradient-to-r from-[#749DD0] to-[#92AAD1] hover:from-[#48547C] hover:to-[#749DD0] text-white rounded-full px-8">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse All Properties
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Map backend rooms to expected format and group by name
  const rooms = (property.rooms || []).map(room => ({
    id: room.id,
    name: room.name,
    description: room.description || `${room.name} - ${room.type} room accommodating up to ${room.maxGuests || room.max_guests} guests with modern amenities and stunning views`,
    type: room.type,
    maxGuests: room.maxGuests || room.max_guests,
    price: room.price,
    available: room.available,
    amenities: room.amenities || [],
    images: room.images || []
  }));

  // Group rooms by name
  const groupedRooms = rooms.reduce((acc, room) => {
    const existingGroup = acc.find(group => group.name === room.name);

    if (existingGroup) {
      existingGroup.totalCount++;
      if (room.available) {
        existingGroup.availableCount++;
      }
      // Update other properties if this room has more complete data
      if (room.images && room.images.length > 0) {
        existingGroup.images = room.images;
      }
      if (room.amenities && room.amenities.length > 0) {
        existingGroup.amenities = room.amenities;
      }
    } else {
      acc.push({
        name: room.name,
        type: room.type,
        maxGuests: room.maxGuests,
        price: room.price,
        availableCount: room.available ? 1 : 0,
        totalCount: 1,
        amenities: room.amenities || [],
        images: room.images || [],
        description: room.description,
        sampleRoomId: room.id,
        // include a slug for the room group so links can use a readable room name in the path
        sampleRoomSlug: slugify(room.name || String(room.id))
      });
    }

    return acc;
  }, [] as GroupedRoom[]);

  const availableRoomGroups = groupedRooms.filter(group => group.availableCount > 0);
  const unavailableRoomGroups = groupedRooms.filter(group => group.availableCount === 0);

  // Room Image Carousel Component
  const RoomImageCarousel = ({ room, size = 'large' }: { room: Room, size?: 'small' | 'large' }) => {
    const currentIndex = roomImageIndexes[room.id] || 0;
    const images = room.images || [];
    
    if (images.length === 0) {
      return (
        <div className={`${size === 'small' ? 'w-24 h-20' : 'w-full h-48'} bg-gray-200 rounded-lg flex items-center justify-center`}>
          <div className="text-center text-gray-500">
            <ImageIcon className={`${size === 'small' ? 'h-4 w-4' : 'h-8 w-8'} mx-auto mb-1`} />
            <span className={`${size === 'small' ? 'text-xs' : 'text-sm'}`}>No image</span>
          </div>
        </div>
      );
    }

    const currentMedia = images[currentIndex];
    const isCurrentVideo = isVideo(currentMedia);

    return (
      <div className={`relative ${size === 'small' ? 'w-24 h-20' : 'w-full h-full'} rounded-lg overflow-hidden bg-gray-100`}>
        {isCurrentVideo ? (
          <div className="relative w-full h-full">
            <video
              className="w-full h-full object-cover"
              muted
              loop
              playsInline
              controls={size === 'large'}
              preload="metadata"
              onError={(e) => {
                const target = e.target as HTMLVideoElement;
                console.error('PropertyDetail video failed to load:', {
                  src: target.src,
                  error: target.error,
                  mediaUrl: currentMedia
                });

                // Hide video and show fallback
                target.style.display = 'none';
                const container = target.closest('.relative');
                const fallbackDiv = container?.querySelector('.video-fallback') as HTMLDivElement;
                if (fallbackDiv && fallbackDiv.classList) {
                  fallbackDiv.classList.remove('hidden');
                }
              }}
              onLoadedData={(e) => {
                console.log('PropertyDetail video loaded successfully:', currentMedia);
              }}
              onLoadStart={(e) => {
                console.log('PropertyDetail video load started:', currentMedia);
              }}
              onCanPlay={() => {
                console.log('PropertyDetail video can play:', currentMedia);
              }}
              onPlay={() => {
                console.log('PropertyDetail video started playing:', currentMedia);
              }}
              onPause={() => {
                console.log('PropertyDetail video paused:', currentMedia);
              }}
            >
              <source src={currentMedia} type="video/mp4" />
              <source src={currentMedia} type="video/webm" />
              <source src={currentMedia} type="video/ogg" />
              Your browser does not support the video tag.
            </video>

            {/* Hidden fallback for video errors */}
            <div className="video-fallback absolute inset-0 items-center justify-center bg-gray-200" style={{ display: 'none' }}>
              <div className="text-center text-gray-500">
                <Play className={`${size === 'small' ? 'h-8 w-8' : 'h-12 w-12'} mx-auto mb-2`} />
                <span className={`${size === 'small' ? 'text-xs' : 'text-sm'}`}>Video unavailable</span>
              </div>
            </div>

            {/* Click to Play Overlay for small size or when no controls */}
            {size === 'small' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 rounded-full p-1">
                  <Play className="h-3 w-3 text-white" />
                </div>
              </div>
            )}

            {/* Click to Play Overlay for large size without controls */}
            {size === 'large' && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/10 hover:bg-black/20 transition-colors"
                onClick={(e) => {
                  const container = e.currentTarget.closest('.relative');
                  const video = container?.querySelector('video') as HTMLVideoElement;

                  if (video) {
                    console.log('PropertyDetail play button clicked for video:', currentMedia);

                    if (video.paused) {
                      video.play().then(() => {
                        console.log('PropertyDetail video started playing successfully');
                      }).catch((error) => {
                        console.error('Failed to play PropertyDetail video:', error);

                        // For Microsoft services, try opening in new tab as fallback
                        if (currentMedia && (currentMedia.includes('1drv.ms') || currentMedia.includes('sharepoint.com'))) {
                          console.log('Opening Microsoft video in new tab:', currentMedia);
                          window.open(currentMedia, '_blank');
                          return;
                        }

                        // Show fallback on play error
                        const fallbackDiv = container?.querySelector('.video-fallback');
                        if (fallbackDiv && fallbackDiv.classList) {
                          fallbackDiv.classList.remove('hidden');
                          e.currentTarget.classList.add('hidden');
                        }
                      });
                    } else {
                      video.pause();
                      console.log('PropertyDetail video paused');
                    }
                  } else {
                    console.error('PropertyDetail video element not found for click handler');
                  }
                }}
              >
                <div className="bg-black/60 rounded-full p-4 hover:bg-black/70 transition-colors">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <img
            src={currentMedia}
            alt={room.name}
            className="w-full h-full object-cover cursor-pointer"
            onError={(e) => {
              e.currentTarget.src = size === 'small' 
                ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA5NiA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQ4IiB5PSI0NSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Q0E5QjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'
                : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDQwMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzlDQTlCNCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
            }}
          />
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className={`absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 ${
                size === 'small' ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                prevRoomImage(room.id, images.length);
              }}
            >
              <ChevronLeft className={`${size === 'small' ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 ${
                size === 'small' ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                nextRoomImage(room.id, images.length);
              }}
            >
              <ChevronRight className={`${size === 'small' ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </Button>
          </>
        )}

        {/* Media Counter */}
        {images.length > 1 && (
          <div className={`absolute ${size === 'small' ? 'bottom-1 right-1' : 'bottom-2 right-2'}`}>
            <Badge variant="secondary" className={`bg-black/70 text-white ${size === 'small' ? 'text-xs px-1 py-0' : 'text-xs'}`}>
              {currentIndex + 1}/{images.length}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CFE7F8]/20 via-white to-[#92AAD1]/10 overflow-x-hidden">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#749DD0]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#92AAD1]/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Hero Section - Modern Immersive Design */}
      <motion.section 
        className="relative min-h-[85vh] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Background Image/Video */}
        <div className="absolute inset-0">
          {(() => {
            const media = getPropertyMedia(property);
            const currentMedia = media[selectedImageIndex] || media[0] || '';
            const posterImage = media.find(m => !isVideo(m)) || '/images/default-property.jpg';
            
            return isVideo(currentMedia) ? (
              <video
                key={selectedImageIndex}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={posterImage}
                onError={(e) => {
                  console.error('Hero video failed to load:', currentMedia);
                  const target = e.target as HTMLVideoElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.video-fallback') as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              >
                <source src={currentMedia} type="video/mp4" />
                <source src={currentMedia} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <motion.img
                src={currentMedia || '/images/default-property.jpg'}
                alt={property.name}
                className="w-full h-full object-cover"
                key={selectedImageIndex}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
              />
            );
          })()}
          {/* Video Fallback */}
          <div className="video-fallback absolute inset-0 bg-[#33343B]" style={{ display: 'none' }}>
            <img
              src={getPropertyMedia(property).find(m => !isVideo(m)) || '/images/default-property.jpg'}
              alt={property.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#33343B] via-[#33343B]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#33343B]/60 via-transparent to-transparent" />
        </div>
        
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <Link 
                to="/collections" 
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
              >
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </div>
                <span className="hidden sm:inline">Back to Properties</span>
              </Link>
              
              <div className="flex items-center gap-3">
                <button className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white">
                  <Heart className="h-5 w-5" />
                </button>
                <button className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors text-white">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Image Navigation */}
        {getPropertyMedia(property).length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-30 bg-white/10 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 border border-white/20"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-30 bg-white/10 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 border border-white/20"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="grid lg:grid-cols-3 gap-8 items-end">
              {/* Property Info */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className="bg-[#749DD0]/80 backdrop-blur-sm text-white border-0 px-4 py-1.5 rounded-full">
                      <Waves className="w-4 h-4 mr-2" />
                      {property.type?.charAt(0).toUpperCase() + property.type?.slice(1) || 'Beach Resort'}
                    </Badge>
                    <Badge className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-4 py-1.5 rounded-full">
                      <MapPin className="w-4 h-4 mr-2" />
                      {property.location}
                    </Badge>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    {property.name}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-6 text-white/80">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-5 h-5 ${i < Math.floor(property.rating || 4.5) ? 'fill-amber-400 text-amber-400' : 'text-white/30'}`} />
                        ))}
                      </div>
                      <span className="font-medium">{property.rating || '4.9'}</span>
                      <span className="text-white/50">({property.reviews || 120} reviews)</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Quick Booking Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="hidden lg:block"
              >
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                  <div className="text-center mb-4">
                    <div className="text-white/60 text-sm">Starting from</div>
                    <div className="text-3xl font-bold text-white">
                      ${property.basePricePerNight || property.rooms?.[0]?.price || 299}
                      <span className="text-lg font-normal text-white/60">/night</span>
                    </div>
                  </div>
                  <Link to={`/book?property=${property.id}`} className="block">
                    <Button className="w-full bg-white text-[#33343B] hover:bg-[#CFE7F8] rounded-full py-6 font-semibold text-lg">
                      Book Your Stay
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
          {getPropertyMedia(property).slice(0, 7).map((media, i) => (
            <button
              key={i}
              onClick={() => setSelectedImageIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === selectedImageIndex ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60 w-2'
              } ${isVideo(media) ? 'bg-red-500/80' : ''}`}
              aria-label={`Go to ${isVideo(media) ? 'video' : 'image'} ${i + 1}`}
            />
          ))}
        </div>
      </motion.section>

      {/* Property Info Section */}
      <section className="relative py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Description */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-[#749DD0] to-transparent" />
                <Badge className="bg-[#749DD0]/10 text-[#749DD0] border border-[#749DD0]/20 px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  About This Property
                </Badge>
                <div className="h-px flex-1 bg-gradient-to-l from-[#749DD0] to-transparent" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-[#33343B] mb-6">
                Welcome to {property.name}
              </h2>
              
              <p className="text-lg text-[#48547C]/80 leading-relaxed mb-8">
                {property.description || 'Experience unparalleled luxury along the stunning Kenyan coast. Our exclusive beach resort combines pristine white sand beaches with world-class hospitality, offering you an unforgettable coastal escape. Each moment is carefully crafted to immerse you in the natural beauty of the Indian Ocean while providing the comfort and elegance you deserve.'}
              </p>

              {/* Property Highlights */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Bed, label: `${property.rooms?.length || 10} Rooms`, color: 'from-[#749DD0] to-[#92AAD1]' },
                  { icon: Users, label: 'Up to 4 Guests', color: 'from-[#92AAD1] to-[#CFE7F8]' },
                  { icon: Waves, label: 'Beachfront', color: 'from-[#CFE7F8] to-[#749DD0]' },
                  { icon: Star, label: `${property.rating || 4.9} Rating`, color: 'from-[#48547C] to-[#749DD0]' }
                ].map((item, i) => (
                  <div key={i} className="bg-[#CFE7F8]/20 rounded-2xl p-4 text-center group hover:bg-[#CFE7F8]/30 transition-colors">
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-[#33343B]">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Amenities Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-[#33343B] to-[#48547C] rounded-3xl p-8 text-white sticky top-24">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#CFE7F8]" />
                  Resort Amenities
                </h3>
                
                <div className="space-y-4">
                  {[
                    { icon: Wifi, label: 'Free High-Speed WiFi' },
                    { icon: UtensilsCrossed, label: 'Beachfront Restaurant' },
                    { icon: Bath, label: 'Spa & Wellness Center' },
                    { icon: Sun, label: 'Infinity Pool' },
                    { icon: Car, label: 'Airport Transfers' },
                    { icon: Coffee, label: '24/7 Room Service' }
                  ].map((amenity, i) => (
                    <div key={i} className="flex items-center gap-3 text-white/80">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                        <amenity.icon className="h-5 w-5 text-[#CFE7F8]" />
                      </div>
                      <span>{amenity.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/20">
                  <Link to={`/book?property=${property.id}`} className="block">
                    <Button className="w-full bg-white text-[#33343B] hover:bg-[#CFE7F8] rounded-full py-6 font-semibold">
                      Check Availability
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery & Explore Section */}
      <section className="py-20 bg-gradient-to-b from-white to-[#CFE7F8]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Badge className="bg-[#749DD0]/10 text-[#749DD0] border border-[#749DD0]/20 px-6 py-2 text-sm mb-6 rounded-full">
              <Eye className="w-4 h-4 inline mr-2" />
              Explore More
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-[#33343B] mb-4">
              Discover {property.name}
            </h2>
            <p className="text-[#48547C]/70 max-w-2xl mx-auto">
              Take a visual journey through our stunning beachfront property
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { 
                title: 'Photo Gallery', 
                icon: ImageIcon, 
                action: 'gallery', 
                description: 'Explore stunning photography capturing our luxury beach resort and the breathtaking coastal views that await you.',
                gradient: 'from-[#749DD0] to-[#48547C]'
              },
              { 
                title: 'Our Rooms & Suites', 
                icon: Bed, 
                action: 'rooms', 
                description: 'Discover beautifully appointed accommodations with ocean views, private balconies, and modern amenities.',
                gradient: 'from-[#92AAD1] to-[#749DD0]'
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                className="group relative aspect-[4/3] overflow-hidden cursor-pointer rounded-3xl shadow-xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  if (item.action === 'rooms') {
                    document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' });
                  } else if (item.action === 'gallery') {
                    window.location.href = 'https://thebeachcollection.pixieset.com/';
                  }
                }}
              >
                {(() => {
                  const media = getPropertyMedia(property);
                  // Filter to get only images for thumbnails in this section
                  const images = media.filter(m => !isVideo(m));
                  const imgSrc = images[index % (images.length || 1)] || media[0] || '/images/default-property.jpg';
                  return (
                    <img 
                      src={imgSrc} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  );
                })()}
                <div className="absolute inset-0 bg-gradient-to-t from-[#33343B]/90 via-[#33343B]/30 to-transparent" />
                
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-xl group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-white/70 leading-relaxed max-w-md">
                    {item.description}
                  </p>
                  <div className="mt-4 flex items-center text-[#CFE7F8] font-medium group-hover:gap-3 gap-2 transition-all">
                    <span>Explore</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms-section" className="py-24 bg-gradient-to-br from-[#33343B] via-[#48547C] to-[#33343B] relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#749DD0]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#92AAD1]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <Waves className="absolute bottom-20 left-20 h-48 w-48 text-white/5" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="bg-white/10 text-white border border-white/20 px-6 py-2 text-sm mb-6 rounded-full">
              <Bed className="w-4 h-4 inline mr-2" />
              Accommodations
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Rooms & Suites
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Each room offers stunning ocean views, luxury amenities, and the perfect blend of comfort and coastal elegance
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {groupedRooms.slice(0, 6).map((roomGroup, index) => (
              <motion.div
                key={roomGroup.sampleRoomId}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:border-[#749DD0]/50 transition-all duration-500 hover:shadow-2xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Room Image */}
                <div className="relative h-64 overflow-hidden">
                  {roomGroup.images && roomGroup.images.length > 0 ? (
                    <div className="h-full">
                      <RoomImageCarousel 
                        room={{
                          id: roomGroup.sampleRoomId,
                          name: roomGroup.name,
                          description: roomGroup.description,
                          type: roomGroup.type,
                          maxGuests: roomGroup.maxGuests,
                          price: roomGroup.price,
                          available: roomGroup.availableCount > 0,
                          amenities: roomGroup.amenities,
                          images: roomGroup.images
                        }} 
                        size="large" 
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#749DD0]/20 to-[#92AAD1]/10 flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-white/20" />
                    </div>
                  )}
                  
                  {/* Overlay Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {roomGroup.availableCount > 0 ? (
                      <Badge className="bg-emerald-500/90 backdrop-blur-sm text-white border-0">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Available
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/90 backdrop-blur-sm text-white border-0">
                        <XCircle className="w-3 h-3 mr-1" />
                        Fully Booked
                      </Badge>
                    )}
                  </div>
                  
                  {/* View Details Link */}
                  <Link
                    to={`/property/${(property as any).slug || slugify(property.name)}/room/${roomGroup.sampleRoomSlug || slugify(roomGroup.name)}`}
                    className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 border border-white/20"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                </div>

                {/* Room Info */}
                <div className="p-6">
                  <div className="mb-4">
                    <Badge className="bg-[#749DD0]/20 text-[#CFE7F8] border-0 text-xs mb-2">
                      {roomGroup.type}
                    </Badge>
                    <h3 className="text-2xl font-bold text-white mb-2">{roomGroup.name}</h3>
                    <p className="text-white/60 text-sm line-clamp-2">
                      {roomGroup.description || 'Luxurious accommodation with stunning ocean views and premium amenities.'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <Users className="w-4 h-4 text-[#CFE7F8]" />
                      <span>Up to {roomGroup.maxGuests} guests</span>
                    </div>
                    {roomGroup.availableCount > 0 && (
                      <div className="text-emerald-400 text-sm font-medium">
                        {roomGroup.availableCount} available
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <span className="text-3xl font-bold text-white">${roomGroup.price}</span>
                      <span className="text-white/50 text-sm ml-1">/night</span>
                    </div>
                    <Link 
                      to={`/book?property=${property.id}&room=${roomGroup.sampleRoomId}`}
                      className="block"
                    >
                      <Button 
                        className="bg-white text-[#33343B] hover:bg-[#CFE7F8] rounded-full px-6"
                        disabled={roomGroup.availableCount === 0}
                      >
                        {roomGroup.availableCount > 0 ? 'Book Now' : 'Unavailable'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {groupedRooms.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bed className="h-10 w-10 text-white/40" />
              </div>
              <p className="text-white/60 text-lg">Room information coming soon</p>
            </div>
          )}

          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link to={`/book?property=${property.id}`}>
              <Button className="bg-gradient-to-r from-[#749DD0] to-[#92AAD1] hover:from-[#92AAD1] hover:to-[#749DD0] text-white px-10 py-7 text-lg rounded-full font-semibold shadow-xl">
                <Calendar className="mr-2 h-5 w-5" />
                Book Your Stay
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Contact & Footer Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#CFE7F8]/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-[#749DD0]/10 text-[#749DD0] border border-[#749DD0]/20 px-4 py-2 rounded-full mb-6">
                <Phone className="w-4 h-4 mr-2" />
                Get in Touch
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-[#33343B] mb-6">
                Ready for Your Coastal Escape?
              </h2>
              <p className="text-[#48547C]/70 mb-8 leading-relaxed">
                Our team is here to help you plan the perfect beach getaway. Contact us for personalized recommendations and special offers.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-[#CFE7F8]/20 rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#749DD0] to-[#92AAD1] rounded-xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-[#48547C]/60">Location</div>
                    <div className="font-medium text-[#33343B]">{property.location}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-[#CFE7F8]/20 rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#92AAD1] to-[#CFE7F8] rounded-xl flex items-center justify-center">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-[#48547C]/60">Phone</div>
                    <div className="font-medium text-[#33343B]">+254 116 072343</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-[#CFE7F8]/20 rounded-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#CFE7F8] to-[#749DD0] rounded-xl flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-[#48547C]/60">Email</div>
                    <div className="font-medium text-[#33343B]">info@thebushcollection.africa</div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* CTA Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-[#33343B] via-[#48547C] to-[#33343B] rounded-3xl p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#749DD0]/20 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#92AAD1]/20 rounded-full blur-2xl" />
                
                <div className="relative">
                  <div className="w-20 h-20 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Waves className="h-10 w-10 text-[#CFE7F8]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Book Your Paradise Stay
                  </h3>
                  <p className="text-white/60 mb-8">
                    Experience the ultimate beach getaway at {property.name}
                  </p>
                  <Link to={`/book?property=${property.id}`}>
                    <Button className="w-full bg-white text-[#33343B] hover:bg-[#CFE7F8] rounded-full py-6 font-semibold text-lg">
                      Reserve Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Room Details Modal */}
      {roomDetailsOpen && selectedRoom && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#33343B]/95 backdrop-blur-sm overflow-y-auto"
          onClick={closeRoomDetails}
        >
          <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="max-w-6xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeRoomDetails}
                className="absolute top-6 right-6 z-50 bg-white/90 backdrop-blur-md hover:bg-white text-[#33343B] p-3 rounded-full transition-all duration-300 shadow-lg group"
                aria-label="Close"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* Hero Image Section with Carousel */}
              <div className="relative w-full h-[50vh] md:h-[60vh] bg-gradient-to-br from-[#33343B] to-[#48547C] flex items-center justify-center overflow-hidden">
                {selectedRoom.images && selectedRoom.images.length > 0 && (
                  <>
                    <motion.img
                      key={roomDetailImageIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      src={selectedRoom.images[roomDetailImageIndex]}
                      alt={selectedRoom.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                    
                    {/* Navigation arrows */}
                    {selectedRoom.images.length > 1 && (
                      <>
                        <button
                          onClick={prevRoomDetailImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-2xl transition-all duration-300 border border-white/20"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={nextRoomDetailImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-2xl transition-all duration-300 border border-white/20"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Image indicators */}
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                          {selectedRoom.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setRoomDetailImageIndex(idx)}
                              className={`h-2 rounded-full transition-all duration-300 ${
                                idx === roomDetailImageIndex ? 'bg-[#749DD0] w-8' : 'bg-white/50 w-2 hover:bg-white/70'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Property branding overlay */}
                    <div className="absolute top-6 left-6">
                      <Badge className="bg-gradient-to-r from-[#749DD0] to-[#92AAD1] text-white px-4 py-2 rounded-full font-semibold border-0 shadow-lg">
                        <Waves className="w-4 h-4 mr-2" />
                        {property.name}
                      </Badge>
                    </div>
                    
                    {/* Room name overlay */}
                    <div className="absolute bottom-20 left-6 md:left-10">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <p className="text-[#CFE7F8] font-medium mb-2">{selectedRoom.type}</p>
                        <h2 className="text-3xl md:text-5xl font-bold text-white">{selectedRoom.name}</h2>
                      </motion.div>
                    </div>
                  </>
                )}
              </div>

              {/* Room Details Section */}
              <div className="p-6 md:p-10 lg:p-12 bg-gradient-to-b from-white to-[#CFE7F8]/10">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 -mt-16 relative z-10 mb-10">
                  <div className="bg-white rounded-2xl p-5 shadow-xl border border-[#CFE7F8]/50 text-center">
                    <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[#749DD0] to-[#92AAD1] rounded-xl flex items-center justify-center mb-3">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-[#33343B]">{selectedRoom.maxGuests}</div>
                    <div className="text-sm text-[#48547C]/60">Max Guests</div>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-xl border border-[#CFE7F8]/50 text-center">
                    <div className="w-12 h-12 mx-auto bg-gradient-to-br from-[#92AAD1] to-[#CFE7F8] rounded-xl flex items-center justify-center mb-3">
                      <Bed className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-[#33343B]">{selectedRoom.type}</div>
                    <div className="text-sm text-[#48547C]/60">Room Type</div>
                  </div>
                  <div className="bg-gradient-to-br from-[#749DD0] to-[#48547C] rounded-2xl p-5 shadow-xl text-center">
                    <div className="text-3xl font-bold text-white">${selectedRoom.price}</div>
                    <div className="text-sm text-white/70">per night</div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-10 text-center max-w-3xl mx-auto">
                  <h3 className="text-xl font-semibold text-[#33343B] mb-4">About This Room</h3>
                  <p className="text-[#48547C]/70 leading-relaxed">
                    {selectedRoom.description || 'Experience the perfect blend of coastal elegance and modern comfort. This beautifully appointed room offers stunning views and premium amenities for an unforgettable beach getaway.'}
                  </p>
                </div>

                {/* Thumbnail Gallery */}
                {selectedRoom.images && selectedRoom.images.length > 1 && (
                  <div className="flex gap-3 mb-10 overflow-x-auto pb-2 justify-center">
                    {selectedRoom.images.slice(0, 5).map((img, idx) => (
                      <button 
                        key={idx}
                        className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden transition-all duration-300 ${
                          idx === roomDetailImageIndex 
                            ? 'ring-3 ring-[#749DD0] ring-offset-2 scale-105' 
                            : 'opacity-60 hover:opacity-100'
                        }`}
                        onClick={() => setRoomDetailImageIndex(idx)}
                      >
                        <img src={img} alt={`${selectedRoom.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Room Features/Amenities */}
                <div className="bg-[#CFE7F8]/20 rounded-3xl p-8 mb-10">
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#749DD0]" />
                    <h3 className="text-xl font-bold text-[#33343B]">
                      Room Amenities & Inclusions
                    </h3>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#749DD0]" />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                    {selectedRoom.amenities && selectedRoom.amenities.length > 0 ? (
                      selectedRoom.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white/80 p-3 rounded-xl">
                          <div className="w-2 h-2 bg-gradient-to-r from-[#749DD0] to-[#92AAD1] rounded-full flex-shrink-0"></div>
                          <span className="text-[#48547C] text-sm">{amenity}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        {['Beach Access', 'Ocean View', 'Private Bathroom', 'Air Conditioning', 'Mini Bar', 'Room Service', 'Free WiFi', 'Luxury Linens'].map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-white/80 p-3 rounded-xl">
                            <div className="w-2 h-2 bg-gradient-to-r from-[#749DD0] to-[#92AAD1] rounded-full flex-shrink-0"></div>
                            <span className="text-[#48547C] text-sm">{amenity}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Booking CTA */}
                <div className="text-center">
                  <Link to={`/book?property=${property.id}&room=${selectedRoom.id}`}>
                    <Button 
                      className="bg-gradient-to-r from-[#749DD0] to-[#48547C] hover:from-[#48547C] hover:to-[#33343B] text-white px-12 py-6 text-lg rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group"
                    >
                      <span>Reserve This Room</span>
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <p className="text-[#48547C]/50 text-sm mt-4">
                    Instant confirmation • Free cancellation up to 24 hours
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}