const getEnv = (
  varName: string,
  required: boolean = true,
  defaultValue?: string
): string => {
  const value = process.env[varName];

  if (required && !value) {
    if (defaultValue != undefined) return defaultValue;
    throw new Error(`Couldn't find environment variable: ${varName}`);
  }
  return value === undefined ? "NOT SET" : value;
};

type configType = {
  dbUrl: string;
  redisHost: string;
  redisPort: number;
  pythonConsumerQueue: string;
  assetUploadPath: string;
  serviceApiKey: string;
};

export const config: configType = {
  dbUrl: getEnv("DATABASE_URL"),
  redisHost: getEnv("REDIS_HOST"),
  redisPort: Number(getEnv("REDIS_PORT")),
  pythonConsumerQueue: getEnv("PYTHON_CONSUMER_QUEUE"),
  assetUploadPath: getEnv("ASSET_UPLOAD_PATH"),
  serviceApiKey: getEnv("SERVICE_API_KEY"),
};
