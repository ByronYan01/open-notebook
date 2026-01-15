'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Button } from '@/components/ui/button'
import { AlertTriangle, ExternalLink } from 'lucide-react'

interface EmbeddingModelChangeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  oldModelName?: string
  newModelName?: string
}

export function EmbeddingModelChangeDialog({
  open,
  onOpenChange,
  onConfirm,
  oldModelName,
  newModelName
}: EmbeddingModelChangeDialogProps) {
  const t = useTranslations('models.embeddingChangeDialog')
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirmAndRebuild = () => {
    setIsConfirming(true)
    onConfirm()
    // Give a moment for the model to update, then redirect
    setTimeout(() => {
      router.push('/advanced')
      onOpenChange(false)
      setIsConfirming(false)
    }, 500)
  }

  const handleConfirmOnly = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <AlertDialogTitle>{t('title')}</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-base text-muted-foreground">
              <p>
                {t('description')}
                {oldModelName && newModelName && (
                  <>
                    {t('fromTo', {
                      from: <strong>{oldModelName}</strong>,
                      to: <strong>{newModelName}</strong>
                    })}
                  </>
                )}
                .
              </p>

              <div className="bg-muted p-4 rounded-md space-y-2">
                <p className="font-semibold text-foreground">{t('warning.title')}</p>
                <p className="text-sm">
                  {t('warning.message')}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">{t('whatNext.title')}:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{t('whatNext.points.update')}</li>
                  <li>{t('whatNext.points.unchanged')}</li>
                  <li>{t('whatNext.points.newContent')}</li>
                  <li>{t('whatNext.points.rebuildSoon')}</li>
                </ul>
              </div>

              <p className="text-sm font-medium text-foreground">
                {t('proceedQuestion')}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel disabled={isConfirming}>
            {t('buttons.cancel')}
          </AlertDialogCancel>
          <Button
            variant="outline"
            onClick={handleConfirmOnly}
            disabled={isConfirming}
          >
            {t('buttons.changeOnly')}
          </Button>
          <AlertDialogAction
            onClick={handleConfirmAndRebuild}
            disabled={isConfirming}
            className="bg-primary"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {t('buttons.changeAndRebuild')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
