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
  rabbitMqHost: string;
  pythonServiceQueue: string;
};

export const config: configType = {
  dbUrl: getEnv("DATABASE_URL"),
  rabbitMqHost: getEnv("RABBITMQ_HOST"),
  pythonServiceQueue: getEnv("PYTHON_SERVICE_QUEUE"),
};
