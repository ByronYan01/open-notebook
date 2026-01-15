'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { CreateModelRequest, ProviderAvailability } from '@/lib/types/models'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useCreateModel } from '@/lib/hooks/use-models'
import { Plus } from 'lucide-react'

interface AddModelFormProps {
  modelType: 'language' | 'embedding' | 'text_to_speech' | 'speech_to_text'
  providers: ProviderAvailability
}

export function AddModelForm({ modelType, providers }: AddModelFormProps) {
  const t = useTranslations('models.addModel')
  const [open, setOpen] = useState(false)
  const createModel = useCreateModel()
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<CreateModelRequest>({
    defaultValues: {
      type: modelType
    }
  })

  // Get available providers that support this model type
  const availableProviders = providers.available.filter(provider =>
    providers.supported_types[provider]?.includes(modelType)
  )

  const onSubmit = async (data: CreateModelRequest) => {
    await createModel.mutateAsync(data)
    reset()
    setOpen(false)
  }

  const getTypeInfo = useMemo(() => {
    // Convert snake_case to camelCase: text_to_speech -> textToSpeech
    const nameKey = modelType.split('_')
      .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
    return {
      displayName: t(`types.${nameKey}`),
      placeholder: t(`placeholders.${nameKey}`)
    }
  }, [modelType, t])

  if (availableProviders.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        {t('noProviders', { type: getTypeInfo.displayName })}
      </div>
    )
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {t('button')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dialogTitle', { type: getTypeInfo.displayName })}</DialogTitle>
          <DialogDescription>
            {t('dialogDescription', { type: getTypeInfo.displayName })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="provider">{t('fields.provider.label')}</Label>
            <Select onValueChange={(value) => setValue('provider', value)} required>
              <SelectTrigger>
                <SelectValue placeholder={t('fields.provider.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {availableProviders.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    <span className="capitalize">{provider}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.provider && (
              <p className="text-sm text-destructive mt-1">{t('fields.provider.error')}</p>
            )}
          </div>

          <div>
            <Label htmlFor="name">{t('fields.name.label')}</Label>
            <Input
              id="name"
              {...register('name', { required: t('fields.name.error') })}
              placeholder={getTypeInfo.placeholder}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {modelType === 'language' && watch('provider') === 'azure' &&
                t('fields.azureHint')
              }
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('buttons.cancel')}
            </Button>
            <Button type="submit" disabled={createModel.isPending}>
              {createModel.isPending ? t('buttons.adding') : t('buttons.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}