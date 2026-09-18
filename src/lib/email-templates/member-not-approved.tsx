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
  reason?: string
}

const MemberNotApprovedEmail = ({
  member_name = 'there',
  reason = '',
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your AJBN Connect application was not approved at this time</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader />
        <Heading style={h1}>Thanks for your interest, {member_name}</Heading>
        <Text style={text}>
          We have reviewed your AJBN Connect application and, unfortunately, we are not able to approve your membership at this time.
        </Text>
        {reason ? (
          <Text style={text}>
            Reason: {reason}
          </Text>
        ) : null}
        <Text style={text}>
          If you believe this is a mistake, or if your circumstances change, you are welcome to reply to this email or contact the AJBN team at admin@ajbn.co.uk.
        </Text>
        <Button style={button} href="https://connect.ajbn.co.uk/contact">
          Contact AJBN
        </Button>
        <Text style={footer}>Asian Jewish Business Network — AJBN Connect</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: MemberNotApprovedEmail,
  subject: 'AJBN Connect — membership not approved at this time',
  displayName: 'Membership not approved',
  previewData: {
    member_name: 'Nelesh',
    reason: 'We could not verify the business details provided.',
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
