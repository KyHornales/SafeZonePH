import React, { useState } from 'react';
import { 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  Flag,
  User,
  Clock,
  Check
} from 'lucide-react';

interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Date;
  helpful: number;
  tags: string[];
}

interface ReviewSystemProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onSubmitReview: (rating: number, comment: string, tags: string[]) => void;
  onMarkHelpful: (reviewId: string) => void;
  onReportReview: (reviewId: string) => void;
  canReview?: boolean;
  className?: string;
}

const REVIEW_TAGS = [
  'Punctual',
  'Friendly',
  'Helpful',
  'Reliable',
  'Great communicator',
  'Made me feel safe',
  'Would recommend',
  'Professional',
];

const ReviewSystem: React.FC<ReviewSystemProps> = ({
  reviews,
  averageRating,
  totalReviews,
  onSubmitReview,
  onMarkHelpful,
  onReportReview,
  canReview = true,
  className = '',
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (newRating === 0) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSubmitReview(newRating, newComment, selectedTags);
    setShowReviewForm(false);
    setNewRating(0);
    setNewComment('');
    setSelectedTags([]);
    setIsSubmitting(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => Math.round(r.rating) === stars).length,
    percentage: totalReviews > 0 
      ? (reviews.filter(r => Math.round(r.rating) === stars).length / totalReviews) * 100 
      : 0,
  }));

  return (
    <div className={className}>
      {/* Rating Summary */}
      <div className="card p-4 sm:p-6 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-deep-slate">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-0.5 my-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= averageRating 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-deep-slate/60">{totalReviews} reviews</div>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 w-full space-y-1">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <div key={stars} className="flex items-center gap-2 text-sm">
                <span className="w-3 text-deep-slate/60">{stars}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-deep-slate/60">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review Button */}
        {canReview && !showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="btn btn-primary w-full mt-4 justify-center"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="card p-4 sm:p-6 mb-4">
          <h3 className="font-semibold text-deep-slate mb-4">Write Your Review</h3>

          {/* Star Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-deep-slate mb-2">
              Your Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || newRating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
              {newRating > 0 && (
                <span className="ml-2 text-sm text-deep-slate/60">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][newRating]}
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-deep-slate mb-2">
              What did you like? (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {REVIEW_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-deep-slate hover:bg-gray-200'
                  }`}
                >
                  {selectedTags.includes(tag) && <Check className="w-3 h-3 inline mr-1" />}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-deep-slate mb-2">
              Your Review (optional)
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="input-field min-h-[100px]"
              placeholder="Share your experience..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowReviewForm(false)}
              className="btn btn-outline flex-1 justify-center"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={newRating === 0 || isSubmitting}
              className="btn btn-primary flex-1 justify-center"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="card p-8 text-center">
            <MessageSquare className="w-12 h-12 text-deep-slate/20 mx-auto mb-3" />
            <h3 className="font-semibold text-deep-slate mb-1">No reviews yet</h3>
            <p className="text-sm text-deep-slate/60">Be the first to leave a review!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="card p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {review.reviewerAvatar ? (
                      <img src={review.reviewerAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-deep-slate">{review.reviewerName}</p>
                    <div className="flex items-center gap-2 text-sm text-deep-slate/60">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= review.rating 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onReportReview(review.id)}
                  className="p-1 text-deep-slate/40 hover:text-deep-slate"
                >
                  <Flag className="w-4 h-4" />
                </button>
              </div>

              {/* Tags */}
              {review.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {review.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Comment */}
              {review.comment && (
                <p className="text-sm text-deep-slate/70 mb-3">{review.comment}</p>
              )}

              {/* Helpful */}
              <button
                onClick={() => onMarkHelpful(review.id)}
                className="flex items-center gap-1 text-sm text-deep-slate/60 hover:text-primary"
              >
                <ThumbsUp className="w-4 h-4" />
                Helpful ({review.helpful})
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;
