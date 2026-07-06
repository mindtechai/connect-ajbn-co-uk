import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3.23.8'

import { SignupEmail } from '../_shared/email-templates/signup.tsx'
import { InviteEmail } from '../_shared/email-templates/invite.tsx'
import { MagicLinkEmail } from '../_shared/email-templates/magic-link.tsx'
import { RecoveryEmail } from '../_shared/email-templates/recovery.tsx'
import { EmailChangeEmail } from '../_shared/email-templates/email-change.tsx'
import { ReauthenticationEmail } from '../_shared/email-templates/reauthentication.tsx'
import { TEMPLATES as TRANSACTIONAL_TEMPLATES } from '../_shared/transactional-email-templates/registry.ts'

const SITE_NAME = 'connect-ajbn-co-uk'
const SENDER_DOMAIN = 'notify.connect.ajbn.co.uk'
const FROM_DOMAIN = 'connect.ajbn.co.uk'
const ROOT_URL = `https://${FROM_DOMAIN}`

const AUTH_TEMPLATES: Record<string, { component: React.ComponentType<any>; subject: string }> = {
  signup: { component: SignupEmail, subject: '[TEST] Confirm your email' },
  invite: { component: InviteEmail, subject: "[TEST] You've been invited" },
  magiclink: { component: MagicLinkEmail, subject: '[TEST] Your login link' },
  recovery: { component: RecoveryEmail, subject: '[TEST] Reset your password' },
  email_change: { component: EmailChangeEmail, subject: '[TEST] Confirm your new email' },
  reauthentication: { component: ReauthenticationEmail, subject: '[TEST] Your verification code' },
}

function authSampleProps(recipient: string) {
  return {
    siteName: SITE_NAME,
    siteUrl: ROOT_URL,
    recipient,
    email: recipient,
    oldEmail: recipient,
    newEmail: recipient,
    confirmationUrl: `${ROOT_URL}/test-link`,
    token: '123456',
  }
}

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const BodySchema = z.object({
  kind: z.enum(['auth', 'transactional']),
  templateName: z.string().min(1).max(64),
  recipientEmail: z.string().trim().email().max(254),
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) {
    return json({ error: 'Server configuration error' }, 500)
  }

  // Extract caller JWT (verify_jwt=true means gateway has already validated it)
  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) return json({ error: 'Unauthorized' }, 401)

  const admin = createClient(supabaseUrl, serviceKey)

  // Identify caller
  const { data: userData, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !userData?.user) return json({ error: 'Unauthorized' }, 401)
  const callerId = userData.user.id

  // Server-side role check
  const { data: isAdmin, error: roleErr } = await admin.rpc('has_role', {
    _user_id: callerId,
    _role: 'super_admin',
  })
  if (roleErr || !isAdmin) return json({ error: 'Forbidden' }, 403)

  // Parse + validate body
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch (e) {
    return json({ error: 'Invalid request', details: (e as Error).message }, 400)
  }
  const { kind, templateName, recipientEmail } = body

  // Rate limit — max 20 test sends per hour per caller
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: recentCount } = await admin
    .from('email_send_log')
    .select('id', { count: 'exact', head: true })
    .like('template_name', 'test:%')
    .gte('created_at', oneHourAgo)
  if ((recentCount ?? 0) >= 20) {
    return json({ error: 'Rate limit reached (20/hour). Try again later.' }, 429)
  }

  // Render + enqueue
  const messageId = crypto.randomUUID()
  const idempotencyKey = `test-${messageId}`
  let html: string
  let text: string
  let subject: string
  let queueName: 'auth_emails' | 'transactional_emails'
  let payload: Record<string, unknown>

  if (kind === 'auth') {
    const entry = AUTH_TEMPLATES[templateName]
    if (!entry) return json({ error: `Unknown auth template: ${templateName}` }, 400)
    const props = authSampleProps(recipientEmail)
    html = await renderAsync(React.createElement(entry.component, props))
    text = await renderAsync(React.createElement(entry.component, props), { plainText: true })
    subject = entry.subject
    queueName = 'auth_emails'
    payload = {
      run_id: `test-${messageId}`,
      message_id: messageId,
      to: recipientEmail,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: 'transactional',
      label: `test:${templateName}`,
      queued_at: new Date().toISOString(),
    }
  } else {
    const entry = TRANSACTIONAL_TEMPLATES[templateName]
    if (!entry) return json({ error: `Unknown transactional template: ${templateName}` }, 400)
    const data = entry.previewData ?? {}
    html = await renderAsync(React.createElement(entry.component, data))
    text = await renderAsync(React.createElement(entry.component, data), { plainText: true })
    const resolvedSubject =
      typeof entry.subject === 'function' ? entry.subject(data) : entry.subject
    subject = `[TEST] ${resolvedSubject}`
    queueName = 'transactional_emails'
    payload = {
      message_id: messageId,
      to: recipientEmail,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: 'transactional',
      label: `test:${templateName}`,
      idempotency_key: idempotencyKey,
      unsubscribe_token: generateToken(),
      queued_at: new Date().toISOString(),
    }
  }

  await admin.from('email_send_log').insert({
    message_id: messageId,
    template_name: `test:${templateName}`,
    recipient_email: recipientEmail,
    status: 'pending',
  })

  const { error: enqueueError } = await admin.rpc('enqueue_email', {
    queue_name: queueName,
    payload,
  })

  if (enqueueError) {
    console.error('Failed to enqueue test email', { enqueueError, templateName })
    await admin.from('email_send_log').insert({
      message_id: messageId,
      template_name: `test:${templateName}`,
      recipient_email: recipientEmail,
      status: 'failed',
      error_message: 'Failed to enqueue test email',
    })
    return json({ error: 'Failed to enqueue test email' }, 500)
  }

  await admin.from('admin_audit_log').insert({
    actor_id: callerId,
    action: 'email.test_send',
    target_type: 'email_template',
    details: { kind, templateName, recipientEmail, messageId },
  })

  return json({ success: true, messageId, queued: true }, 200)
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}