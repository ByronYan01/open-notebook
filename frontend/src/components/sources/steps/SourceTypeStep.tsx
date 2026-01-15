"use client"

import { useMemo } from "react"
import { Control, FieldErrors, UseFormRegister, useWatch } from "react-hook-form"
import { FileIcon, LinkIcon, FileTextIcon } from "lucide-react"
import { FormSection } from "@/components/ui/form-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Controller } from "react-hook-form"
import { useTranslations } from "next-intl"

interface CreateSourceFormData {
  type: 'link' | 'upload' | 'text'
  title?: string
  url?: string
  content?: string
  file?: FileList | File
  notebooks?: string[]
  transformations?: string[]
  embed: boolean
  async_processing: boolean
}

// Helper functions for batch URL parsing
function parseUrls(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function parseAndValidateUrls(text: string): {
  valid: string[]
  invalid: { url: string; line: number }[]
} {
  const lines = text.split('\n')
  const valid: string[] = []
  const invalid: { url: string; line: number }[] = []

  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (trimmed.length === 0) return // skip empty lines

    if (validateUrl(trimmed)) {
      valid.push(trimmed)
    } else {
      invalid.push({ url: trimmed, line: index + 1 })
    }
  })

  return { valid, invalid }
}

const SOURCE_TYPES = [
  {
    value: 'link' as const,
    icon: LinkIcon,
  },
  {
    value: 'upload' as const,
    icon: FileIcon,
  },
  {
    value: 'text' as const,
    icon: FileTextIcon,
  },
]

interface SourceTypeStepProps {
  control: Control<CreateSourceFormData>
  register: UseFormRegister<CreateSourceFormData>
  errors: FieldErrors<CreateSourceFormData>
  urlValidationErrors?: { url: string; line: number }[]
  onClearUrlErrors?: () => void
}

const MAX_BATCH_SIZE = 50

