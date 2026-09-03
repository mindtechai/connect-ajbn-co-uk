/// <reference types="npm:@types/react@18.3.1" />

import type { ComponentType } from 'npm:react@18.3.1'
import { template as bulkMessage } from './bulk-message.tsx'
import { template as accountDeletionRequest } from './account-deletion-request.tsx'
import { template as memberReport } from './member-report.tsx'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: any) => string)
  displayName?: string
  previewData?: Record<string, unknown>
  to?: string | ((data: any) => string)
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  'bulk-message': bulkMessage,
  'account-deletion-request': accountDeletionRequest,
}
