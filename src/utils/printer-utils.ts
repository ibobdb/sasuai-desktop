export function getPaperWidthMm(paperSize: string): number {
  const widthMap: Record<string, number> = {
    '44mm': 44,
    '57mm': 57,
    '58mm': 58,
    '76mm': 76,
    '78mm': 78,
    '80mm': 80
  }
  return widthMap[paperSize] || 58
}

export function mmToMicrons(mm: number): number {
  return Math.round(mm * 1000)
}

export function parseMarginString(marginString: string): {
  top: number
  right: number
  bottom: number
  left: number
} {
  const margins = marginString
    .trim()
    .split(/\s+/)
    .map((val) => parseFloat(val) || 0)

  if (margins.length === 1) {
    return { top: margins[0], right: margins[0], bottom: margins[0], left: margins[0] }
  } else if (margins.length === 2) {
    return { top: margins[0], right: margins[1], bottom: margins[0], left: margins[1] }
  } else if (margins.length === 3) {
    return { top: margins[0], right: margins[1], bottom: margins[2], left: margins[1] }
  } else if (margins.length >= 4) {
    return { top: margins[0], right: margins[1], bottom: margins[2], left: margins[3] }
  }

  return { top: 0, right: 0, bottom: 0, left: 0 }
}
