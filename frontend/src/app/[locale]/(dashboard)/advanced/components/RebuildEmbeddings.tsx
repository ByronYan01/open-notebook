'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Loader2, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { embeddingApi } from '@/lib/api/embedding'
import type { RebuildEmbeddingsRequest, RebuildStatusResponse } from '@/lib/api/embedding'

export function RebuildEmbeddings() {
  const t = useTranslations('advanced.rebuildEmbeddings')
  const [mode, setMode] = useState<'existing' | 'all'>('existing')
  const [includeSources, setIncludeSources] = useState(true)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [includeInsights, setIncludeInsights] = useState(true)
  const [commandId, setCommandId] = useState<string | null>(null)
  const [status, setStatus] = useState<RebuildStatusResponse | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // Rebuild mutation
  const rebuildMutation = useMutation({
    mutationFn: async (request: RebuildEmbeddingsRequest) => {
      return embeddingApi.rebuildEmbeddings(request)
    },
    onSuccess: (data) => {
      setCommandId(data.command_id)
      // Start polling for status
      startPolling(data.command_id)
    }
  })

  // Start polling for rebuild status
  const startPolling = (cmdId: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }

    const interval = setInterval(async () => {
      try {
        const statusData = await embeddingApi.getRebuildStatus(cmdId)
        setStatus(statusData)

        // Stop polling if completed or failed
        if (statusData.status === 'completed' || statusData.status === 'failed') {
          stopPolling()
        }
      } catch (error) {
        console.error('Failed to fetch rebuild status:', error)
      }
    }, 5000) // Poll every 5 seconds

    setPollingInterval(interval)
  }

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
  }, [pollingInterval])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  const handleStartRebuild = () => {
    const request: RebuildEmbeddingsRequest = {
      mode,
      include_sources: includeSources,
      include_notes: includeNotes,
      include_insights: includeInsights
    }

    rebuildMutation.mutate(request)
  }

  const handleReset = () => {
    stopPolling()
    setCommandId(null)
    setStatus(null)
    rebuildMutation.reset()
  }

  const isAnyTypeSelected = includeSources || includeNotes || includeInsights
  const isRebuildActive = commandId && status && (status.status === 'queued' || status.status === 'running')

  const progressData = status?.progress
  const stats = status?.stats

  const totalItems = progressData?.total_items ?? progressData?.total ?? 0
  const processedItems = progressData?.processed_items ?? progressData?.processed ?? 0
  const derivedProgressPercent = progressData?.percentage ?? (totalItems > 0 ? (processedItems / totalItems) * 100 : 0)
  const progressPercent = Number.isFinite(derivedProgressPercent) ? derivedProgressPercent : 0

  const sourcesProcessed = stats?.sources_processed ?? stats?.sources ?? 0
  const notesProcessed = stats?.notes_processed ?? stats?.notes ?? 0
  const insightsProcessed = stats?.insights_processed ?? stats?.insights ?? 0
  const failedItems = stats?.failed_items ?? stats?.failed ?? 0

  const computedDuration = status?.started_at && status?.completed_at
    ? (new Date(status.completed_at).getTime() - new Date(status.started_at).getTime()) / 1000
    : undefined
  const processingTimeSeconds = stats?.processing_time ?? computedDuration

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t('title')}
        </CardTitle>
        <CardDescription>
          {t('description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Form */}
        {!isRebuildActive && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="mode">{t('fields.mode.label')}</Label>
              <Select value={mode} onValueChange={(value) => setMode(value as 'existing' | 'all')}>
                <SelectTrigger id="mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="existing">{t('fields.mode.options.existing')}</SelectItem>
                  <SelectItem value="all">{t('fields.mode.options.all')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {mode === 'existing' ? t('fields.mode.hint.existing') : t('fields.mode.hint.all')}
              </p>
            </div>

            <div className="space-y-3">
              <Label>{t('fields.include.label')}</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sources"
                    checked={includeSources}
                    onCheckedChange={(checked) => setIncludeSources(checked === true)}
                  />
                  <Label htmlFor="sources" className="font-normal cursor-pointer">
                    {t('fields.include.options.sources')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="notes"
                    checked={includeNotes}
                    onCheckedChange={(checked) => setIncludeNotes(checked === true)}
                  />
                  <Label htmlFor="notes" className="font-normal cursor-pointer">
                    {t('fields.include.options.notes')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="insights"
                    checked={includeInsights}
                    onCheckedChange={(checked) => setIncludeInsights(checked === true)}
                  />
                  <Label htmlFor="insights" className="font-normal cursor-pointer">
                    {t('fields.include.options.insights')}
                  </Label>
                </div>
              </div>
              {!isAnyTypeSelected && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('fields.include.validation.required')}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Button
              onClick={handleStartRebuild}
              disabled={!isAnyTypeSelected || rebuildMutation.isPending}
              className="w-full"
            >
              {rebuildMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('buttons.starting')}
                </>
              ) : (
                t('buttons.start')
              )}
            </Button>

            {rebuildMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('errors.startFailed', { message: (rebuildMutation.error as Error)?.message || t('errors.unknown') })}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Status Display */}
        {status && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {status.status === 'queued' && <Clock className="h-5 w-5 text-yellow-500" />}
                {status.status === 'running' && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                {status.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {status.status === 'failed' && <XCircle className="h-5 w-5 text-red-500" />}
                <div className="flex flex-col">
                  <span className="font-medium">
                    {status.status === 'queued' && t('status.queued')}
                    {status.status === 'running' && t('status.running')}
                    {status.status === 'completed' && t('status.completed')}
                    {status.status === 'failed' && t('status.failed')}
                  </span>
                  {status.status === 'running' && (
                    <span className="text-sm text-muted-foreground">
                      {t('status.backgroundHint')}
                    </span>
                  )}
                </div>
              </div>
              {(status.status === 'completed' || status.status === 'failed') && (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  {t('buttons.newRebuild')}
                </Button>
              )}
            </div>

            {progressData && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('fields.progress.label')}</span>
                  <span className="font-medium">
                    {t('fields.progress.value', { processed: processedItems, total: totalItems, percent: progressPercent.toFixed(1) })}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-2" />
                {failedItems > 0 && (
                  <p className="text-sm text-yellow-600">
                    {t('fields.progress.failed', { count: failedItems })}
                  </p>
                )}
              </div>
            )}

            {stats && (
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('fields.stats.sources')}</p>
                  <p className="text-2xl font-bold">{sourcesProcessed}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('fields.stats.notes')}</p>
                  <p className="text-2xl font-bold">{notesProcessed}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('fields.stats.insights')}</p>
                  <p className="text-2xl font-bold">{insightsProcessed}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t('fields.stats.time')}</p>
                  <p className="text-2xl font-bold">
                    {processingTimeSeconds !== undefined ? t('fields.stats.timeValue', { seconds: processingTimeSeconds.toFixed(1) }) : '—'}
                  </p>
                </div>
              </div>
            )}

            {status.error_message && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{status.error_message}</AlertDescription>
              </Alert>
            )}

            {status.started_at && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{t('fields.timestamps.started', { time: new Date(status.started_at).toLocaleString() })}</p>
                {status.completed_at && (
                  <p>{t('fields.timestamps.completed', { time: new Date(status.completed_at).toLocaleString() })}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="when">
            <AccordionTrigger>{t('help.when.title')}</AccordionTrigger>
            <AccordionContent className="space-y-2 text-sm">
              <p><strong>{t('help.when.intro')}</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>{t('help.when.reasons.switching.title')}</strong> {t('help.when.reasons.switching.description')}</li>
                <li><strong>{t('help.when.reasons.upgrading.title')}</strong> {t('help.when.reasons.upgrading.description')}</li>
                <li><strong>{t('help.when.reasons.fixing.title')}</strong> {t('help.when.reasons.fixing.description')}</li>
                <li><strong>{t('help.when.reasons.importing.title')}</strong> {t('help.when.reasons.importing.description')}</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="time">
            <AccordionTrigger>{t('help.time.title')}</AccordionTrigger>
            <AccordionContent className="space-y-2 text-sm">
              <p><strong>{t('help.time.intro')}</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('help.time.factors.items')}</li>
                <li>{t('help.time.factors.modelSpeed')}</li>
                <li>{t('help.time.factors.rateLimits')}</li>
                <li>{t('help.time.factors.resources')}</li>
              </ul>
              <p className="mt-2"><strong>{t('help.time.typical.title')}</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>{t('help.time.typical.local.title')}</strong> {t('help.time.typical.local.description')}</li>
                <li><strong>{t('help.time.typical.cloud.title')}</strong> {t('help.time.typical.cloud.description')}</li>
                <li><strong>{t('help.time.typical.sources.title')}</strong> {t('help.time.typical.sources.description')}</li>
              </ul>
              <p className="mt-2"><em>{t('help.time.example')}</em></p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="safe">
            <AccordionTrigger>{t('help.safe.title')}</AccordionTrigger>
            <AccordionContent className="space-y-2 text-sm">
              <p><strong>{t('help.safe.intro')}</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>✅ <strong>{t('help.safe.features.idempotent.title')}</strong> {t('help.safe.features.idempotent.description')}</li>
                <li>✅ <strong>{t('help.safe.features.noDelete.title')}</strong> {t('help.safe.features.noDelete.description')}</li>
                <li>✅ <strong>{t('help.safe.features.anytime.title')}</strong> {t('help.safe.features.anytime.description')}</li>
                <li>✅ <strong>{t('help.safe.features.errors.title')}</strong> {t('help.safe.features.errors.description')}</li>
              </ul>
              <p className="mt-2">⚠️ <strong>{t('help.safe.warning.title')}:</strong> {t('help.safe.warning.description')}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
