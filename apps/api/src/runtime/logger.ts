import { Logger } from "@aws-lambda-powertools/logger";

const resolveLogLevel = (): string | undefined =>
  process.env.POWERTOOLS_LOG_LEVEL ?? process.env.LOG_LEVEL;

const resolveSampleRate = (): number | undefined => {
  const raw = process.env.POWERTOOLS_LOGGER_SAMPLE_RATE;
  if (!raw) {
    return undefined;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const logger = new Logger({
  serviceName: process.env.POWERTOOLS_SERVICE_NAME ?? "noteship-api",
  logLevel: resolveLogLevel(),
  sampleRate: resolveSampleRate(),
});

const baseContext = {
  environment: process.env.NOTESHIP_ENV_NAME,
};

if (baseContext.environment) {
  logger.appendKeys(baseContext);
}

export const appendRequestContext = (context: {
  requestId?: string;
  userId?: string;
}): (() => void) => {
  const keys: Record<string, string> = {};
  if (context.requestId) {
    keys.requestId = context.requestId;
  }
  if (context.userId) {
    keys.userId = context.userId;
  }

  const appendedKeys = Object.keys(keys);
  if (appendedKeys.length > 0) {
    logger.appendKeys(keys);
  }

  return () => {
    if (appendedKeys.length > 0) {
      logger.removeKeys(appendedKeys);
    }
  };
};
