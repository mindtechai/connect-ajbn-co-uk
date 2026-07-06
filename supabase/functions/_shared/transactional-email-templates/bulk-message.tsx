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
  subject?: string
  body?: string
  first_name?: string
  unsubscribe_url?: string
  category?: string
}

const BulkMessageEmail = ({
  subject = 'A message from AJBN Connect',
  body = '',
  first_name,
  unsubscribe_url,
  category,
}: Props) => {
  const paragraphs = (body || '').split(/\n{2,}/g)
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />
          <Heading style={h1}>{subject}</Heading>
          {first_name ? <Text style={text}>Hi {first_name},</Text> : null}
          {paragraphs.map((p, i) => (
            <Text key={i} style={text}>
              {p}
            </Text>
          ))}
          <Text style={footer}>
            You're receiving this because you're a member of AJBN Connect.
            {unsubscribe_url ? (
              <>
                {' '}
                <Link href={unsubscribe_url} style={link}>
                  Unsubscribe from {category || 'these'} emails
                </Link>
                .
              </>
            ) : null}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: BulkMessageEmail,
  subject: (data: Props) => data.subject || 'A message from AJBN Connect',
  displayName: 'Bulk message / announcement',
  previewData: {
    subject: 'AJBN Connect — Upcoming networking evening',
    body: 'This is a preview of a bulk announcement.\n\nYou can send these to any segment of members.',
    first_name: 'Jane',
    unsubscribe_url: 'https://connect.ajbn.co.uk/email-unsubscribe?token=preview',
    category: 'announcements',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '0 0 30px', maxWidth: '600px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#0a1e3f',
  margin: '0 25px 20px',
}
const text = {
  fontSize: '14px',
  color: '#3f4a5c',
  lineHeight: '1.6',
  margin: '0 25px 20px',
}
const link = { color: '#0a1e3f', textDecoration: 'underline' }
const footer = {
  fontSize: '12px',
  color: '#7a869a',
  margin: '30px 25px 0',
  lineHeight: '1.5',
}