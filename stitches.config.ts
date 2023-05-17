////
///
// stitches.config.ts

import { createStitches } from '@stitches/react'
import type * as Stitches from '@stitches/react'

export const {
  config,
  createTheme,
  css,
  getCssText,
  globalCss,
  keyframes,
  reset,
  styled,
  theme,
} = createStitches({
  prefix: 'nextkey',
  theme: {
    // https://stitches.dev/docs/tokens
    colors: {
      black: '#000000',
      borderLight: '#eaeaea',
      dark: '#333333',
      slateBrightD9: '#d9dbdf',
      slateBrightE9: '#e9ebef',
      slateBrightEC: '#eceef2',
      slateBrightF2: '#f2f4f8',
      slateBrightF4: '#f4f6f9',
      imagePlaceholder: '#f4f6f9',
      none: '#00000000',
      placeholder: '#dadde3',
      slateMedium: '#6e7074',
      textPlaceholder: '#dadde3',
      theme0: '#0070f3',
      theme1: '#1aa854',
      transparent: '#00000000',
    },
    fontSizes: {},
    fonts: {},
    fontWeights: {},
    lineHeights: {},
    letterSpacings: {},
    sizes: {},
    space: {
      contentWidthDesktop: '704px',
      contentWidthMid: '840px',
      contentWidthFull: '980px',
      mobilePadding: '21px',
    },
    borderWidths: {},
    borderStyles: {},
    radii: {},
    shadows: {},
    zIndices: {},
    transitions: {},
  },
  media: {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    xxl: '(min-width: 1536px)',
    largeMobile: '(min-width: 550px)',
    desktop: '(min-width: 744px)',
    mid: '(min-width: 936px)',
    full: '(min-width: 1128px)',
  },
  utils: {
    ////
    ///
    // Spacing, Layout

    // container
    container: () => ({
      '@sm': { maxWidth: '640px' },
      '@md': { maxWidth: '768px' },
      '@lg': { maxWidth: '1024px' },
      '@xl': { maxWidth: '1280px' },
      '@xxl': { maxWidth: '1536px' },
    }),

    // margins
    marginX: (value: Stitches.PropertyValue<'marginLeft'>) => ({
      marginLeft: value,
      marginRight: value,
    }),
    marginY: (value: Stitches.PropertyValue<'marginTop'>) => ({
      marginTop: value,
      marginBottom: value,
    }),

    // padding
    paddingX: (value: Stitches.PropertyValue<'paddingLeft'>) => ({
      paddingLeft: value,
      paddingRight: value,
    }),
    paddingY: (value: Stitches.PropertyValue<'paddingTop'>) => ({
      paddingTop: value,
      paddingBottom: value,
    }),

    // width/height together
    size: (value: Stitches.PropertyValue<'width'>) => ({
      width: value,
      height: value,
    }),

    ////
    ///
    // Typography

    // font size
    fontPx: (value: number) => ({
      fontSize: `${value / 16}rem`,
    }),

    // letter spacing
    tracking: (value: string | Stitches.PropertyValue<'letterSpacing'>) => {
      switch (value) {
        case 'tighter':
          return ({ letterSpacing: '-0.05em' })
        case 'tight':
          return ({ letterSpacing: '-0.025em' })
        case 'normal':
          return ({ letterSpacing: '0em' })
        case 'wide':
          return ({ letterSpacing: '0.025em' })
        case 'wider':
          return ({ letterSpacing: '0.05em' })
        case 'widest':
          return ({ letterSpacing: '0.1em' })
        default:
          return ({ letterSpacing: value })
      }
    },

    // truncate
    truncate: () => ({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),

    // word break
    wordBreak: (value: string | Stitches.PropertyValue<'wordBreak'>) => {
      switch (value) {
        case 'normal':
          return ({ overflowWrap: 'normal', wordBreak: 'normal' })
        case 'words':
          return ({ overflowWrap: 'break-word' })
        case 'all':
          return ({ wordBreak: 'break-all' })
        default:
          return ({ wordBreak: value })
      }
    },

    ////
    ///
    // Layout

    // flex
    flexing: (value: string) => {
      switch (value) {
        case 'full':
          return ({ flex: '1 1 0%' })
        case 'auto':
          return ({ flex: '1 1 auto' })
        case 'initial':
          return ({ flex: '0 1 auto' })
        case 'none':
          return ({ flex: 'none' })
        default:
          return ({})
      }
    },

    // grid template columns
    gridCols: (value: number) => ({
      gridTemplateColumns: `repeat(${value}, minmax(0, 1fr))`,
    }),

    // grid column
    colSpan: (value: string | number) => {
      if (value === 'auto') { return ({ gridColumn: 'auto' }) }
      if (value === 'full') { return ({ gridColumn: '1 / -1' }) }
      if (typeof value === 'number' && value >= 1 && value <= 12) {
        return ({ gridColumn: `span ${value} / span ${value}` })
      }
      return ({ gridColumn: 'auto' })
    },

    ////
    ///
    // Misc
    
    // linear gradient
    linearGradient: (value: string) => ({
      backgroundImage: `linear-gradient(${value})`,
    }),
  },
})
