const getEnv = (
  varName: string,
  required: boolean = true,
  defaultValue?: string
): string => {
  const value = process.env[varName]

  if (required && !value) {
    if (defaultValue != undefined) return defaultValue
    throw new Error(`Couldn't find environment variable: ${varName}`)
  }
  return value === undefined ? 'NOT SET' : value
}

type configType = {
  dbUrl: string
  redisHost: string
  redisPort: number
  nextToPythonQueue: string
  pythonToNextQueue: string
  serviceApiKey: string
}

export const config: configType = {
  dbUrl: getEnv('DATABASE_URL'),
  redisHost: getEnv('REDIS_HOST'),
  redisPort: Number(getEnv('REDIS_PORT')),
  nextToPythonQueue: getEnv('NEXT_TO_PYTHON_QUEUE'),
  pythonToNextQueue: getEnv('PYTHON_TO_NEXT_QUEUE'),
  serviceApiKey: getEnv('SERVICE_API_KEY'),
}
