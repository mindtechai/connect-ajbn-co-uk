/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'
import { EmailHeader } from './EmailHeader.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props {
  reporter_name?: string
  reporter_email?: string
  target_name?: string
  reason?: string
  details?: string
  context?: string
  reference?: string
}

const MemberReportEmail = ({
  reporter_name = 'A member',
  reporter_email = '',
  target_name = 'Unknown member',
  reason = '',
  details,
  context = 'profile',
  reference,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New member report submitted in AJBN Connect</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader />
        <Heading style={h1}>New member report</Heading>
        <Text style={text}>
          {reporter_name}
          {reporter_email ? ` (${reporter_email})` : ''} reported{' '}
          <strong>{target_name}</strong> from the {context === 'chat' ? 'chat thread' : 'member directory'}.
        </Text>
        <Text style={text}>Reason: {reason}</Text>
        {details ? <Text style={text}>Details: {details}</Text> : null}
        {reference ? <Text style={muted}>Reference: {reference}</Text> : null}
        <Text style={text}>
          Review this in the AJBN Admin area under Reports and mark it reviewed or resolved.
        </Text>
        <Text style={footer}>Asian Jewish Business Network — AJBN Connect</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: MemberReportEmail,
  subject: 'New member report — AJBN Connect',
  displayName: 'Member report notification',
  previewData: {
    reporter_name: 'Priya Shah',
    reporter_email: 'priya@example.com',
    target_name: 'Sample Member',
    reason: 'Spam or unsolicited selling',
    details: 'Repeated unsolicited sales messages.',
    context: 'chat',
    reference: 'REP-PREVIEW',
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
