/** Excel 2003-style used range: A–IV columns, thousands of rows. */
export const GRID_COLS = 256
export const GRID_ROWS = 4096
export const COL_W = 100
export const ROW_H = 20
export const COL_HEADER_H = 22
export const ROW_HEADER_W = 40

export function colLetter(index) {
  let n = index
  let name = ''
  while (n >= 0) {
    name = String.fromCharCode((n % 26) + 65) + name
    n = Math.floor(n / 26) - 1
  }
  return name
}
