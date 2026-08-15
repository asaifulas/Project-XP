import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FIELD_STYLE,
  NUDGE_STEP,
  NUDGE_STEP_FAST,
  clamp01,
  nudgePosition,
  textStyleFromField,
} from './fieldStyle.js'

describe('nudgePosition', () => {
  it('moves by 0.1% and 1% steps and clamps to the page', () => {
    expect(NUDGE_STEP).toBe(0.001)
    expect(NUDGE_STEP_FAST).toBe(0.01)
    expect(nudgePosition(0.5, 0.5, NUDGE_STEP, 0)).toEqual({ x: 0.501, y: 0.5 })
    expect(nudgePosition(0, 0, -NUDGE_STEP, -NUDGE_STEP)).toEqual({ x: 0, y: 0 })
    expect(nudgePosition(1, 1, NUDGE_STEP_FAST, NUDGE_STEP_FAST)).toEqual({ x: 1, y: 1 })
  })
})

describe('textStyleFromField', () => {
  it('fills Zone-style defaults', () => {
    expect(textStyleFromField({})).toMatchObject({
      fontSize: 14,
      letterSpacing: 0,
      bold: false,
      italic: false,
      color: '#000000',
      textAlign: 'left',
      rotate: 0,
      fontFamily: 'Arial',
    })
    expect(DEFAULT_FIELD_STYLE.fontSize).toBe(14)
  })

  it('keeps explicit style values', () => {
    expect(
      textStyleFromField({
        fontSize: 22,
        letterSpacing: 1.5,
        bold: true,
        italic: true,
        color: '#FF0000',
        textAlign: 'center',
        rotate: 15,
        fontFamily: 'Times New Roman',
      }),
    ).toMatchObject({
      fontSize: 22,
      letterSpacing: 1.5,
      bold: true,
      italic: true,
      color: '#FF0000',
      textAlign: 'center',
      rotate: 15,
      fontFamily: 'Times New Roman',
    })
  })
})

describe('clamp01', () => {
  it('clamps to 0..1', () => {
    expect(clamp01(-1)).toBe(0)
    expect(clamp01(2)).toBe(1)
    expect(clamp01(0.4)).toBe(0.4)
  })
})
