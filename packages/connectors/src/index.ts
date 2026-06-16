import type { Connector, ConnectorConfig, ConnectorProvider } from "./types";
import { createLinkedInConnector } from "./providers/linkedin";

export type { Connector, ConnectorConfig, ConnectorProvider } from "./types";
export * from "./linkedin-content";
export * from "./linkedin-media";

export const createConnector = (
  provider: ConnectorProvider,
  config: ConnectorConfig,
): Connector => {
  if (provider === "linkedin") {
    return createLinkedInConnector(config);
  }

  throw new Error(`Unsupported connector provider: ${provider}`);
};
