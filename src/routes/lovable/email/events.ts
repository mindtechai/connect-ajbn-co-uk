import { createEmailWebhookHandler } from '@lovable.dev/email-js'
import { createFileRoute } from '@tanstack/react-router'
import { createClient } from '@supabase/supabase-js'

type Outcome = 'bounce' | 'complaint' | 'unsubscribe'

const STATUS: Record<Outcome, 'bounced' | 'complained' | 'suppressed'> = {
  bounce: 'bounced',
  complaint: 'complained',
  unsubscribe: 'suppressed',
}

const MESSAGE: Record<Outcome, string> = {
  bounce: 'Permanent bounce — email address is invalid or rejected',
  complaint: 'Spam complaint — recipient marked email as spam',
  unsubscribe: 'Recipient unsubscribed',
}

/**
 * Records a terminal delivery outcome in the app's own history tables.
 * These records are notification-only: Lovable enforces suppression at send
 * time regardless of what is stored here.
 */
async function record(outcome: Outcome, recipient: string, messageId: string | null, eventId: string) {
  const admin = createClient(
    process.env['SUPABASE_URL']!,
    process.env['SUPABASE_SERVICE_ROLE_KEY']!,
    { auth: { persistSession: false } },
  )

  const email = recipient.trim().toLowerCase()

  const { error: suppressError } = await admin
    .from('suppressed_emails')
    .upsert({ email, reason: outcome, metadata: null }, { onConflict: 'email' })
  if (suppressError) {
    console.error('Failed to record suppression', {
      event_id: eventId,
      code: suppressError.code,
      message: suppressError.message,
    })
    throw new Error('Failed to record suppression')
  }

  const { error: logError } = await admin.from('email_send_log').insert({
    message_id: messageId,
    template_name: 'system',
    recipient_email: email,
    status: STATUS[outcome],
    error_message: MESSAGE[outcome],
    metadata: null,
  })
  if (logError) {
    console.error('Failed to record send log entry', {
      event_id: eventId,
      code: logError.code,
      message: logError.message,
    })
    throw new Error('Failed to record send log entry')
  }
}

export const Route = createFileRoute("/lovable/email/events")({
  server: {
    handlers: {
      POST: ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY']
        if (!apiKey) {
          console.error('Missing required environment variables')
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }
        const handler = createEmailWebhookHandler({
          apiKey,
          on: {
            'email.bounced': async (event) => {
              await record('bounce', event.data.recipient, event.data.message_id ?? null, event.event_id)
            },
            'email.complaint': async (event) => {
              await record('complaint', event.data.recipient, event.data.message_id ?? null, event.event_id)
            },
            'email.unsubscribed': async (event) => {
              await record('unsubscribe', event.data.recipient, event.data.message_id ?? null, event.event_id)
            },
          },
        })
        return handler(request)
      },
    },
  },
})
