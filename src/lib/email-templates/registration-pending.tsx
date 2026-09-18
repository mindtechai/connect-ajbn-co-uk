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
  member_name?: string
}

const RegistrationPendingEmail = ({ member_name = 'there' }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your AJBN Connect membership is pending approval</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader />
        <Heading style={h1}>Thanks for registering, {member_name}</Heading>
        <Text style={text}>
          Thanks for registering with AJBN Connect. Your membership is pending approval,
          and you will get full access to the member Directory and 1-2-1 messaging once
          approved.
        </Text>
        <Text style={text}>
          The team reviews new registrations regularly and will email you as soon as your
          membership is approved. If you have any questions in the meantime, just reply to
          this email.
        </Text>
        <Text style={footer}>Asian Jewish Business Network — AJBN Connect</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: RegistrationPendingEmail,
  subject: 'Thanks for registering with AJBN Connect — approval pending',
  displayName: 'Registration pending approval',
  previewData: { member_name: 'Nelesh' },
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
  margin: '0 0 16px',
}
const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  padding: '0 25px',
  margin: '26px 0 0',
}
