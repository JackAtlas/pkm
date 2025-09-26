export function capitalize(name: string): string {
  return [
    name[0].toUpperCase(),
    name.substring(1).toLowerCase()
  ].join('')
}
