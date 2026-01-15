'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckboxList } from '@/components/ui/checkbox-list'
import { useNotebooks } from '@/lib/hooks/use-notebooks'
import { useCreateNote } from '@/lib/hooks/use-notes'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface SaveToNotebooksDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question: string
  answer: string
}

export function SaveToNotebooksDialog({
  open,
  onOpenChange,
  question,
  answer
}: SaveToNotebooksDialogProps) {
  const t = useTranslations('search.saveToNotebooksDialog')
  const [selectedNotebooks, setSelectedNotebooks] = useState<string[]>([])
  const { data: notebooks, isLoading } = useNotebooks(false) // false = not archived
  const createNote = useCreateNote()

  const handleToggle = (notebookId: string) => {
    setSelectedNotebooks(prev =>
      prev.includes(notebookId)
        ? prev.filter(id => id !== notebookId)
        : [...prev, notebookId]
    )
  }

  const handleSave = async () => {
    if (selectedNotebooks.length === 0) {
      toast.error(t('errors.selectAtLeastOne'))
      return
    }

    try {
      // Create note in each selected notebook
      for (const notebookId of selectedNotebooks) {
        await createNote.mutateAsync({
          title: question,
          content: answer,
          note_type: 'ai',
          notebook_id: notebookId
        })
      }

      toast.success(t('success', { count: selectedNotebooks.length }))
      setSelectedNotebooks([])
      onOpenChange(false)
    } catch {
      toast.error(t('errors.saveFailed'))
    }
  }

  const notebookItems = notebooks?.map(nb => ({
    id: nb.id,
    title: nb.name,
    description: nb.description || undefined
  })) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <CheckboxList
              items={notebookItems}
              selectedIds={selectedNotebooks}
              onToggle={handleToggle}
              emptyMessage={t('emptyMessage')}
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedNotebooks.length === 0 || createNote.isPending}
          >
            {createNote.isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                {t('saving')}
              </>
            ) : (
              t('saveButton', { count: selectedNotebooks.length })
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
