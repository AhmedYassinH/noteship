import type { Connector, ConnectorConfig } from "../types";

const DEFAULT_SCOPES = ["r_liteprofile", "w_member_social"];

export const createLinkedInConnector = (config: ConnectorConfig): Connector => {
  return {
    provider: "linkedin",
    buildOAuthUrl({ state, redirectUrl }) {
      if (!redirectUrl) {
        throw new Error("LinkedIn redirectUrl is required");
      }

      const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
      url.searchParams.set("response_type", "code");
      url.searchParams.set("client_id", config.clientId);
      url.searchParams.set("redirect_uri", redirectUrl);
      url.searchParams.set("state", state);
      url.searchParams.set("scope", DEFAULT_SCOPES.join(" "));

      return url.toString();
    },
    async exchangeCode() {
      throw new Error("LinkedIn OAuth exchange not implemented");
    },
    async publishPost() {
      throw new Error("LinkedIn publish not implemented");
    },
  };
};
