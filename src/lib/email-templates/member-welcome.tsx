import * as React from 'react'
import {
  Body,
  Button,
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
  login_url?: string
}

const MemberWelcomeEmail = ({
  member_name = 'there',
  login_url = 'https://connect.ajbn.co.uk/login',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your AJBN Connect membership is approved</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader />
        <Heading style={h1}>Welcome to AJBN Connect, {member_name}</Heading>
        <Text style={text}>
          Your membership has been approved. You can now sign in to browse the member
          directory, message other members, book one-to-ones and register for events.
        </Text>
        <Button style={button} href={login_url}>
          Sign in to AJBN Connect
        </Button>
        <Text style={text}>
          If you have any questions, just reply to this email and the team will help.
        </Text>
        <Text style={footer}>Asian Jewish Business Network — AJBN Connect</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: MemberWelcomeEmail,
  subject: 'Welcome to AJBN Connect — your membership is approved',
  displayName: 'Member welcome',
  previewData: {
    member_name: 'Laura',
    login_url: 'https://connect.ajbn.co.uk/login',
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
const button = {
  backgroundColor: '#0f2b46',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  padding: '12px 20px',
  textDecoration: 'none',
  margin: '0 25px 18px',
  display: 'inline-block',
}
const footer = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '20px',
  padding: '0 25px',
  margin: '20px 0 0',
}
