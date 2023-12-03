export const globalDateFormatParser = (date: Date) => {
  date = new Date(date)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date)
}

export const getUniqueItemsByProperties = (items: any[], key: string) => {
  return items.filter((v, i, a) => {
    return a.findIndex((v2) => v2[key] === v[key]) === i
  })
}
