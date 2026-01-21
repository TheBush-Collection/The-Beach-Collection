import { useState } from 'react';
import { Star, User, Calendar, Quote, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

interface ReviewCardProps {
  review: Review;
  showUser?: boolean;
}

// Character limit for truncation
const COMMENT_CHAR_LIMIT = 150;

export default function ReviewCard({ review, showUser = true }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const comment = review.comment || '';
  const shouldTruncate = comment.length > COMMENT_CHAR_LIMIT;
  const displayComment = isExpanded || !shouldTruncate 
    ? comment 
    : comment.slice(0, COMMENT_CHAR_LIMIT) + '...';

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 transition-colors ${
          index < rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate a consistent color based on name
  const getAvatarColor = (name: string | null) => {
    const colors = [
      'from-[#749DD0] to-[#48547C]',
      'from-[#92AAD1] to-[#749DD0]',
      'from-amber-400 to-amber-600',
      'from-emerald-400 to-emerald-600',
      'from-purple-400 to-purple-600',
      'from-rose-400 to-rose-600',
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const userName = review.users?.full_name || (review.users?.email ? review.users.email.split('@')[0] : 'Anonymous');

  return (
    <div className="group h-full bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#749DD0]/10 hover:-translate-y-1">
      {/* Quote Icon */}
      <div className="mb-4">
        <div className="w-10 h-10 bg-[#749DD0]/20 rounded-xl flex items-center justify-center group-hover:bg-[#749DD0]/30 transition-colors">
          <Quote className="w-5 h-5 text-[#92AAD1]" />
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-0.5">
          {renderStars(review.rating)}
        </div>
        <span className="text-sm font-semibold text-white bg-white/10 px-2 py-0.5 rounded-full">
          {review.rating}.0
        </span>
        {review.is_featured && (
          <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-white border-0 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <Award className="w-3 h-3" />
            Featured
          </Badge>
        )}
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-bold text-lg text-white mb-3 line-clamp-2">
          {review.title}
        </h4>
      )}

      {/* Comment */}
      {review.comment && (
        <div className="mb-6">
          <p className={`text-white/70 text-sm leading-relaxed ${!isExpanded && shouldTruncate ? '' : ''}`}>
            "{displayComment}"
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 flex items-center gap-1 text-[#92AAD1] hover:text-[#749DD0] text-sm font-medium transition-colors group/btn"
            >
              {isExpanded ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                </>
              ) : (
                <>
                  <span>Read More</span>
                  <ChevronDown className="w-4 h-4 group-hover/btn:translate-y-0.5 transition-transform" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Spacer to push footer to bottom */}
      <div className="flex-grow"></div>

      {/* User and Date */}
      {showUser && (
        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          {/* Avatar */}
          <div className={`w-11 h-11 bg-gradient-to-br ${getAvatarColor(userName)} rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20`}>
            {review.users?.full_name || review.users?.email ? (
              <span className="text-sm font-bold text-white">
                {getInitials(review.users?.full_name || (review.users?.email?.split('@')[0] ?? null))}
              </span>
            ) : (
              <User className="h-5 w-5 text-white" />
            )}
          </div>
          
          {/* Name and Date */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {userName}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(review.created_at || '')}</span>
            </div>
          </div>

          {/* Verified Badge */}
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center" title="Verified Review">
              <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
