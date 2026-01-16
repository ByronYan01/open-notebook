'use client'

import { useTranslations } from 'next-intl'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  confirmVariant?: 'default' | 'destructive'
  onConfirm: () => void
  isLoading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  confirmVariant = 'default',
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const t = useTranslations('components.confirmDialog')
  const defaultConfirmText = confirmVariant === 'destructive'
    ? t('delete')
    : t('confirm')

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={confirmVariant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {confirmText || defaultConfirmText}
              </>
            ) : (
              confirmText || defaultConfirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}