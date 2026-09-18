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

interface Props {
  member_name?: string
  company?: string
  member_email?: string
  member_phone?: string
  signed_up_on?: string
  member_url?: string
  approvals_url?: string
}

const AdminNewSignupEmail = ({
  member_name = 'New member',
  company = '',
  member_email = '',
  member_phone = '',
  signed_up_on = '',
  member_url = 'https://connect.ajbn.co.uk/admin/members?member=00a67fe6',
  approvals_url = 'https://connect.ajbn.co.uk/admin/members?filter=pending',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`${member_name}${company ? ` (${company})` : ''} needs approval`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader />
        <Heading style={h1}>New member needs approval</Heading>
        <Section style={card}>
          <Text style={row}>Name: {member_name}</Text>
          {company ? <Text style={row}>Business: {company}</Text> : null}
          {member_email ? <Text style={row}>Email: {member_email}</Text> : null}
          <Text style={row}>Phone: {member_phone || 'Not provided'}</Text>
          {signed_up_on ? <Text style={row}>Registered: {signed_up_on}</Text> : null}
        </Section>
        <Button style={button} href={member_url}>
          Open this member
        </Button>
        <Text style={text}>
          Or review everyone waiting for approval:
        </Text>
        <Button style={buttonSecondary} href={approvals_url}>
          Pending approvals
        </Button>
        <Text style={footer}>Asian Jewish Business Network — AJBN Connect</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminNewSignupEmail,
  subject: (data: Record<string, any>) => {
    const name = data?.['member_name'] || 'New member'
    const company = data?.['company']
    return `New AJBN member: ${name}${company ? ` - ${company}` : ''} - needs approval`
  },
  displayName: 'Admin alert — new member sign-up',
  to: 'admin@ajbn.co.uk',
  previewData: {
    member_name: 'Nelesh Kavia',
    company: 'ATZ Finance Ltd',
    member_email: 'nelesh@atzfinance.com',
    member_phone: '',
    signed_up_on: 'Thursday, 17 September 2026',
    member_url: 'https://connect.ajbn.co.uk/admin/members?member=00a67fe6',
    approvals_url: 'https://connect.ajbn.co.uk/admin/approvals',
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
  margin: '18px 0 8px',
}
const card = {
  margin: '0 25px 18px',
  padding: '16px 18px',
  backgroundColor: '#f6f8fa',
  borderRadius: '8px',
}
const row = {
  color: '#0f2b46',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 4px',
}
const button = {
  backgroundColor: '#174164',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '700',
  textDecoration: 'none',
  padding: '11px 20px',
  margin: '0 25px',
  display: 'inline-block',
}
const buttonSecondary = {
  ...button,
  backgroundColor: '#0f2b46',
}
const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  padding: '0 25px',
  margin: '26px 0 0',
}
