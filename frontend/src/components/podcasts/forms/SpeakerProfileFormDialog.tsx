'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import type { FieldErrorsImpl } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SpeakerProfile } from '@/lib/types/podcasts'
import {
  useCreateSpeakerProfile,
  useUpdateSpeakerProfile,
} from '@/lib/hooks/use-podcasts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

const speakerConfigSchema = z.object({
  name: z.string(),
  voice_id: z.string(),
  backstory: z.string(),
  personality: z.string(),
})

const speakerProfileSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  tts_provider: z.string(),
  tts_model: z.string(),
  speakers: z.array(speakerConfigSchema),
})

export type SpeakerProfileFormValues = z.infer<typeof speakerProfileSchema>

interface SpeakerProfileFormDialogProps {
  mode: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  modelOptions: Record<string, string[]>
  initialData?: SpeakerProfile
}

const EMPTY_SPEAKER = {
  name: '',
  voice_id: '',
  backstory: '',
  personality: '',
}

export function SpeakerProfileFormDialog({
  mode,
  open,
  onOpenChange,
  modelOptions,
  initialData,
}: SpeakerProfileFormDialogProps) {
  const t = useTranslations('podcasts.forms.speakerProfile')
  const tErrors = useTranslations('podcasts.forms.speakerProfile.errors')

  const createProfile = useCreateSpeakerProfile()
  const updateProfile = useUpdateSpeakerProfile()

  const providers = useMemo(() => Object.keys(modelOptions), [modelOptions])

  const getDefaults = useCallback((): SpeakerProfileFormValues => {
    const firstProvider = providers[0] ?? ''
    const firstModel = firstProvider ? modelOptions[firstProvider]?.[0] ?? '' : ''

    if (initialData) {
      return {
        name: initialData.name,
        description: initialData.description ?? '',
        tts_provider: initialData.tts_provider,
        tts_model: initialData.tts_model,
        speakers: initialData.speakers?.map((speaker) => ({ ...speaker })) ?? [{ ...EMPTY_SPEAKER }],
      }
    }

    return {
      name: '',
      description: '',
      tts_provider: firstProvider,
      tts_model: firstModel,
      speakers: [{ ...EMPTY_SPEAKER }],
    }
  }, [initialData, modelOptions, providers])

  const validationSchema = useMemo(
    () =>
      speakerProfileSchema.superRefine((data, ctx) => {
        // 验证 name
        if (!data.name || data.name.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('nameRequired'),
            path: ['name'],
          })
        }

        // 验证 tts_provider
        if (!data.tts_provider || data.tts_provider.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('providerRequired'),
            path: ['tts_provider'],
          })
        }

        // 验证 tts_model
        if (!data.tts_model || data.tts_model.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('modelRequired'),
            path: ['tts_model'],
          })
        }

        // 验证 speakers 数量
        if (data.speakers.length < 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('atLeastOneSpeaker'),
            path: ['speakers'],
          })
        }
        if (data.speakers.length > 4) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('maxFourSpeakers'),
            path: ['speakers'],
          })
        }

        // 验证每个 speaker
        data.speakers.forEach((speaker, index) => {
          if (!speaker.name || speaker.name.trim().length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: tErrors('speakerNameRequired'),
              path: ['speakers', index, 'name'],
            })
          }
          if (!speaker.voice_id || speaker.voice_id.trim().length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: tErrors('voiceIdRequired'),
              path: ['speakers', index, 'voice_id'],
            })
          }
          if (!speaker.backstory || speaker.backstory.trim().length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: tErrors('backstoryRequired'),
              path: ['speakers', index, 'backstory'],
            })
          }
          if (!speaker.personality || speaker.personality.trim().length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: tErrors('personalityRequired'),
              path: ['speakers', index, 'personality'],
            })
          }
        })
      }),
    [tErrors]
  )

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SpeakerProfileFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: getDefaults(),
  })

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'speakers',
  })

  const provider = watch('tts_provider')
  const currentModel = watch('tts_model')
  const availableModels = useMemo(
    () => modelOptions[provider] ?? [],
    [modelOptions, provider]
  )

  const speakersArrayError = (
    errors.speakers as FieldErrorsImpl<{ root?: { message?: string } }> | undefined
  )?.root?.message

  useEffect(() => {
    if (!open) {
      return
    }
    reset(getDefaults())
  }, [open, reset, getDefaults, tErrors])

  useEffect(() => {
    if (!provider) {
      return
    }
    const models = modelOptions[provider] ?? []
    if (models.length === 0) {
      setValue('tts_model', '')
      return
    }
    if (!models.includes(currentModel)) {
      setValue('tts_model', models[0])
    }
  }, [provider, currentModel, modelOptions, setValue, tErrors])

  const onSubmit = async (values: SpeakerProfileFormValues) => {
    const payload = {
      ...values,
      description: values.description ?? '',
    }

    if (mode === 'create') {
      await createProfile.mutateAsync(payload)
    } else if (initialData) {
      await updateProfile.mutateAsync({
        profileId: initialData.id,
        payload,
      })
    }

    onOpenChange(false)
  }

  const isSubmitting = createProfile.isPending || updateProfile.isPending
  const disableSubmit = isSubmitting || providers.length === 0
  const isEdit = mode === 'edit'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('editTitle') : t('createTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        {providers.length === 0 ? (
          <Alert className="bg-amber-50 text-amber-900">
            <AlertTitle>{t('alerts.noTtsModels.title')}</AlertTitle>
            <AlertDescription>
              {t('alerts.noTtsModels.description')}
            </AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t('fields.profileName.label')}</Label>
              <Input id="name" placeholder={t('fields.profileName.placeholder')} {...register('name')} />
              {errors.name ? (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tts_provider">{t('fields.provider.label')}</Label>
              <Controller
                control={control}
                name="tts_provider"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('fields.provider.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((option) => (
                        <SelectItem key={option} value={option}>
                          <span className="capitalize">{option}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tts_provider ? (
                <p className="text-xs text-red-600">{errors.tts_provider.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tts_model">{t('fields.model.label')}</Label>
              <Controller
                control={control}
                name="tts_model"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('fields.model.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tts_model ? (
                <p className="text-xs text-red-600">{errors.tts_model.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('fields.description.label')}</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder={t('fields.description.placeholder')}
                {...register('description')}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('speakersSection.title')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t('speakersSection.description')}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ ...EMPTY_SPEAKER })}
                disabled={fields.length >= 4}
              >
                <Plus className="mr-2 h-4 w-4" /> {t('speakersSection.addSpeaker')}
              </Button>
            </div>
            <Separator />

            {fields.map((field, index) => (
              <div key={field.id} className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{t('speakersSection.speaker', { index: index + 1 })}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> {t('speakersSection.remove')}
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t('speakersFields.name.label')}</Label>
                    <Input
                      {...register(`speakers.${index}.name` as const)}
                      placeholder={t('speakersFields.name.placeholder')}
                    />
                    {errors.speakers?.[index]?.name ? (
                      <p className="text-xs text-red-600">
                        {errors.speakers[index]?.name?.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label>{t('speakersFields.voiceId.label')}</Label>
                    <Input
                      {...register(`speakers.${index}.voice_id` as const)}
                      placeholder={t('speakersFields.voiceId.placeholder')}
                    />
                    {errors.speakers?.[index]?.voice_id ? (
                      <p className="text-xs text-red-600">
                        {errors.speakers[index]?.voice_id?.message}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('speakersFields.backstory.label')}</Label>
                  <Textarea
                    rows={3}
                    placeholder={t('speakersFields.backstory.placeholder')}
                    {...register(`speakers.${index}.backstory` as const)}
                  />
                  {errors.speakers?.[index]?.backstory ? (
                    <p className="text-xs text-red-600">
                      {errors.speakers[index]?.backstory?.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>{t('speakersFields.personality.label')}</Label>
                  <Textarea
                    rows={3}
                    placeholder={t('speakersFields.personality.placeholder')}
                    {...register(`speakers.${index}.personality` as const)}
                  />
                  {errors.speakers?.[index]?.personality ? (
                    <p className="text-xs text-red-600">
                      {errors.speakers[index]?.personality?.message}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}

            {speakersArrayError ? (
              <p className="text-xs text-red-600">{speakersArrayError}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('buttons.cancel')}
            </Button>
            <Button type="submit" disabled={disableSubmit}>
              {isSubmitting
                ? isEdit
                  ? t('buttons.saving')
                  : t('buttons.creating')
                : isEdit
                  ? t('buttons.saveChanges')
                  : t('buttons.createProfile')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
