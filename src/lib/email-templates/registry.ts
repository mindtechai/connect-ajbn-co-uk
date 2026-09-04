import type { ComponentType } from 'react'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 */
import { template as bulkMessage } from './bulk-message'
import { template as accountDeletionRequest } from './account-deletion-request'
import { template as memberReport } from './member-report'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'bulk-message': bulkMessage,
  'account-deletion-request': accountDeletionRequest,
  'member-report': memberReport,
}
