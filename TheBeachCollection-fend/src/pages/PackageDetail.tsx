import { useState, useEffect } from 'react';
import slugify from '@/lib/slugify';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin, Users, Clock, Calendar, ArrowLeft, Check, X, ChevronLeft, ChevronRight, Image as ImageIcon, Building2 } from 'lucide-react';
import { useBackendPackages } from '@/hooks/useBackendPackages';
import { Package } from '@/types/package';
import PackageItinerary from '@/components/PackageItinerary';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';

export default function PackageDetail() {
  const { id } = useParams<{ id: string }>();
  const { packages, loading, getPackageById } = useBackendPackages();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadPackage = async () => {
      console.log('PackageDetail - ID:', id, 'Packages:', packages.length);
      if (id && packages.length > 0) {
        // try local lookup by id or slug first
        const local = packages.find(p => p.id === id || (p as any).slug === id || slugify(p.name) === id);
        if (local) {
          setSelectedPackage(local);
          return;
        }
        const pkg = await getPackageById(id);
        console.log('Found package:', pkg);
        setSelectedPackage(pkg || null);
      }
    };
    loadPackage();
  }, [id, packages, getPackageById]);

  if (loading || packages.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#CFE7F8] rounded-2xl mb-6 animate-pulse">
              <Clock className="h-8 w-8 text-[#749DD0]" />
            </div>
            <h1 className="text-2xl font-bold text-[#33343B] mb-4">Loading package...</h1>
            <p className="text-[#AAA59F]">Please wait while we load the package details.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPackage) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-6">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-[#33343B] mb-4">Package not found</h1>
            <p className="text-[#AAA59F] mb-4">
              Looking for package ID: {id}
            </p>
            <p className="text-[#AAA59F] mb-6">
              Available packages: {packages.map(p => p.id).join(', ')}
            </p>
            <Link to="/packages">
              <Button className="bg-[#749DD0] hover:bg-[#48547C] text-white rounded-full px-8">
                Browse Packages
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Wildlife Safari':
        return 'bg-[#CFE7F8] text-[#48547C]';
      case 'Adventure Safari':
        return 'bg-orange-100 text-orange-700';
      case 'Luxury Safari':
        return 'bg-purple-100 text-purple-700';
      case 'Water Safari':
        return 'bg-[#92AAD1] text-white';
      case 'Desert Safari':
        return 'bg-amber-100 text-amber-700';
      case 'Walking Safari':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-[#CFE7F8] text-[#48547C]';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'moderate':
        return 'bg-amber-100 text-amber-700';
      case 'challenging':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-[#CFE7F8] text-[#48547C]';
    }
  };
  
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % selectedPackage.gallery.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + selectedPackage.gallery.length) % selectedPackage.gallery.length);
  };

  const isVideo = (url: string) => {
    if (!url || typeof url !== 'string') return false;
    const lower = url.toLowerCase();
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.wmv'];
    if (videoExtensions.some(ext => lower.includes(ext))) return true;
    const videoHosts = ['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'];
    if (videoHosts.some(h => lower.includes(h))) return true;
    const videoIndicators = ['/video/', '.video.', 'videoplayback', 'video=true', '1drv.ms', 'sharepoint.com', 'onedrive.live.com'];
    if (videoIndicators.some(ind => lower.includes(ind))) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#CFE7F8] rounded-full opacity-30 blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-[#92AAD1] rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/packages">
            <Button variant="outline" size="sm" className="rounded-full border-[#749DD0] text-[#749DD0] hover:bg-[#749DD0] hover:text-white transition-all duration-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Packages
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-[450px]">
                  {selectedPackage.gallery.length > 0 ? (
                    <div className="relative h-full overflow-hidden">
                      {isVideo(selectedPackage.gallery[currentImageIndex]) ? (
                        <video
                          src={selectedPackage.gallery[currentImageIndex]}
                          className="w-full h-full object-cover"
                          controls
                          muted
                          loop
                        />
                      ) : (
                        <img
                          src={selectedPackage.gallery[currentImageIndex]}
                          alt={selectedPackage.name}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Navigation Arrows */}
                      {selectedPackage.gallery.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md text-white hover:bg-white/40 h-12 w-12 rounded-full p-0"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-md text-white hover:bg-white/40 h-12 w-12 rounded-full p-0"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                        </>
                      )}

                      {/* Image Counter */}
                      {selectedPackage.gallery.length > 1 && (
                        <div className="absolute bottom-4 left-4">
                          <Badge className="bg-white/20 backdrop-blur-md text-white border-0 rounded-full px-4">
                            {currentImageIndex + 1} / {selectedPackage.gallery.length}
                          </Badge>
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className={`${getCategoryColor(selectedPackage.category)} rounded-full px-4`}>
                          {selectedPackage.category}
                        </Badge>
                        {selectedPackage.featured && (
                          <Badge className="bg-[#749DD0] text-white rounded-full px-4">
                            ⭐ Featured
                          </Badge>
                        )}
                      </div>

                      <div className="absolute top-4 right-4">
                        <Badge className={`${getDifficultyColor(selectedPackage.difficulty)} rounded-full px-4`}>
                          {capitalizeFirst(selectedPackage.difficulty)}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#749DD0] to-[#48547C] flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {selectedPackage.gallery.length > 1 && (
                  <div className="p-6 bg-[#CFE7F8]/20">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {selectedPackage.gallery.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-300 ${
                            currentImageIndex === index 
                              ? 'border-[#749DD0] ring-2 ring-[#749DD0] ring-offset-2' 
                              : 'border-transparent hover:border-[#92AAD1]'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${selectedPackage.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Package Overview */}
            <Card className="border-0 shadow-lg rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#CFE7F8]/30 to-transparent pb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold text-[#33343B] mb-4">
                      {selectedPackage.name}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#AAA59F] mb-6">
                      <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                        <Clock className="h-4 w-4 mr-2 text-[#749DD0]" />
                        <span>{selectedPackage.duration}</span>
                      </div>
                      <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                        <Users className="h-4 w-4 mr-2 text-[#749DD0]" />
                        <span>{selectedPackage.groupSize}</span>
                      </div>
                      <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                        <MapPin className="h-4 w-4 mr-2 text-[#749DD0]" />
                        <span>{selectedPackage.location}</span>
                      </div>
                    </div>
                    {selectedPackage.description && (
                      <p className="text-[#AAA59F] leading-relaxed">
                        {selectedPackage.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center bg-[#CFE7F8] px-4 py-2 rounded-full">
                      <Star className="h-5 w-5 text-[#f59e0b] mr-2" />
                      <span className="text-lg font-bold text-[#33343B]">{selectedPackage.rating}</span>
                      <span className="text-sm text-[#AAA59F] ml-2">
                        ({selectedPackage.reviews})
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Destinations */}
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center text-[#33343B]">
                  <div className="w-10 h-10 bg-[#CFE7F8] rounded-xl flex items-center justify-center mr-3">
                    <MapPin className="h-5 w-5 text-[#749DD0]" />
                  </div>
                  Destinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {selectedPackage.destinations.map((destination, index) => (
                    <Badge key={index} className="bg-[#CFE7F8] text-[#48547C] border-0 rounded-full px-4 py-2 text-sm">
                      {destination}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Package Highlights */}
            <Card className="border-0 shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center text-[#33343B]">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  Package Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPackage.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center text-sm bg-[#CFE7F8]/30 p-4 rounded-xl">
                      <Check className="h-5 w-5 text-[#749DD0] mr-3 flex-shrink-0" />
                      <span className="text-[#33343B]">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Itinerary Button & Modal */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="my-4 w-full md:w-auto bg-[#749DD0] hover:bg-[#48547C] text-white rounded-full px-8 py-6 text-lg transition-all duration-300">
                  <Calendar className="h-5 w-5 mr-2" />
                  View Detailed Itinerary
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto rounded-3xl">
                <PackageItinerary
                  itinerary={selectedPackage.itinerary || []}
                  packageName={selectedPackage.name}
                />
              </DialogContent>
            </Dialog>

            {/* Includes & What's Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center text-[#33343B]">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    What's Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {selectedPackage.includes.map((item, index) => (
                      <li key={index} className="flex items-start bg-green-50 p-3 rounded-xl">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-[#33343B]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {selectedPackage.excludes && selectedPackage.excludes.length > 0 && (
                <Card className="border-0 shadow-lg rounded-3xl">
                  <CardHeader>
                    <CardTitle className="flex items-center text-[#33343B]">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3">
                        <X className="h-5 w-5 text-red-600" />
                      </div>
                      What's Not Included
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {selectedPackage.excludes.map((item, index) => (
                        <li key={index} className="flex items-start bg-red-50 p-3 rounded-xl">
                          <X className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-[#33343B]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#749DD0] to-[#48547C] text-white">
                <CardTitle className="text-xl">Book This Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Price */}
                <div className="text-center py-4">
                  {selectedPackage.originalPrice && selectedPackage.originalPrice > selectedPackage.price && (
                    <div className="text-lg text-[#AAA59F] line-through mb-1">
                      ${selectedPackage.originalPrice.toLocaleString()}
                    </div>
                  )}
                  <div className="text-4xl font-bold text-[#749DD0] mb-1">
                    ${selectedPackage.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-[#AAA59F]">per person</div>
                  {selectedPackage.originalPrice && selectedPackage.originalPrice > selectedPackage.price && (
                    <Badge className="mt-3 bg-green-500 text-white border-0 rounded-full px-4">
                      Save ${(selectedPackage.originalPrice - selectedPackage.price).toLocaleString()}
                    </Badge>
                  )}
                </div>

                <Separator className="bg-[#CFE7F8]" />

                {/* Package Details */}
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center p-3 bg-[#CFE7F8]/30 rounded-xl">
                    <span className="text-[#AAA59F]">Duration:</span>
                    <span className="font-medium text-[#33343B]">{selectedPackage.duration}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#CFE7F8]/30 rounded-xl">
                    <span className="text-[#AAA59F]">Max Guests:</span>
                    <span className="font-medium text-[#33343B]">{selectedPackage.maxGuests} people</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#CFE7F8]/30 rounded-xl">
                    <span className="text-[#AAA59F]">Difficulty:</span>
                    <Badge className={`${getDifficultyColor(selectedPackage.difficulty)} rounded-full`}>
                      {capitalizeFirst(selectedPackage.difficulty)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#CFE7F8]/30 rounded-xl">
                    <span className="text-[#AAA59F]">Rating:</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-[#f59e0b] mr-1" />
                      <span className="font-medium text-[#33343B]">{selectedPackage.rating}</span>
                    </div>
                  </div>
                  {selectedPackage.bestTime && (
                    <div className="flex justify-between items-center p-3 bg-[#CFE7F8]/30 rounded-xl">
                      <span className="text-[#AAA59F]">Best Time:</span>
                      <span className="font-medium text-[#33343B]">{selectedPackage.bestTime}</span>
                    </div>
                  )}
                </div>

                <Separator className="bg-[#CFE7F8]" />

                {/* Booking Buttons */}
                <div className="space-y-3">
                  <Link to={`/book?package=${selectedPackage.id}`}>
                    <Button className="w-full bg-[#749DD0] hover:bg-[#48547C] text-white text-lg py-6 rounded-full transition-all duration-300 hover:shadow-xl">
                      Book Now
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="outline" className="w-full border-2 border-[#749DD0] text-[#749DD0] hover:bg-[#749DD0] hover:text-white rounded-full transition-all duration-300">
                      Contact for Custom Quote
                    </Button>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="text-center text-xs text-[#AAA59F] space-y-2 pt-4">
                  <p className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Free cancellation up to 48 hours
                  </p>
                  <p className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    Secure payment processing
                  </p>
                  <p className="flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    24/7 customer support
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#33343B] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#92AAD1]">Package Details</h3>
              <p className="text-[#AAA59F] mb-4">
                Creating unforgettable safari experiences across Africa's most spectacular destinations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-[#92AAD1]">Quick Links</h4>
              <ul className="space-y-3 text-[#AAA59F]">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/collections" className="hover:text-white transition-colors">Properties</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/packages" className="hover:text-white transition-colors">Safari Packages</Link></li>
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
            <p>&copy; 2024 The Bush Collection. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}