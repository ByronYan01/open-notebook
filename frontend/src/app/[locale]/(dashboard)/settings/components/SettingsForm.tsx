'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useSettings, useUpdateSettings } from '@/lib/hooks/use-settings'
import { useEffect, useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'

const settingsSchema = z.object({
  default_content_processing_engine_doc: z.enum(['auto', 'docling', 'simple']).optional(),
  default_content_processing_engine_url: z.enum(['auto', 'firecrawl', 'jina', 'simple']).optional(),
  default_embedding_option: z.enum(['ask', 'always', 'never']).optional(),
  auto_delete_files: z.enum(['yes', 'no']).optional(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export function SettingsForm() {
  const t = useTranslations('settings.form')
  const { data: settings, isLoading, error } = useSettings()
  const updateSettings = useUpdateSettings()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [hasResetForm, setHasResetForm] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty }
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      default_content_processing_engine_doc: undefined,
      default_content_processing_engine_url: undefined,
      default_embedding_option: undefined,
      auto_delete_files: undefined,
    }
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  useEffect(() => {
    if (settings && settings.default_content_processing_engine_doc && !hasResetForm) {
      const formData = {
        default_content_processing_engine_doc: settings.default_content_processing_engine_doc as 'auto' | 'docling' | 'simple',
        default_content_processing_engine_url: settings.default_content_processing_engine_url as 'auto' | 'firecrawl' | 'jina' | 'simple',
        default_embedding_option: settings.default_embedding_option as 'ask' | 'always' | 'never',
        auto_delete_files: settings.auto_delete_files as 'yes' | 'no',
      }
      reset(formData)
      setHasResetForm(true)
    }
  }, [hasResetForm, reset, settings])

  const onSubmit = async (data: SettingsFormData) => {
    await updateSettings.mutateAsync(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>{t('error.title')}</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : t('error.unknown')}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.contentProcessing.title')}</CardTitle>
          <CardDescription>
            {t('sections.contentProcessing.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="doc_engine">{t('sections.contentProcessing.docEngine.label')}</Label>
            <Controller
              name="default_content_processing_engine_doc"
              control={control}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={field.disabled || isLoading}
                >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('sections.contentProcessing.docEngine.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">{t('sections.contentProcessing.docEngine.options.auto')}</SelectItem>
                      <SelectItem value="docling">{t('sections.contentProcessing.docEngine.options.docling')}</SelectItem>
                      <SelectItem value="simple">{t('sections.contentProcessing.docEngine.options.simple')}</SelectItem>
                    </SelectContent>
                  </Select>
              )}
            />
            <Collapsible open={expandedSections.doc} onOpenChange={() => toggleSection('doc')}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${expandedSections.doc ? 'rotate-180' : ''}`} />
                {t('helpMeChoose')}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 text-sm text-muted-foreground space-y-2">
                <p>• <strong>{t('sections.contentProcessing.docEngine.help.doclingName')}</strong> {t('sections.contentProcessing.docEngine.help.doclingDesc')}</p>
                <p>• <strong>{t('sections.contentProcessing.docEngine.help.simpleName')}</strong> {t('sections.contentProcessing.docEngine.help.simpleDesc')}</p>
                <p>• <strong>{t('sections.contentProcessing.docEngine.help.autoName')}</strong> {t('sections.contentProcessing.docEngine.help.autoDesc')}</p>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="space-y-3">
            <Label htmlFor="url_engine">{t('sections.contentProcessing.urlEngine.label')}</Label>
            <Controller
              name="default_content_processing_engine_url"
              control={control}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={field.disabled || isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('sections.contentProcessing.urlEngine.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">{t('sections.contentProcessing.urlEngine.options.auto')}</SelectItem>
                    <SelectItem value="firecrawl">{t('sections.contentProcessing.urlEngine.options.firecrawl')}</SelectItem>
                    <SelectItem value="jina">{t('sections.contentProcessing.urlEngine.options.jina')}</SelectItem>
                    <SelectItem value="simple">{t('sections.contentProcessing.urlEngine.options.simple')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <Collapsible open={expandedSections.url} onOpenChange={() => toggleSection('url')}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${expandedSections.url ? 'rotate-180' : ''}`} />
                {t('helpMeChoose')}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 text-sm text-muted-foreground space-y-2">
                <p>• <strong>{t('sections.contentProcessing.urlEngine.help.firecrawlName')}</strong> {t('sections.contentProcessing.urlEngine.help.firecrawlDesc')}</p>
                <p>• <strong>{t('sections.contentProcessing.urlEngine.help.jinaName')}</strong> {t('sections.contentProcessing.urlEngine.help.jinaDesc')}</p>
                <p>• <strong>{t('sections.contentProcessing.urlEngine.help.simpleName')}</strong> {t('sections.contentProcessing.urlEngine.help.simpleDesc')}</p>
                <p>• <strong>{t('sections.contentProcessing.urlEngine.help.autoName')}</strong> {t('sections.contentProcessing.urlEngine.help.autoDesc')}</p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('sections.embeddingSearch.title')}</CardTitle>
          <CardDescription>
            {t('sections.embeddingSearch.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="embedding">{t('sections.embeddingSearch.label')}</Label>
            <Controller
              name="default_embedding_option"
              control={control}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={field.disabled || isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('sections.embeddingSearch.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ask">{t('sections.embeddingSearch.options.ask')}</SelectItem>
                    <SelectItem value="always">{t('sections.embeddingSearch.options.always')}</SelectItem>
                    <SelectItem value="never">{t('sections.embeddingSearch.options.never')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <Collapsible open={expandedSections.embedding} onOpenChange={() => toggleSection('embedding')}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${expandedSections.embedding ? 'rotate-180' : ''}`} />
                {t('helpMeChoose')}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 text-sm text-muted-foreground space-y-2">
                <p>{t('sections.embeddingSearch.help.intro')}</p>
                <p>• {t('sections.embeddingSearch.help.always')}</p>
                <p>• {t('sections.embeddingSearch.help.ask')}</p>
                <p>• {t('sections.embeddingSearch.help.never')}</p>
                <p>{t('sections.embeddingSearch.help.reference')}</p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('sections.fileManagement.title')}</CardTitle>
          <CardDescription>
            {t('sections.fileManagement.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="auto_delete">{t('sections.fileManagement.label')}</Label>
            <Controller
              name="auto_delete_files"
              control={control}
              render={({ field }) => (
                <Select
                  key={field.value}
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={field.disabled || isLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('sections.fileManagement.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">{t('sections.fileManagement.options.yes')}</SelectItem>
                    <SelectItem value="no">{t('sections.fileManagement.options.no')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <Collapsible open={expandedSections.files} onOpenChange={() => toggleSection('files')}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${expandedSections.files ? 'rotate-180' : ''}`} />
                {t('helpMeChoose')}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 text-sm text-muted-foreground space-y-2">
                <p>{t('sections.fileManagement.help.intro')}</p>
                <p>• {t('sections.fileManagement.help.yes')}</p>
                <p>• {t('sections.fileManagement.help.no')}</p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!isDirty || updateSettings.isPending}
        >
          {updateSettings.isPending ? t('buttons.saving') : t('buttons.save')}
        </Button>
      </div>
    </form>
  )
}
