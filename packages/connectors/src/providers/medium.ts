import type { Connector, ConnectorConfig } from "../types";

const DEFAULT_SCOPES = ["basicProfile", "publishPost"];

export const createMediumConnector = (config: ConnectorConfig): Connector => {
  return {
    provider: "medium",
    buildOAuthUrl({ state, redirectUri }) {
      if (!redirectUri) {
        throw new Error("Medium redirectUri is required");
      }

      const url = new URL("https://medium.com/m/oauth/authorize");
      url.searchParams.set("response_type", "code");
      url.searchParams.set("client_id", config.clientId);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("state", state);
      url.searchParams.set("scope", DEFAULT_SCOPES.join(","));

      return url.toString();
    },
    async exchangeCode() {
      throw new Error("Medium OAuth exchange not implemented");
    },
    async publishPost() {
      throw new Error("Medium publish not implemented");
    },
  };
};
