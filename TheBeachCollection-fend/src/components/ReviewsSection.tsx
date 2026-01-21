import { useState } from 'react';
import { useReviews } from '@/hooks/useReviews';
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Star, Quote, MessageSquarePlus, TrendingUp, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';

// Minimal local Review type (supabase-types removed)
type Review = {
  id?: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  created_at?: string;
  is_featured?: boolean;
  users?: { full_name?: string | null; email?: string } | null;
};

export default function ReviewsSection() {
  const { reviews, loading, error } = useReviews(); // Fetch all approved reviews
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-[#33343B] to-[#48547C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Guest Reviews
            </h2>
            <p className="text-xl text-white/80">
              What our guests say about their safari experiences
            </p>
          </div>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-[#92AAD1] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white/70">Loading reviews...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-[#33343B] to-[#48547C]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Guest Reviews
            </h2>
            <p className="text-xl text-white/80">
              What our guests say about their safari experiences
            </p>
          </div>
          <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-3xl">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <MessageSquarePlus className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-300 mb-2 font-medium">Unable to load reviews</p>
            <p className="text-white/60 text-sm">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Filter for featured reviews or show first few
  const featuredReviews = reviews.filter(review => review.is_featured);
  const displayReviews = (featuredReviews.length > 0 ? featuredReviews : reviews).slice(0, 6);
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';
  
  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => Math.round(r.rating) === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => Math.round(r.rating) === rating).length / reviews.length) * 100 
      : 0
  }));

  const closeDialog = () => setIsDialogOpen(false);

  return (
    <section className="py-20 bg-gradient-to-b from-[#33343B] to-[#48547C] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#749DD0]/20 backdrop-blur-sm rounded-full mb-6">
            <Quote className="w-4 h-4 text-[#92AAD1]" />
            <span className="text-[#92AAD1] font-medium text-sm">Testimonials</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What Our Guests Say
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Real experiences from travelers who've discovered the magic of African safaris with us
          </p>
        </motion.div>

        {/* Stats Cards */}
        {reviews.length > 0 && (
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          >
            {/* Average Rating Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Star className="w-8 h-8 text-white fill-white" />
              </div>
              <p className="text-5xl font-bold text-white mb-2">{averageRating}</p>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`} 
                  />
                ))}
              </div>
              <p className="text-white/60 text-sm">Average Rating</p>
            </div>

            {/* Total Reviews Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#749DD0] to-[#48547C] rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <p className="text-5xl font-bold text-white mb-2">{reviews.length}</p>
              <p className="text-white/60 text-sm">Verified Reviews</p>
            </div>

            {/* Recommendation Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <p className="text-5xl font-bold text-white mb-2">
                {reviews.length > 0 ? Math.round((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100) : 0}%
              </p>
              <p className="text-white/60 text-sm">Would Recommend</p>
            </div>
          </motion.div>
        )}

        {/* Rating Distribution */}
        {reviews.length > 0 && (
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 mb-16"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#92AAD1]" />
              Rating Distribution
            </h3>
            <div className="space-y-3">
              {ratingCounts.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-white font-medium">{rating}</span>
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.1 * (5 - rating) }}
                      className="h-full bg-gradient-to-r from-[#749DD0] to-[#92AAD1] rounded-full"
                    />
                  </div>
                  <span className="text-white/60 text-sm w-16 text-right">{count} reviews</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Share Experience Button */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mb-12"
        >
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-white hover:bg-[#CFE7F8] text-[#33343B] font-semibold px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
              >
                <MessageSquarePlus className="w-5 h-5" />
                Share Your Experience
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-white rounded-3xl border-0">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#33343B]">Share Your Safari Experience</DialogTitle>
                <DialogDescription className="text-[#48547C]">
                  Tell future travelers about your adventure. Your feedback helps us improve our safaris.
                </DialogDescription>
              </DialogHeader>
              <ReviewForm
                onSuccess={closeDialog}
                onCancel={closeDialog}
              />
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Reviews Grid */}
        {displayReviews.length > 0 ? (
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {displayReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <ReviewCard
                  review={review}
                  showUser={true}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-16 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-[#749DD0]/20 rounded-full flex items-center justify-center">
              <MessageSquarePlus className="w-10 h-10 text-[#92AAD1]" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Reviews Yet</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Be the first to share your safari experience and help others discover the magic of African wildlife!
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#749DD0] hover:bg-[#48547C] text-white rounded-full px-8">
                  Write the First Review
                </Button>
              </DialogTrigger>
            </Dialog>
          </motion.div>
        )}

        {/* View All Reviews */}
        {reviews.length > 6 && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-white/60 mb-4">
              Showing {displayReviews.length} of {reviews.length} reviews
            </p>
            <Button 
              variant="outline" 
              className="border-2 border-[#92AAD1] text-[#92AAD1] hover:bg-[#92AAD1] hover:text-white rounded-full px-8 transition-all"
            >
              View All Reviews →
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}