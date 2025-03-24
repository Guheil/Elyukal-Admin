'use client';

import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { COLORS } from '@/app/constants/colors';
import { FONTS } from '@/app/constants/fonts';
import { fetchProductReviews } from '@/app/api/reviewService';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from './modal';
import { Button } from './button';

interface Review {
  id: number;
  user_id: string;
  product_id: number;
  rating: number;
  review_text: string;
  created_at: string;
  full_name: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
}

export function ReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
}: ReviewModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const reviewsData = await fetchProductReviews(String(productId));
        setReviews(reviewsData);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError('Failed to load reviews. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [productId, isOpen]);

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={16}
        fill={index < rating ? COLORS.secondary : 'transparent'}
        stroke={COLORS.secondary}
        className={index < rating ? 'text-warning' : 'text-gray-300'}
      />
    ));
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <ModalHeader className="border-b pb-4">
          <ModalTitle 
            style={{ 
              color: COLORS.accent,
              fontFamily: FONTS.bold
            }}
          >
            Reviews for {productName}
          </ModalTitle>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex">
              {renderStars(Math.round(parseFloat(averageRating)))}
            </div>
            <span className="text-lg font-semibold" style={{ color: COLORS.secondary }}>
              {averageRating}
            </span>
            <span className="text-sm" style={{ color: COLORS.gray }}>
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </ModalHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-10 h-10 border-4 border-t-4 border-primary rounded-full animate-spin" 
                style={{ borderTopColor: COLORS.primary, borderColor: COLORS.lightgray }}>
              </div>
            </div>
          ) : error ? (
            <div className="text-center p-6" style={{ color: COLORS.secondary }}>
              <p>{error}</p>
              <Button 
                onClick={() => setLoading(true)}
                className="mt-4"
                style={{ backgroundColor: COLORS.accent, color: 'white' }}
              >
                Try Again
              </Button>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center p-6" style={{ color: COLORS.gray }}>
              <p>No reviews yet for this product.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold" style={{ color: COLORS.accent, fontFamily: FONTS.semibold }}>
                        {review.full_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm" style={{ color: COLORS.gray }}>
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mt-2" style={{ color: COLORS.gray }}>
                    {review.review_text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <ModalFooter className="border-t pt-4">
          <Button 
            onClick={onClose}
            style={{ 
              backgroundColor: COLORS.accent,
              color: 'white',
              fontFamily: FONTS.semibold
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}