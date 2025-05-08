'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
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

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  type?: 'warning' | 'success' | 'error';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  type = 'warning',
}: ConfirmationModalProps) {
  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <div className="flex items-center gap-3">
            {type === 'success' ? (
              <CheckCircle className="h-6 w-6" style={{ color: COLORS.success }} />
            ) : type === 'error' ? (
              <XCircle className="h-6 w-6" style={{ color: COLORS.error }} />
            ) : (
              <AlertTriangle className="h-6 w-6" style={{ color: COLORS.warning }} />
            )}
            <ModalTitle
              style={{
                color: type === 'success' ? COLORS.success : type === 'error' ? COLORS.error : COLORS.warning,
                fontFamily: FONTS.bold
              }}
            >
              {title}
            </ModalTitle>
          </div>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>
        <ModalFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
            style={{
              borderColor: COLORS.lightgray,
              color: COLORS.gray,
              fontFamily: FONTS.regular
            }}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            style={{
              backgroundColor: type === 'success' ? COLORS.success : type === 'error' ? COLORS.error : COLORS.warning,
              color: COLORS.white,
              fontFamily: FONTS.semibold
            }}
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}