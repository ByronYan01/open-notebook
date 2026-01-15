'use client'

import { useCallback, useMemo, useState } from 'react'
import { AlertCircle, Loader2, RefreshCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { useDeletePodcastEpisode, usePodcastEpisodes } from '@/lib/hooks/use-podcasts'
import { EpisodeCard } from '@/components/podcasts/EpisodeCard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { GeneratePodcastDialog } from '@/components/podcasts/GeneratePodcastDialog'

type StatusOrderItem = {
  key: 'running' | 'completed' | 'failed' | 'pending'
  title: string
  description?: string
}

function SummaryBadge({ label, value }: { label: string; value: number }) {
  return (
    <Badge variant="outline" className="font-medium">
      <span className="text-muted-foreground mr-1.5">{label}</span>
      <span className="text-foreground">{value}</span>
    </Badge>
  )
}

export function EpisodesTab() {
  const t = useTranslations('podcasts.episodesTab')
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const {
    episodes,
    statusGroups,
    statusCounts,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = usePodcastEpisodes()
  const deleteEpisode = useDeletePodcastEpisode()

  const STATUS_ORDER: StatusOrderItem[] = useMemo(
    () => [
      {
        key: 'running',
        title: t('statusGroups.running.title'),
        description: t('statusGroups.running.description'),
      },
      {
        key: 'pending',
        title: t('statusGroups.pending.title'),
        description: t('statusGroups.pending.description'),
      },
      {
        key: 'completed',
        title: t('statusGroups.completed.title'),
        description: t('statusGroups.completed.description'),
      },
      {
        key: 'failed',
        title: t('statusGroups.failed.title'),
        description: t('statusGroups.failed.description'),
      },
    ],
    [t]
  )

  const handleRefresh = useCallback(() => {
    void refetch()
  }, [refetch])

  const handleDelete = useCallback(
    (episodeId: string) => deleteEpisode.mutateAsync(episodeId),
    [deleteEpisode]
  )

  const emptyState = !isLoading && episodes.length === 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowGenerateDialog(true)}>
            {t('generateButton')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
          >
            {isFetching ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="mr-2 h-4 w-4" />
            )}
            {t('refreshButton')}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <SummaryBadge label={t('summaryBadges.total')} value={statusCounts.total} />
        <SummaryBadge label={t('summaryBadges.processing')} value={statusCounts.running} />
        <SummaryBadge label={t('summaryBadges.completed')} value={statusCounts.completed} />
        <SummaryBadge label={t('summaryBadges.failed')} value={statusCounts.failed} />
        <SummaryBadge label={t('summaryBadges.pending')} value={statusCounts.pending} />
      </div>

      {isError ? (
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
      ) : null}

      {emptyState ? (
        <div className="rounded-lg border border-dashed bg-muted/30 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {t('emptyState')}
          </p>
        </div>
      ) : null}

      {STATUS_ORDER.map(({ key, title, description }) => {
        const data = statusGroups[key]
        if (!data || data.length === 0) {
          return null
        }

        return (
          <section key={key} className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold leading-tight">{title}</h3>
              {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            <Separator />
            <div className="space-y-4">
              {data.map((episode) => (
                <EpisodeCard
                  key={episode.id}
                  episode={episode}
                  onDelete={handleDelete}
                  deleting={deleteEpisode.isPending}
                />
              ))}
            </div>
          </section>
        )
      })}

      <GeneratePodcastDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
      />
    </div>
  )
}
