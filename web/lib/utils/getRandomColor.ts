const getRandomColor = (inputStr: string) => {
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

export default getRandomColor
