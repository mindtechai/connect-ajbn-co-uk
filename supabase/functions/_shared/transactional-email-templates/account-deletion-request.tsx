/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import { EmailHeader } from './EmailHeader.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props {
  email?: string
  reason?: string
  reference?: string
  due_by?: string
}

const AccountDeletionRequestEmail = ({
  email = '',
  reason,
  reference,
  due_by,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We've received your AJBN Connect account deletion request</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader />
        <Heading style={h1}>Account deletion request received</Heading>
        <Text style={text}>
          We have received a request to permanently delete the AJBN Connect account
          associated with {email}.
        </Text>
        <Text style={text}>
          Your account and all associated data — profile details, direct messages,
          event registrations and activity records — will be permanently deleted
          within 30 days{due_by ? ` (by ${due_by})` : ''}. Some records may be
          retained only where UK law requires it.
        </Text>
        {reason ? <Text style={text}>Reason you gave: {reason}</Text> : null}
        {reference ? <Text style={muted}>Reference: {reference}</Text> : null}
        <Text style={text}>
          If you did not make this request, or you have changed your mind, reply to
          this email or contact{' '}
          <Link href="mailto:russell@ajbn.co.uk" style={link}>
            russell@ajbn.co.uk
          </Link>{' '}
          straight away and we will cancel it.
        </Text>
        <Text style={footer}>
          Asian Jewish Business Network — AJBN Connect
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AccountDeletionRequestEmail,
  subject: 'Your AJBN Connect account deletion request',
  displayName: 'Account deletion request confirmation',
  previewData: {
    email: 'member@example.com',
    reason: 'No longer in the network',
    reference: 'ADR-PREVIEW',
    due_by: '30 September 2026',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '0 0 30px', maxWidth: '600px' }
const h1 = {
  color: '#0f2b46',
  fontSize: '22px',
  fontWeight: '700',
  padding: '0 25px',
  margin: '24px 0 12px',
}
const text = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '0 25px',
  margin: '0 0 14px',
}
const muted = {
  color: '#6b7280',
  fontSize: '13px',
  padding: '0 25px',
  margin: '0 0 14px',
}
const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '20px',
  padding: '0 25px',
  margin: '20px 0 0',
}
const link = { color: '#0f6b6b', textDecoration: 'underline' }
