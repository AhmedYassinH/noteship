import type { Connector, ConnectorConfig, ConnectorProvider } from "./types";
import { createLinkedInConnector } from "./providers/linkedin";
import { createMediumConnector } from "./providers/medium";

export type { Connector, ConnectorConfig, ConnectorProvider } from "./types";
export * from "./linkedin-content";

export const createConnector = (
  provider: ConnectorProvider,
  config: ConnectorConfig,
): Connector => {
  if (provider === "linkedin") {
    return createLinkedInConnector(config);
  }

  if (provider === "medium") {
    return createMediumConnector(config);
  }

  throw new Error(`Unsupported connector provider: ${provider}`);
};