export function SourceTypeStep({ control, register, errors, urlValidationErrors, onClearUrlErrors }: SourceTypeStepProps) {
  const t = useTranslations('sources.steps.sourceType')
  // Watch the selected type and inputs to detect batch mode
  const selectedType = useWatch({ control, name: 'type' })
  const urlInput = useWatch({ control, name: 'url' })
  const fileInput = useWatch({ control, name: 'file' })

  // Batch mode detection
  const { isBatchMode, itemCount, urlCount, fileCount } = useMemo(() => {
    let urlCount = 0
    let fileCount = 0

    if (selectedType === 'link' && urlInput) {
      const urls = parseUrls(urlInput)
      urlCount = urls.length
    }

    if (selectedType === 'upload' && fileInput) {
      const fileList = fileInput as FileList
      fileCount = fileList?.length || 0
    }

    const isBatchMode = urlCount > 1 || fileCount > 1
    const itemCount = selectedType === 'link' ? urlCount : fileCount

    return { isBatchMode, itemCount, urlCount, fileCount }
  }, [selectedType, urlInput, fileInput])

  // Check for batch size limit
  const isOverLimit = itemCount > MAX_BATCH_SIZE

  const sourceTypes = SOURCE_TYPES.map((type) => ({
    ...type,
    label: t(`types.${type.value}.label`),
    description: t(`types.${type.value}.description`),
  }))

  return (
    <div className="space-y-6">
      <FormSection
        title={t('stepTitle')}
        description={t('stepDescription')}
      >
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Tabs
              value={field.value || ''}
              onValueChange={(value) => field.onChange(value as 'link' | 'upload' | 'text')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                {sourceTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <TabsTrigger key={type.value} value={type.value} className="gap-2">
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {sourceTypes.map((type) => (
                <TabsContent key={type.value} value={type.value} className="mt-4">
                  <p className="text-sm text-muted-foreground mb-4">{type.description}</p>
                  
                  {/* Type-specific fields */}
                  {type.value === 'link' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="url">{t('types.link.url.label')}</Label>
                        {urlCount > 0 && (
                          <Badge variant={isOverLimit ? "destructive" : "secondary"}>
                            {t('types.link.url.count', { count: urlCount })}
                            {isOverLimit && ` (${t('types.link.url.max', { max: MAX_BATCH_SIZE })})`}
                          </Badge>
                        )}
                      </div>
                      <Textarea
                        id="url"
                        {...register('url', {
                          onChange: () => onClearUrlErrors?.()
                        })}
                        placeholder={t('types.link.url.placeholder')}
                        rows={urlCount > 1 ? 6 : 2}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('types.link.url.hint')}
                      </p>
                      {errors.url && (
                        <p className="text-sm text-destructive mt-1">{errors.url.message}</p>
                      )}
                      {urlValidationErrors && urlValidationErrors.length > 0 && (
                        <div className="mt-2 p-3 bg-destructive/10 rounded-md border border-destructive/20">
                          <p className="text-sm font-medium text-destructive mb-2">
                            {t('types.link.url.errors.title')}
                          </p>
                          <ul className="space-y-1">
                            {urlValidationErrors.map((error, idx) => (
                              <li key={idx} className="text-xs text-destructive flex items-start gap-2">
                                <span className="font-mono bg-destructive/20 px-1 rounded">
                                  {t('types.link.url.errors.line', { line: error.line })}
                                </span>
                                <span className="truncate">{error.url}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-xs text-muted-foreground mt-2">
                            {t('types.link.url.errors.fix')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {type.value === 'upload' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="file">{t('types.upload.file.label')}</Label>
                        {fileCount > 0 && (
                          <Badge variant={isOverLimit ? "destructive" : "secondary"}>
                            {t('types.upload.file.count', { count: fileCount })}
                            {isOverLimit && ` (${t('types.upload.file.max', { max: MAX_BATCH_SIZE })})`}
                          </Badge>
                        )}
                      </div>
                      <Input
                        id="file"
                        type="file"
                        multiple
                        {...register('file')}
                        accept=".pdf,.doc,.docx,.pptx,.ppt,.xlsx,.xls,.txt,.md,.epub,.mp4,.avi,.mov,.wmv,.mp3,.wav,.m4a,.aac,.jpg,.jpeg,.png,.tiff,.zip,.tar,.gz,.html"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('types.upload.file.hint')}
                      </p>
                      {fileCount > 1 && fileInput instanceof FileList && (
                        <div className="mt-2 p-3 bg-muted rounded-md">
                          <p className="text-xs font-medium mb-2">{t('types.upload.file.selected')}</p>
                          <ul className="space-y-1 max-h-32 overflow-y-auto">
                            {Array.from(fileInput).map((file, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                                <FileIcon className="h-3 w-3" />
                                <span className="truncate">{file.name}</span>
                                <span className="text-muted-foreground/50">
                                  ({t('types.upload.file.size', { size: (file.size / 1024).toFixed(1) })})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {errors.file && (
                        <p className="text-sm text-destructive mt-1">{errors.file.message}</p>
                      )}
                      {isOverLimit && selectedType === 'upload' && (
                        <p className="text-sm text-destructive mt-1">
                          {t('types.upload.file.maxError', { max: MAX_BATCH_SIZE })}
                        </p>
                      )}
                    </div>
                  )}

                  {type.value === 'text' && (
                    <div>
                      <Label htmlFor="content" className="mb-2 block">{t('types.text.content.label')}</Label>
                      <Textarea
                        id="content"
                        {...register('content')}
                        placeholder={t('types.text.content.placeholder')}
                        rows={6}
                      />
                      {errors.content && (
                        <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
                      )}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        />
        {errors.type && (
          <p className="text-sm text-destructive mt-1">{errors.type.message}</p>
        )}
      </FormSection>

      {/* Hide title field in batch mode - titles will be auto-generated */}
      {!isBatchMode && (
        <FormSection
          title={selectedType === 'text' ? t('title.required') : t('title.optional')}
          description={selectedType === 'text'
            ? t('title.requiredDescription')
            : t('title.optionalDescription')
          }
        >
          <Input
            id="title"
            {...register('title')}
            placeholder={t('title.placeholder')}
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
          )}
        </FormSection>
      )}

      {/* Batch mode indicator */}
      {isBatchMode && (
        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default">{t('batch.badge')}</Badge>
            <span className="text-sm font-medium">
              {t('batch.indicator', { count: itemCount, type: selectedType === 'link' ? 'URLs' : 'files' })}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('batch.description')}
          </p>
        </div>
      )}
    </div>
  )
}
