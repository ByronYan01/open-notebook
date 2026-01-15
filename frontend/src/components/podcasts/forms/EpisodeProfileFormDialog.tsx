'use client'

import { useCallback, useEffect, useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'

import { EpisodeProfile, SpeakerProfile } from '@/lib/types/podcasts'
import {
  useCreateEpisodeProfile,
  useUpdateEpisodeProfile,
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

const episodeProfileSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  speaker_config: z.string(),
  outline_provider: z.string(),
  outline_model: z.string(),
  transcript_provider: z.string(),
  transcript_model: z.string(),
  default_briefing: z.string(),
  num_segments: z.number(),
})

export type EpisodeProfileFormValues = z.infer<typeof episodeProfileSchema>

interface EpisodeProfileFormDialogProps {
  mode: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  speakerProfiles: SpeakerProfile[]
  modelOptions: Record<string, string[]>
  initialData?: EpisodeProfile
}

export function EpisodeProfileFormDialog({
  mode,
  open,
  onOpenChange,
  speakerProfiles,
  modelOptions,
  initialData,
}: EpisodeProfileFormDialogProps) {
  const t = useTranslations('podcasts.forms.episodeProfile')
  const tErrors = useTranslations('podcasts.forms.episodeProfile.errors')

  const createProfile = useCreateEpisodeProfile()
  const updateProfile = useUpdateEpisodeProfile()

  const providers = useMemo(() => Object.keys(modelOptions), [modelOptions])

  const getDefaults = useCallback((): EpisodeProfileFormValues => {
    const firstSpeaker = speakerProfiles[0]?.name ?? ''
    const firstProvider = providers[0] ?? ''
    const firstModel = firstProvider ? modelOptions[firstProvider]?.[0] ?? '' : ''

    if (initialData) {
      return {
        name: initialData.name,
        description: initialData.description ?? '',
        speaker_config: initialData.speaker_config,
        outline_provider: initialData.outline_provider,
        outline_model: initialData.outline_model,
        transcript_provider: initialData.transcript_provider,
        transcript_model: initialData.transcript_model,
        default_briefing: initialData.default_briefing,
        num_segments: initialData.num_segments,
      }
    }

    return {
      name: '',
      description: '',
      speaker_config: firstSpeaker,
      outline_provider: firstProvider,
      outline_model: firstModel,
      transcript_provider: firstProvider,
      transcript_model: firstModel,
      default_briefing: '',
      num_segments: 5,
    }
  }, [initialData, modelOptions, providers, speakerProfiles])

  const validationSchema = useMemo(
    () =>
      episodeProfileSchema.superRefine((data, ctx) => {
        // 验证 name
        if (!data.name || data.name.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('nameRequired'),
            path: ['name'],
          })
        }

        // 验证 speaker_config
        if (!data.speaker_config || data.speaker_config.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('speakerProfileRequired'),
            path: ['speaker_config'],
          })
        }

        // 验证 outline_provider
        if (!data.outline_provider || data.outline_provider.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('outlineProviderRequired'),
            path: ['outline_provider'],
          })
        }

        // 验证 outline_model
        if (!data.outline_model || data.outline_model.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('outlineModelRequired'),
            path: ['outline_model'],
          })
        }

        // 验证 transcript_provider
        if (!data.transcript_provider || data.transcript_provider.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('transcriptProviderRequired'),
            path: ['transcript_provider'],
          })
        }

        // 验证 transcript_model
        if (!data.transcript_model || data.transcript_model.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('transcriptModelRequired'),
            path: ['transcript_model'],
          })
        }

        // 验证 default_briefing
        if (!data.default_briefing || data.default_briefing.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('defaultBriefingRequired'),
            path: ['default_briefing'],
          })
        }

        // 验证 num_segments
        if (!Number.isInteger(data.num_segments)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('segmentsInteger'),
            path: ['num_segments'],
          })
        } else if (data.num_segments < 3) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('segmentsMin'),
            path: ['num_segments'],
          })
        } else if (data.num_segments > 20) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: tErrors('segmentsMax'),
            path: ['num_segments'],
          })
        }
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
  } = useForm<EpisodeProfileFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: getDefaults(),
  })

  const outlineProvider = watch('outline_provider')
  const outlineModel = watch('outline_model')
  const transcriptProvider = watch('transcript_provider')
  const transcriptModel = watch('transcript_model')
  const availableOutlineModels = modelOptions[outlineProvider] ?? []
  const availableTranscriptModels = modelOptions[transcriptProvider] ?? []

  useEffect(() => {
    if (!open) {
      return
    }
    reset(getDefaults())
  }, [open, reset, getDefaults, tErrors])

  useEffect(() => {
    if (!outlineProvider) {
      return
    }
    const models = modelOptions[outlineProvider] ?? []
    if (models.length === 0) {
      setValue('outline_model', '')
      return
    }
    if (!models.includes(outlineModel)) {
      setValue('outline_model', models[0])
    }
  }, [outlineProvider, outlineModel, modelOptions, setValue, tErrors])

  useEffect(() => {
    if (!transcriptProvider) {
      return
    }
    const models = modelOptions[transcriptProvider] ?? []
    if (models.length === 0) {
      setValue('transcript_model', '')
      return
    }
    if (!models.includes(transcriptModel)) {
      setValue('transcript_model', models[0])
    }
  }, [transcriptProvider, transcriptModel, modelOptions, setValue, tErrors])

  const onSubmit = async (values: EpisodeProfileFormValues) => {
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
  const disableSubmit =
    isSubmitting || speakerProfiles.length === 0 || providers.length === 0
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

        {speakerProfiles.length === 0 ? (
          <Alert className="bg-amber-50 text-amber-900">
            <AlertTitle>{t('alerts.noSpeakerProfiles.title')}</AlertTitle>
            <AlertDescription>
              {t('alerts.noSpeakerProfiles.description')}
            </AlertDescription>
          </Alert>
        ) : null}

        {providers.length === 0 ? (
          <Alert className="bg-amber-50 text-amber-900">
            <AlertTitle>{t('alerts.noLanguageModels.title')}</AlertTitle>
            <AlertDescription>
              {t('alerts.noLanguageModels.description')}
            </AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-2">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t('fields.name.label')}</Label>
              <Input id="name" placeholder={t('fields.name.placeholder')} {...register('name')} />
              {errors.name ? (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="num_segments">{t('fields.segments.label')}</Label>
              <Input
                id="num_segments"
                type="number"
                min={3}
                max={20}
                {...register('num_segments', { valueAsNumber: true })}
              />
              {errors.num_segments ? (
                <p className="text-xs text-red-600">{errors.num_segments.message}</p>
              ) : null}
            </div>

            <div className="md:col-span-2 space-y-2">
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
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t('sections.speakerConfig')}
              </h3>
              <Separator className="mt-2" />
            </div>
            <Controller
              control={control}
              name="speaker_config"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>{t('fields.speakerProfile.label')}</Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('fields.speakerProfile.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {speakerProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.name}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.speaker_config ? (
                    <p className="text-xs text-red-600">
                      {errors.speaker_config.message}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t('sections.outlineGeneration')}
              </h3>
              <Separator className="mt-2" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="outline_provider"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>{t('fields.outlineProvider.label')}</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('fields.outlineProvider.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            <span className="capitalize">{provider}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.outline_provider ? (
                      <p className="text-xs text-red-600">
                        {errors.outline_provider.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="outline_model"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>{t('fields.outlineModel.label')}</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('fields.outlineModel.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableOutlineModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.outline_model ? (
                      <p className="text-xs text-red-600">
                        {errors.outline_model.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t('sections.transcriptGeneration')}
              </h3>
              <Separator className="mt-2" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                control={control}
                name="transcript_provider"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>{t('fields.transcriptProvider.label')}</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('fields.transcriptProvider.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            <span className="capitalize">{provider}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.transcript_provider ? (
                      <p className="text-xs text-red-600">
                        {errors.transcript_provider.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="transcript_model"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>{t('fields.transcriptModel.label')}</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('fields.transcriptModel.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTranscriptModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.transcript_model ? (
                      <p className="text-xs text-red-600">
                        {errors.transcript_model.message}
                      </p>
                    ) : null}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default_briefing">{t('fields.defaultBriefing.label')}</Label>
            <Textarea
              id="default_briefing"
              rows={6}
              placeholder={t('fields.defaultBriefing.placeholder')}
              {...register('default_briefing')}
            />
            {errors.default_briefing ? (
              <p className="text-xs text-red-600">
                {errors.default_briefing.message}
              </p>
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
