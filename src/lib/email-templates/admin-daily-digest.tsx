
import * as React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { EmailHeader } from './EmailHeader'
import type { TemplateEntry } from './registry'

export interface DigestSection {
  title: string
  count: number
  items: string[]
  action_url?: string
  action_label?: string
}

interface Props {
  date_label?: string
  sections?: DigestSection[]
}

const AdminDailyDigestEmail = ({ date_label = '', sections = [] }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`AJBN Connect admin summary${date_label ? ` — ${date_label}` : ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader />
        <Heading style={h1}>Admin summary</Heading>
        {date_label ? <Text style={muted}>{date_label}</Text> : null}
        <Text style={text}>
          Here is everything that needs your attention in AJBN Connect from the last 24 hours.
        </Text>

        {sections.map((section) => (
          <Section key={section.title} style={card}>
            <Text style={cardTitle}>
              {section.title} ({section.count})
            </Text>
            {section.items.map((item, index) => (
              <Text key={`${section.title}-${index}`} style={itemText}>
                • {item}
              </Text>
            ))}
            {section.action_url ? (
              <Button href={section.action_url} style={button}>
                {section.action_label ?? 'Open in admin'}
              </Button>
            ) : null}
          </Section>
        ))}

        <Text style={footer}>Asian Jewish Business Network — AJBN Connect</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminDailyDigestEmail,
  subject: 'AJBN Connect — daily admin summary',
  displayName: 'Daily admin summary',
  previewData: {
    date_label: 'Thursday, 10 September 2026',
    sections: [
      {
        title: 'Profile changes awaiting approval',
        count: 2,
        items: [
          'Priya Shah — company name, logo',
          'David Levy — website',
        ],
        action_url: 'https://connect.ajbn.co.uk/admin',
        action_label: 'Review profile changes',
      },
      {
        title: 'New service enquiries',
        count: 1,
        items: ['Sample Member — Business Insurance'],
        action_url: 'https://connect.ajbn.co.uk/admin',
        action_label: 'Review enquiries',
      },
    ],
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '0 0 30px', maxWidth: '600px' }
const h1 = {
  color: '#0f2b46',
  fontSize: '22px',
  fontWeight: '700',
  padding: '0 25px',
  margin: '24px 0 8px',
}
const text = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '0 25px',
  margin: '0 0 18px',
}
const muted = {
  color: '#6b7280',
  fontSize: '13px',
  padding: '0 25px',
  margin: '0 0 14px',
}
const card = {
  margin: '0 25px 18px',
  padding: '16px 18px',
  backgroundColor: '#f6f8fa',
  borderRadius: '8px',
  borderLeft: '4px solid #0f8a8a',
}
const cardTitle = {
  color: '#0f2b46',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0 0 10px',
}
const itemText = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 6px',
}
const button = {
  backgroundColor: '#0f2b46',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  textDecoration: 'none',
  padding: '10px 18px',
  display: 'inline-block',
  margin: '10px 0 0',
}
const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '20px',
  padding: '0 25px',
  margin: '20px 0 0',
}
