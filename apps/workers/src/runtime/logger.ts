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
  serviceName: process.env.POWERTOOLS_SERVICE_NAME ?? "noteship-workers",
  logLevel: resolveLogLevel(),
  sampleRate: resolveSampleRate(),
});

const baseContext = {
  environment: process.env.NOTESHIP_ENV_NAME,
};

if (baseContext.environment) {
  logger.appendKeys(baseContext);
}

export const appendJobContext = (context: {
  jobId?: string;
  jobType?: string;
  messageId?: string;
  userId?: string;
}): (() => void) => {
  const keys: Record<string, string> = {};
  if (context.jobId) {
    keys.jobId = context.jobId;
  }
  if (context.jobType) {
    keys.jobType = context.jobType;
  }
  if (context.messageId) {
    keys.messageId = context.messageId;
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
