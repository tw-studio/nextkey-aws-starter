/* eslint no-multi-str: 'off' */
////
///
// components › page › NextKeyWelcome

import React from 'react'

import Head from 'next/head'

import { styled } from '@/stitches.config'

////
///
// MARK: Types

export type NextKeyWelcomeProps = {
  index?: '0' | '1'
  nextKeyBenefitData: NextKeyBenefitData[]
}

export type NextKeyBenefitData = {
  nextkeyBenefitId: string
  index: string
  benefitName: string
  benefitDescription: string
}

////
///
// MARK: NextKeyWelcome Component

export default function NextKeyWelcome({ index = '0', nextKeyBenefitData }: NextKeyWelcomeProps) {
  const pageTitle = `NextKey: An AWS Starter`
  const sortedNextKeyBenefitData = nextKeyBenefitData?.sort(
    (a, b) => ((parseInt(a.index, 10) > parseInt(b.index, 10)) ? 1 : -1),
  )
  return (
    <WelcomeContainer>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageTitle} />
      </Head>
      <Main>
        <Title>
          Welcome to NextKey!
        </Title>

        <Subtitle>
          Build and Deploy Secure Next.js Apps on AWS
        </Subtitle>

        <Description index={index}>
          <a href="https://github.com/tw-studio/nextkey-aws-starter">
            NextKey
          </a>
          {' '}
          streamlines deploying a new password-protected
          {' '}
          <a href="https://nextjs.org">
            Next.js
          </a>
          {' '}
          application to AWS.
        </Description>

        <Grid>
          {sortedNextKeyBenefitData?.map((benefitItem) => (
            <Card key={benefitItem.index}>
              <h2>{benefitItem.benefitName}</h2>
              <p>{benefitItem.benefitDescription}</p>
            </Card>
          ))}
        </Grid>
      </Main>

      <Footer>
        Created with NextKey
      </Footer>
    </WelcomeContainer>
  )
}

////
///
// MARK: NextKeyWelcome Styles

const WelcomeContainer = styled('div', {})

const Main = styled('div', {
  alignItems: 'center',
  display: 'flex',
  flex: '1',
  flexDirection: 'column',
  minHeight: '100vh',
  marginX: 'auto',
  paddingX: '$mobilePadding',
  textAlign: 'center',
  width: '100%',
  '@desktop': { maxWidth: '$space$contentWidthDesktop' },
  '@mid': { maxWidth: '$space$contentWidthMid' },
  '@full': { maxWidth: '$space$contentWidthFull' },
})

const Title = styled('h1', {
  color: '$dark',
  fontFamily: 'PixL',
  fontPx: 60,
  fontWeight: 'bold',
  lineHeight: '1.15',
  margin: '0',
  paddingTop: '4rem',
  textAlign: 'center',

  '@largeMobile': { fontPx: 72 },
  '@desktop': { fontPx: 96 },
})

const Subtitle = styled('p', {
  color: '$dark',
  fontFamily: 'PixL',
  fontPx: 32,
  fontWeight: 'normal',
  lineHeight: 1.5,
  marginTop: '1rem',
  textAlign: 'center',

  '@largeMobile': { fontPx: 36 },
  '@desktop': { fontPx: 48 },
})

const Description = styled('p', {
  fontPx: 20,
  fontWeight: 'normal',
  lineHeight: 1.5,
  marginTop: '48px',
  textAlign: 'center',
  'a:hover,\
  a:focus,\
  a:active': {
    textDecoration: 'underline',
  },

  '@largeMobile': { fontPx: 20 },
  '@desktop': { fontPx: 22 },

  variants: {
    index: {
      0: { a: { color: '$theme0' } },
      1: { a: { color: '$theme1' } },
    },
  },
})

const Grid = styled('div', {
  display: 'grid',
  gridAutoRows: '1fr',
  gridTemplateColumns: 'repeat(1, 1fr)',
  marginY: '52px',

  '@desktop': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
})

const Card = styled('div', {
  border: '1px solid $borderLight',
  borderRadius: '10px',
  color: 'inherit',
  margin: '1rem',
  padding: '1.5rem',
  textAlign: 'left',
  textDecoration: 'none',

  h2: {
    fontPx: 24,
    fontWeight: 400,
    margin: '0 0 1rem 0',
  },

  p: {
    fontPx: 20,
    lineHeight: 1.5,
    margin: 0,
  },
})

const Footer = styled('footer', {
  alignItems: 'center',
  borderTop: '1px solid $borderLight',
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  padding: '2rem 0',
})
