// components/ConfirmationBox.tsx
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface ConfirmationBoxProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  cancelButtonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  showCancelButton?: boolean;
  allowCloseDuringAction?: boolean; // New prop to control this behavior
}

const ConfirmationBox: React.FC<ConfirmationBoxProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  loadingText = "Processing...",
  disabled = false,
  showCancelButton = true,
  allowCloseDuringAction = false, // Default: prevent closing during action
}) => {
  const handleCancel = () => {
    if (loading && !allowCloseDuringAction) {
      return; 
    }
    
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && loading && !allowCloseDuringAction) {
      return; 
    }
    onOpenChange(open);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {title}
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
            {loading && (
              <div className="mt-2 text-sm text-amber-600">
                Action in progress. Please wait...
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showCancelButton && (
            <AlertDialogCancel 
              onClick={handleCancel}
              disabled={loading || disabled}
            >
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading || disabled}
            className="flex items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? loadingText : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationBox;