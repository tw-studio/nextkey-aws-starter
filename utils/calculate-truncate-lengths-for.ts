////
///
// utils › calculate-truncate-lengths-for.ts

import { theme } from '@/stitches.config'
import { BreakpointLengths, BreakpointNames } from '@/types'

/**
 * Calculates truncate lengths for a given string at mobile, largeMobile, desktop,
 * mid, and full breakpoints.
 * 
 * @param inputText Text to calculate truncate lengths for
 * @param targetLines Target number of lines before truncating (between 1 and 99)
 * @param textPadding Padding in pixels (default: 40)
 * 
 * @returns BreakpointLengths object keyed by mobile, largeMobile, desktop, mid, 
 * and full breakpoint names.
 */
export default function calculateTruncateLengthsFor(
  inputText: string,
  targetLines: number,
  textPadding: number = 40,
): BreakpointLengths | undefined {

  // |0| Guards
  
  if (!(typeof inputText === 'string' && inputText.length > 0)) { return undefined }
  if (!(typeof targetLines === 'number' && targetLines > 0 && targetLines < 100)) { return undefined }

  // |1| Declare constants

  const deNewlinedInputText = inputText.replace(/\s\s+/g, ' ')
  const charSafetyBuffer = 40
  const pixelsPerCharacter = 7.86979 // TODO: calculate programmatically using fontSize and lineHeight

  const breakpoints: readonly BreakpointNames[] = ['mobile', 'largeMobile', 'desktop', 'mid', 'full'] as const
  const textWidthsByBreakpoint = [
    380 - textPadding,
    580 - textPadding,
    parseInt(theme.space.contentWidthDesktop.value, 10) - textPadding,
    parseInt(theme.space.contentWidthMid.value, 10) - textPadding,
    parseInt(theme.space.contentWidthFull.value, 10) - textPadding,
  ]

  // |2| Calculate max character lengths by breakpoint

  const charsPerLineByBreakpoint = textWidthsByBreakpoint.map((textWidth) => (
    Math.floor(textWidth / pixelsPerCharacter)
  ))
  const maxLengthsByBreakpoint = charsPerLineByBreakpoint.map((charsPerLine) => (
    charsPerLine * targetLines - charSafetyBuffer
  ))

  // |3| Adjust length to end of previous word

  const deNewlinedTextByBreakpoint = maxLengthsByBreakpoint.map((maxLength) => (
    deNewlinedInputText.slice(0, maxLength)
  ))

  const adjustedLengthsByBreakpoint = deNewlinedTextByBreakpoint.map((deNewlinedText, i) => {
    if (deNewlinedText.length < inputText.length) {
      if (deNewlinedText.lastIndexOf(' ') !== -1) {
        return deNewlinedText.lastIndexOf(' ')
      }
    }
    return maxLengthsByBreakpoint[i]
  })

  // |4| Return lengths in object keyed by breakpoint name

  const returnLengths: BreakpointLengths = {} as BreakpointLengths
  breakpoints.forEach((breakpoint, i) => {
    returnLengths[breakpoint] = adjustedLengthsByBreakpoint[i]
  })

  return returnLengths
}
