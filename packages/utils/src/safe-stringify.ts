type SafeStringifyOptions = {
  maxDepth?: number;
  maxStringLength?: number;
  maxArrayLength?: number;
  maxObjectKeys?: number;
  maxOutputLength?: number;
};

const DEFAULT_OPTIONS: Required<SafeStringifyOptions> = {
  maxDepth: 5,
  maxStringLength: 1000,
  maxArrayLength: 50,
  maxObjectKeys: 50,
  maxOutputLength: 4000,
};

const truncate = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}...(truncated)`;
};

const sanitizeValue = (
  value: unknown,
  depth: number,
  options: Required<SafeStringifyOptions>,
  seen: WeakSet<object>,
): unknown => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === "string") {
    return truncate(value, options.maxStringLength);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "bigint") {
    return `${value}n`;
  }

  if (typeof value === "symbol" || typeof value === "function") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Error) {
    return {
      message: value.message,
      stack: value.stack,
      name: value.name,
    };
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[Circular]";
    }
    if (depth >= options.maxDepth) {
      return "[MaxDepth]";
    }

    seen.add(value);

    if (Array.isArray(value)) {
      const trimmed = value
        .slice(0, options.maxArrayLength)
        .map((item) => sanitizeValue(item, depth + 1, options, seen));
      const remaining = value.length - trimmed.length;
      if (remaining > 0) {
        trimmed.push(`[+${remaining} more items]`);
      }
      return trimmed;
    }

    const result: Record<string, unknown> = {};
    const keys = Object.keys(value);
    const limitedKeys = keys.slice(0, options.maxObjectKeys);
    for (const key of limitedKeys) {
      const entry = (value as Record<string, unknown>)[key];
      result[key] = sanitizeValue(entry, depth + 1, options, seen);
    }
    const remaining = keys.length - limitedKeys.length;
    if (remaining > 0) {
      result.__truncated__ = `+${remaining} keys`;
    }
    return result;
  }

  return String(value);
};

export const safeStringify = (value: unknown, options?: SafeStringifyOptions): string => {
  const merged = { ...DEFAULT_OPTIONS, ...options };
  try {
    const sanitized = sanitizeValue(value, 0, merged, new WeakSet<object>());
    const json = JSON.stringify(sanitized);
    return truncate(json, merged.maxOutputLength);
  } catch {
    return String(value);
  }
};

export type { SafeStringifyOptions };
