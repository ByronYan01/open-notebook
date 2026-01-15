'use client'

import { useMemo } from 'react'
import { AlertCircle, Lightbulb, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { EpisodeProfilesPanel } from '@/components/podcasts/EpisodeProfilesPanel'
import { SpeakerProfilesPanel } from '@/components/podcasts/SpeakerProfilesPanel'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useEpisodeProfiles, useSpeakerProfiles } from '@/lib/hooks/use-podcasts'
import { useModels } from '@/lib/hooks/use-models'
import { Model } from '@/lib/types/models'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

function modelsByProvider(models: Model[], type: Model['type']) {
  return models
    .filter((model) => model.type === type)
    .reduce<Record<string, string[]>>((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = []
      }
      acc[model.provider].push(model.name)
      return acc
    }, {})
}

export function TemplatesTab() {
  const t = useTranslations('podcasts.templatesTab')
  const {
    episodeProfiles,
    isLoading: loadingEpisodeProfiles,
    error: episodeProfilesError,
  } = useEpisodeProfiles()

  const {
    speakerProfiles,
    usage,
    isLoading: loadingSpeakerProfiles,
    error: speakerProfilesError,
  } = useSpeakerProfiles(episodeProfiles)

  const {
    data: models = [],
    isLoading: loadingModels,
    error: modelsError,
  } = useModels()

  const languageModelOptions = useMemo(
    () => modelsByProvider(models, 'language'),
    [models]
  )
  const ttsModelOptions = useMemo(
    () => modelsByProvider(models, 'text_to_speech'),
    [models]
  )

  const isLoading = loadingEpisodeProfiles || loadingSpeakerProfiles || loadingModels
  const hasError = episodeProfilesError || speakerProfilesError || modelsError

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem
          value="overview"
          className="overflow-hidden rounded-xl border border-border bg-muted/40 px-4"
        >
          <AccordionTrigger className="gap-2 py-4 text-left text-sm font-semibold">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              {t('overview.title')}
            </div>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            <div className="space-y-4">
              <p className="text-muted-foreground/90">
                {t('overview.introduction')}
              </p>

              <div className="space-y-2">
                <h4 className="font-medium text-foreground">{t('overview.episodeProfiles.title')}</h4>
                <ul className="list-disc space-y-1 pl-5">
                  <li>{t('overview.episodeProfiles.points.segments')}</li>
                  <li>{t('overview.episodeProfiles.points.models')}</li>
                  <li>{t('overview.episodeProfiles.points.briefings')}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-foreground">{t('overview.speakerProfiles.title')}</h4>
                <ul className="list-disc space-y-1 pl-5">
                  <li>{t('overview.speakerProfiles.points.tts')}</li>
                  <li>{t('overview.speakerProfiles.points.details')}</li>
                  <li>{t('overview.speakerProfiles.points.reuse')}</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-foreground">{t('overview.workflow.title')}</h4>
                <ol className="list-decimal space-y-1 pl-5">
                  <li>{t('overview.workflow.steps.createSpeakers')}</li>
                  <li>{t('overview.workflow.steps.buildEpisodes')}</li>
                  <li>{t('overview.workflow.steps.generate')}</li>
                </ol>
                <p className="text-xs text-muted-foreground/80">
                  {t('overview.workflow.note')}
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {hasError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('errors.loadFailed.title')}</AlertTitle>
          <AlertDescription>
            {t('errors.loadFailed.description')}
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('loading')}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <SpeakerProfilesPanel
            speakerProfiles={speakerProfiles}
            usage={usage}
            modelOptions={ttsModelOptions}
          />
          <EpisodeProfilesPanel
            episodeProfiles={episodeProfiles}
            speakerProfiles={speakerProfiles}
            modelOptions={languageModelOptions}
          />
        </div>
      )}
    </div>
  )
}
