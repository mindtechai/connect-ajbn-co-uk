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
  applicant_name?: string
  applicant_email?: string
  company?: string
  motivation?: string
  linkedin_url?: string
  referral_experience?: string
  payment_ack?: boolean
  reference?: string
}

const LionApplicationEmail = ({
  applicant_name = 'A member',
  applicant_email = '',
  company,
  motivation = '',
  linkedin_url,
  referral_experience,
  payment_ack = false,
  reference,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New Impact Lions Club application</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader />
        <Heading style={h1}>New Impact Lions Club application</Heading>
        <Text style={text}>
          {applicant_name}
          {company ? ` — ${company}` : ''}
          {applicant_email ? ` (${applicant_email})` : ''} has applied to join the AJBN Impact
          Lions Club.
        </Text>
        <Text style={text}>Why they want to join: {motivation}</Text>
        {linkedin_url ? <Text style={text}>LinkedIn: {linkedin_url}</Text> : null}
        {referral_experience ? (
          <Text style={text}>Referral / introduction experience: {referral_experience}</Text>
        ) : null}
        <Text style={text}>
          £250 annual contribution confirmed: {payment_ack ? 'Yes' : 'No'}
        </Text>
        {reference ? <Text style={muted}>Reference: {reference}</Text> : null}
        <Text style={text}>
          Review this in the AJBN Admin area under Impact Lions applications.
        </Text>
        <Text style={footer}>Asian Jewish Business Network — AJBN Connect</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: LionApplicationEmail,
  subject: 'New Impact Lions Club application — AJBN Connect',
  displayName: 'Impact Lions application',
  previewData: {
    applicant_name: 'Priya Shah',
    applicant_email: 'priya@example.com',
    company: 'Example Ltd',
    motivation: 'I want to support UK charities through the network.',
    linkedin_url: 'https://www.linkedin.com/in/example',
    referral_experience: 'Introduced 4 members to new suppliers last year.',
    payment_ack: true,
    reference: 'LION-PREVIEW',
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
