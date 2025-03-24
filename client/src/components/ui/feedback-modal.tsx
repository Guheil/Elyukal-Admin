'use client';

import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { COLORS } from '@/app/constants/colors';
import { FONTS } from '@/app/constants/fonts';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from './modal';
import { Button } from './button';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  type: 'success' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

export function FeedbackModal({
  isOpen,
  onClose,
  title,
  description,
  type,
  actionLabel = 'OK',
  onAction,
}: FeedbackModalProps) {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <div className="flex items-center gap-3">
            {type === 'success' ? (
              <CheckCircle className="h-6 w-6" style={{ color: COLORS.success }} />
            ) : (
              <AlertCircle className="h-6 w-6" style={{ color: COLORS.error }} />
            )}
            <ModalTitle 
              style={{ 
                color: type === 'success' ? COLORS.success : COLORS.error,
                fontFamily: FONTS.bold
              }}
            >
              {title}
            </ModalTitle>
          </div>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button 
            onClick={handleAction}
            style={{ 
              backgroundColor: type === 'success' ? COLORS.success : COLORS.accent,
              color: COLORS.white,
              fontFamily: FONTS.semibold
            }}
          >
            {actionLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}