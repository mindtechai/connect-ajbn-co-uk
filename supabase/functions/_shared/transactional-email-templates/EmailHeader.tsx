/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Img, Section } from 'npm:@react-email/components@0.0.22'

// Absolute URL — email clients cannot resolve relative paths.
export const BANNER_URL =
  'https://connect.ajbn.co.uk/__l5e/assets-v1/2d6abf3d-3c02-49da-8dfe-b7399919214b/ajbn-email-banner.png'

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