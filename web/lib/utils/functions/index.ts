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
  if (!items) return items
  return items.filter((v, i, a) => {
    return a.findIndex((v2) => v2[key] === v[key]) === i
  })
}

export const getRandomColor = (inputStr: string) => {
  const colors = [
    'magenta',
    'volcano',
    'orange',
    'gold',
    'lime',
    'green',
    'cyan',
    'blue',
    'geekblue',
    'purple',
  ]

  // Simple hash function
  const hashCode = (s: string) => {
    let hash = 0
    for (let i = 0; i < s.length; i++) {
      const char = s.charCodeAt(i)
      hash = (hash << 5) - hash + char
    }
    return hash
  }

  // Use the hash to get a consistent index
  const hashValue = hashCode(inputStr)
  const index = Math.abs(hashValue) % colors.length

  return colors[index]
}

export const formatBytes = (bytes: number) => {
  if (bytes < 1024) {
    return bytes + ' B'
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB'
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}
