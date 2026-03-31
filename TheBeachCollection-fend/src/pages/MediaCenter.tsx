import { useEffect, useState, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Play, Download, Eye, Calendar, Search, X, Image, Video, Sparkles, Filter, Grid3X3, LayoutGrid } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  date: string;
  category: string;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

const categories = ['all', 'Wildlife', 'Landscapes', 'Culture', 'Accommodations', 'Activities'];

// Category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  all: <Grid3X3 className="w-4 h-4" />,
  Wildlife: <span>🦁</span>,
  Landscapes: <span>🏞️</span>,
  Culture: <span>🎭</span>,
  Accommodations: <span>🏨</span>,
  Activities: <span>🎯</span>,
};

export default function MediaCenter() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'parallax' | 'grid'>('parallax');
  const [scrollY, setScrollY] = useState(0);
  const scrollRef = useRef<number>(0);
  const { toast } = useToast();

  // Track scroll position for parallax effect
  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY;
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Safely format a date string — returns a fallback when invalid
  const formatDateSafe = (dateStr?: string | null) => {
    if (!dateStr) return 'Unknown date';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Unknown date';
    try {
      return format(d, 'MMM d, yyyy');
    } catch (err) {
      return 'Unknown date';
    }
  };

  const fetchMediaItems = useCallback(async () => {
    try {
      setLoading(true);
      const params: { category?: string } = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      const res = await api.get('/media/media-center', { params });
      const raw = res.data || [];
      const items = (raw as Array<Record<string, unknown>>).map((it) => {
        const obj = it as Record<string, unknown>;
        const id = String(obj['_id'] ?? obj['id'] ?? '');
        const type = String(obj['type'] ?? 'image') as 'image' | 'video';
        const title = String(obj['title'] ?? '');
        const description = String(obj['description'] ?? '');
        const fileUrl = String(obj['fileUrl'] ?? obj['url'] ?? '');
        const thumbnail = String(obj['thumbnailUrl'] ?? obj['thumbnail'] ?? fileUrl ?? '');
        const date = String(obj['createdAt'] ?? obj['date'] ?? new Date().toISOString());
        const category = String(obj['category'] ?? '');
        const featured = Boolean(obj['featured'] ?? false);

        return {
          id,
          type,
          title,
          description,
          url: fileUrl,
          thumbnail,
          date,
          category,
          featured,
        } as MediaItem;
      });
      setMediaItems(items);
    } catch (error) {
      console.error('Error fetching media items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load media content. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, toast]);

  useEffect(() => {
    fetchMediaItems();
  }, [fetchMediaItems]);

  const handleMediaClick = (item: MediaItem) => {
    setSelectedMedia(item);
    setShowDialog(true);
  };

  // Determine how to render a video URL: iframe for embeds, <video> for direct files
  const getVideoEmbed = (url?: string) => {
    if (!url) return { kind: 'unknown' as const };
    const u = url.trim();

    // YouTube
    const ytMatch = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
    if (ytMatch) return { kind: 'iframe' as const, src: `https://www.youtube.com/embed/${ytMatch[1]}` };

    // Vimeo
    const vMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (vMatch) return { kind: 'iframe' as const, src: `https://player.vimeo.com/video/${vMatch[1]}` };

    // Facebook watch or videos
    if (/facebook\.com|fb\.watch/i.test(u)) {
      // Use Facebook video plugin which accepts the full URL as href
      const encoded = encodeURIComponent(u);
      return { kind: 'iframe' as const, src: `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=0` };
    }

    // Instagram post (p/ or reel/)
    const igMatch = u.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/i);
    if (igMatch) return { kind: 'iframe' as const, src: `https://www.instagram.com/p/${igMatch[1]}/embed` };

    // TikTok
    const ttMatch = u.match(/tiktok\.com\/(?:@[^/]+\/video\/)?(\d+)/i);
    if (ttMatch) return { kind: 'iframe' as const, src: `https://www.tiktok.com/embed/v2/${ttMatch[1]}` };

    // Direct video file
    if (/\.(mp4|webm|ogg|mov|mkv)(\?|$)/i.test(u)) {
      return { kind: 'video' as const, src: u };
    }

    // If already an embed URL or player URL, keep as iframe
    if (/embed|player\.vimeo|youtube\.com\/embed/i.test(u)) return { kind: 'iframe' as const, src: u };

    // Fallback: treat as iframe attempt
    return { kind: 'iframe' as const, src: u };
  };

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = title.replace(/\s+/g, '-').toLowerCase() + (url.endsWith('.mp4') ? '.mp4' : '.jpg');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading media:', error);
      toast({
        title: 'Error',
        description: 'Failed to download media. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Filter items by search query
  const filteredItems = mediaItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalImages = mediaItems.filter(i => i.type === 'image').length;
  const totalVideos = mediaItems.filter(i => i.type === 'video').length;
  const featuredCount = mediaItems.filter(i => i.featured).length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-[#33343B] via-[#33343B] to-[#48547C]"
    >
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#749DD0]/20 backdrop-blur-sm rounded-full mb-6">
              <Image className="w-4 h-4 text-[#92AAD1]" />
              <span className="text-[#92AAD1] font-medium text-sm">Gallery & Media</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Media <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#92AAD1] to-[#749DD0]">Center</span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12">
              Explore stunning visuals from our safari adventures, wildlife encounters, and breathtaking African landscapes
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-[#48547C]" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search photos, videos, locations..."
                  className="w-full pl-14 pr-14 py-5 bg-white/95 backdrop-blur-md rounded-2xl text-[#33343B] placeholder-[#48547C]/60 shadow-2xl shadow-black/20 focus:outline-none focus:ring-4 focus:ring-[#749DD0]/30 transition-all text-lg"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-5 flex items-center"
                  >
                    <X className="h-5 w-5 text-[#48547C] hover:text-[#33343B] transition-colors" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-3 gap-4 max-w-xl mx-auto mt-12"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10">
              <Image className="w-6 h-6 text-[#92AAD1] mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{totalImages}</p>
              <p className="text-xs text-white/60">Photos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10">
              <Video className="w-6 h-6 text-[#92AAD1] mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{totalVideos}</p>
              <p className="text-xs text-white/60">Videos</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10">
              <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{featuredCount}</p>
              <p className="text-xs text-white/60">Featured</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="sticky top-20 z-40 bg-[#33343B]/95 backdrop-blur-xl border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <Filter className="w-4 h-4 text-white/50 flex-shrink-0" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-[#749DD0] text-white shadow-lg shadow-[#749DD0]/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {categoryIcons[category]}
                  <span className="capitalize">{category}</span>
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-white/10 rounded-full p-1">
              <button
                onClick={() => setViewMode('parallax')}
                className={`p-2 rounded-full transition-all ${viewMode === 'parallax' ? 'bg-[#749DD0] text-white' : 'text-white/50 hover:text-white'}`}
                title="Parallax View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-[#749DD0] text-white' : 'text-white/50 hover:text-white'}`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Gallery */}
      <section className="max-w-[1600px] mx-auto px-4 py-12 overflow-hidden">
        {loading ? (
          // Modern Loading Skeleton — 4 columns
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 16 }).map((_, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-3xl overflow-hidden animate-pulse"
                style={{ height: `${200 + (index % 3) * 80}px` }}
              >
                <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5" />
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
              <Image className="w-12 h-12 text-white/30" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No media found</h3>
            <p className="text-white/60 mb-6">Try adjusting your search or filter criteria</p>
            <Button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="bg-[#749DD0] hover:bg-[#48547C] text-white rounded-full px-6"
            >
              Clear Filters
            </Button>
          </motion.div>
        ) : viewMode === 'parallax' ? (
          // ── Parallax Columns ──────────────────────────────────────────────
          // Columns 1 & 3 drift upward on scroll-down; columns 2 & 4 drift downward.
          (() => {
            const SPEED = 0.12; // tweak to taste
            const colCount = 4;
            // Distribute items into 4 columns (round-robin)
            const cols: MediaItem[][] = Array.from({ length: colCount }, () => []);
            filteredItems.forEach((item, i) => cols[i % colCount].push(item));

            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-start">
                {cols.map((col, colIdx) => {
                  // col 0 & 2 → scroll upward (negative offset), col 1 & 3 → scroll downward
                  const direction = colIdx % 2 === 0 ? -1 : 1;
                  const offset = scrollY * SPEED * direction;

                  return (
                    <div
                      key={colIdx}
                      style={{ transform: `translateY(${offset}px)`, willChange: 'transform', transition: 'transform 0.05s linear' }}
                      className="flex flex-col gap-4"
                    >
                      {col.map((item, idx) => (
                        <div
                          key={item.id}
                          className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white/5"
                          style={{ height: `${220 + (idx % 3) * 80}px` }}
                          onClick={() => handleMediaClick(item)}
                        >
                          {/* Image/Thumbnail */}
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                          {/* Type Badge */}
                          <div className="absolute top-3 left-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center backdrop-blur-md ${item.type === 'video' ? 'bg-red-500/80' : 'bg-white/20'}`}>
                              {item.type === 'video' ? (
                                <Play className="w-4 h-4 text-white fill-white" />
                              ) : (
                                <Image className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </div>

                          {/* Featured Badge */}
                          {item.featured && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white border-0 px-2 py-0.5 rounded-full flex items-center gap-1 text-xs">
                                <Sparkles className="w-3 h-3" />
                                Featured
                              </Badge>
                            </div>
                          )}

                          {/* Content Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            <Badge className="bg-[#749DD0]/80 text-white border-0 text-xs mb-1.5 rounded-full">
                              {item.category}
                            </Badge>
                            <h3 className="font-bold text-white text-sm mb-1 line-clamp-1">{item.title}</h3>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-xs text-white/60">
                                <Calendar className="w-3 h-3" />
                                {formatDateSafe(item.date)}
                              </div>
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleMediaClick(item); }}
                                  className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5 text-white" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDownload(item.url, item.title); }}
                                  className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5 text-white" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })()
        ) : (
          // ── Standard Grid ────────────────────────────────────────────────
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                  className="group relative rounded-3xl overflow-hidden cursor-pointer h-64"
                  onClick={() => handleMediaClick(item)}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute top-4 left-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md ${item.type === 'video' ? 'bg-red-500/80' : 'bg-white/20'}`}>
                      {item.type === 'video' ? <Play className="w-5 h-5 text-white fill-white" /> : <Image className="w-5 h-5 text-white" />}
                    </div>
                  </div>
                  {item.featured && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white border-0 px-3 py-1 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />Featured
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Badge className="bg-[#749DD0]/80 text-white border-0 text-xs mb-2 rounded-full">{item.category}</Badge>
                    <h3 className="font-bold text-white text-lg mb-1 line-clamp-1">{item.title}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-white/60">
                        <Calendar className="w-3 h-3" />{formatDateSafe(item.date)}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleMediaClick(item); }} className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-colors">
                          <Eye className="w-4 h-4 text-white" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDownload(item.url, item.title); }} className="w-9 h-9 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-colors">
                          <Download className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      {/* Preview Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        {selectedMedia && (
          <DialogContent className="max-w-5xl bg-[#33343B] border-[#48547C] p-0 overflow-hidden rounded-3xl">
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setShowDialog(false)}
                className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Media Content */}
              <div className="bg-black">
                {selectedMedia.type === 'video' ? (
                  (() => {
                    const embed = getVideoEmbed(selectedMedia.url);
                    if (embed.kind === 'iframe') {
                      return (
                        <div className="relative pt-[56.25%]">
                          <iframe
                            src={embed.src}
                            className="absolute top-0 left-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      );
                    } else if (embed.kind === 'video') {
                      return (
                        <video
                          controls
                          autoPlay
                          src={embed.src}
                          className="w-full max-h-[70vh] object-contain"
                        />
                      );
                    }
                    return null;
                  })()
                ) : (
                  <img
                    src={selectedMedia.url || selectedMedia.thumbnail}
                    alt={selectedMedia.title}
                    className="w-full max-h-[70vh] object-contain"
                  />
                )}
              </div>

              {/* Info Panel */}
              <div className="p-6 bg-[#33343B]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge className="bg-[#749DD0]/20 text-[#92AAD1] border-0 mb-3">
                      {selectedMedia.category}
                    </Badge>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedMedia.title}</h2>
                    <p className="text-white/70">{selectedMedia.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-white/50">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDateSafe(selectedMedia.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        {selectedMedia.type === 'video' ? <Video className="w-4 h-4" /> : <Image className="w-4 h-4" />}
                        {selectedMedia.type === 'video' ? 'Video' : 'Photo'}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(selectedMedia.url, selectedMedia.title)}
                    className="bg-[#749DD0] hover:bg-[#48547C] text-white rounded-full px-6 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </motion.div>
  );
}