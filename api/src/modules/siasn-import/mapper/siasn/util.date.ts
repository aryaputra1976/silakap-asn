export const parseDate = (value?: string) => {
  if (!value) return null
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}
