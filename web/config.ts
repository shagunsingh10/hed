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
  ingestionTaskQueue: string
  queryTaskQueue: string
  ingestionResultQueue: string
  queryResultQueue: string
  serviceApiKey: string
}

export const config: configType = {
  dbUrl: getEnv('DATABASE_URL'),
  redisHost: getEnv('REDIS_HOST'),
  redisPort: Number(getEnv('REDIS_PORT')),
  ingestionTaskQueue: getEnv('INGESTION_TASK_QUEUE'),
  queryTaskQueue: getEnv('QUERY_TASK_QUEUE'),
  ingestionResultQueue: getEnv('INGESTION_RESULT_QUEUE'),
  queryResultQueue: getEnv('QUERY_RESULT_QUEUE'),
  serviceApiKey: getEnv('SERVICE_API_KEY'),
}
