/** Parses a positive integer route param like /anime/[id]; returns null when invalid. */
export function parseId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}
