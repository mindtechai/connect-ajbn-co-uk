/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Img, Section } from 'npm:@react-email/components@0.0.22'

// Absolute URL — email clients cannot resolve relative paths.
// The banner is hosted on the Lovable CDN and served from the app origin.
export const BANNER_URL =
  'https://connect.ajbn.co.uk/__l5e/assets-v1/314cab37-47ab-4d26-a5f8-5ae1ca6bc1a8/ajbn-email-banner-v2.jpg'

export const EmailHeader = () => (
  <Section style={headerSection}>
    <Img
      src={BANNER_URL}
      alt="AJBN Connect — Asian Jewish Business Network"
      width="600"
      style={bannerImg}
    />
  </Section>
)

const headerSection = {
  margin: '0 0 24px',
  padding: '0',
  textAlign: 'center' as const,
}

const bannerImg = {
  display: 'block',
  width: '100%',
  maxWidth: '600px',
  height: 'auto',
  margin: '0 auto',
  border: '0',
  outline: 'none',
  textDecoration: 'none',
}

export default EmailHeader