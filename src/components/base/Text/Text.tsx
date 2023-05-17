////
///
// components › base › Text

import { styled } from '@/stitches.config'

const Text = styled('span', {
  fontKerning: 'normal',
  fontVariantNumeric: 'normal',

  defaultVariants: {
    color: 'inherit',
    display: 'block',
    font: 'inherit',
    lineHeight: '15',
    numbers: 'normal',
    pre: 'line',
    size: 'inherit',
    spacing: 'inherit',
    weight: 'inherit',
    whiteSpace: 'pre',
  },

  variants: {
    color: {
      inherit: { color: 'inherit' },
      primary: { color: '$primaryText' },
      secondary: { color: '$secondText' },
      theme: { color: '$theme0' },
    },
    display: {
      block: { display: 'block' },
      flex: { display: 'flex' },
      inline: { display: 'inline' },
      inlineBlock: { display: 'inline-block' },
      inlineFlex: { display: 'inline-flex' },
    },
    font: {
      inherit: {
        fontFamily: 'inherit',
      },
      system: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,'
        + 'Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      },
    },
    lineHeight: {
      13: { lineHeight: '1.3' },
      14: { lineHeight: '1.4' },
      15: { lineHeight: '1.5' },
      16: { lineHeight: '1.6' },
    },
    numbers: {
      normal: { fontVariantNumeric: 'normal' },
      tabular: { fontVariantNumeric: 'tabular' },
    },
    pre: {
      line: { whiteSpace: 'pre-line' },
    },
    size: {
      inherit: { fontSize: 'inherit' },
      14: { fontSize: '14px' },
      16: { fontSize: '16px' },
      18: { fontSize: '18px' },
      21: { fontSize: '21px' },
      24: { fontSize: '24px' },
      32: { fontSize: '32px' },
    },
    spacing: {
      inherit: { letterSpacing: 'inherit' },
      text: {
        letterSpacing: '0.01em',
      },
    },
    weight: {
      inherit: { fontWeight: 'inherit' },
      400: { fontWeight: '400' },
      regular: { fontWeight: '400' },
      500: { fontWeight: '500' },
      medium: { fontWeight: '500' },
      600: { fontWeight: '600' },
      semibold: { fontWeight: '600' },
      700: { fontWeight: '700' },
      bold: { fontWeight: '700' },
      800: { fontWeight: '800' },
      extrabold: { fontWeight: '800' },
      900: { fontWeight: '900' },
      heavy: { fontWeight: '900' },
    },
    whiteSpace: {
      normal: { whiteSpace: 'normal' },
      nowrap: { whiteSpace: 'nowrap' },
      pre: { whiteSpace: 'pre-line' },
    },
    gradient: {
      true: {
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      },
    },
  },
})

export default Text
