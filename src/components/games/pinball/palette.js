/**
 * Colors sampled from Microsoft 3D Pinball: Space Cadet (Windows XP).
 * Placement stays ours; materials/tones match the original table & side panel.
 */
export const SC = {
  // Window / void
  void: '#010101',

  // Playfield (navy marble)
  fieldDeep: '#0c101c',
  field: '#1c2040',
  fieldMid: '#202848',
  fieldLite: '#242c4c',
  fieldVein: '#181c3c',
  fieldEdge: '#14182c',

  // Purple plastics (ramp / launch / apron star)
  purple: '#8c70ac',
  purpleLite: '#a888c8',
  purpleBright: '#b494d4',
  purpleTitle: '#c0a4ec',
  purpleDark: '#5c4878',
  purpleStar: '#74548c',
  purpleStarDeep: '#543868',

  // Lights
  yellow: '#fcf850',
  yellowHot: '#fcf860',
  yellowDim: '#c8a020',
  red: '#d02830',
  redHot: '#f04040',
  redDim: '#801820',
  missionBlue: '#53a6cc',
  missionBlueHot: '#5eafd3',
  missionBlueDeep: '#429dc8',

  // Pop bumpers (white mushroom + colored caps)
  bumperWhite: '#fcf0e8',
  bumperHi: '#fff8f0',
  bumperShade: '#c8b0a0',
  bumperBase: '#e8c878',
  bumperBaseDark: '#a88840',
  capRed: '#e03838',
  capRedMid: '#f87868',
  capBlue: '#3870d0',
  capBlueMid: '#78a8f0',
  capGreen: '#28a850',
  capGreenMid: '#68e090',
  capYellow: '#e8c020',
  capYellowMid: '#f8e868',

  // Rails / chrome (silver — XP table metal, not neon cyan)
  rail: '#a8aeb8',
  railHi: '#d8dce4',
  railDark: '#686e78',

  // Cabinet metal (side panel / outer frame)
  metalLite: '#c0c0bc',
  metal: '#949494',
  metalMid: '#6c6864',
  metalDark: '#484848',
  metalDeep: '#303030',
  bevelHi: '#dfdfdf',
  bevelLo: '#404040',

  // Plunge / chute
  chute: '#6c4434',
  chuteMid: '#8c5844',
  chuteDark: '#3c2818',
  chuteEdge: '#a86850',

  // Flippers (white bat, red tip — XP table)
  flipper: '#e8e8f0',
  flipperMid: '#c0c0cc',
  flipperDark: '#787888',
  flipperTip: '#c02838',
  flipperTipHot: '#e84858',
  flipperPivot: '#d04060',

  // Ball
  ballHi: '#ffffff',
  ball: '#d8dce4',
  ballDark: '#687078',

  // LED / readout (side panel)
  led: '#70c0e0',
  ledDim: '#3a7088',
  ledBall: '#d03040',
  panelInset: '#101010',
  status: '#68a8c8',

  // Wormhole / crater
  hole: '#12182c',
  holeRim: '#2a3858',
}

export const CAP = {
  red: { rim: SC.capRed, mid: SC.capRedMid, core: '#ffe0d0' },
  blue: { rim: SC.capBlue, mid: SC.capBlueMid, core: '#e0ecff' },
  green: { rim: SC.capGreen, mid: SC.capGreenMid, core: '#e0ffe8' },
  yellow: { rim: SC.capYellow, mid: SC.capYellowMid, core: '#fff8d0' },
}
