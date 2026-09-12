import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'
import { EmailHeader } from './EmailHeader'
import type { TemplateEntry } from './registry'

interface Props {
  sender_name?: string
  message_body?: string
}

const QuietHoursMessageEmail = ({
  sender_name = 'An AJBN member',
  message_body = '',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You received a message while in Quiet Hours</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader />
        <Heading style={h1}>New message while in Quiet Hours</Heading>
        <Text style={text}>{sender_name} sent you a message in AJBN Connect.</Text>
        {message_body ? <Text style={quote}>{message_body}</Text> : null}
        <Text style={muted}>
          This member is in Quiet Hours (Respect Mode inspired by Shabbat — Fri 6pm to Sat 10pm).
          Your message was emailed instead of in-app bell.
        </Text>
        <Text style={footer}>Asian Jewish Business Network — AJBN Connect</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: QuietHoursMessageEmail,
  subject: 'New message while in Quiet Hours',
  displayName: 'Quiet Hours message notification',
  previewData: {
    sender_name: 'Priya Shah',
    message_body: 'Great to meet you at the members evening — can we speak next week?',
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
const quote = {
  color: '#0f2b46',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '12px 20px',
  margin: '0 25px 14px',
  backgroundColor: '#f4f6f8',
  borderRadius: '8px',
}
const muted = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
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
