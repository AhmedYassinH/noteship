export type ConnectorProvider = "linkedin" | "medium";

export type ConnectorConfig = {
  clientId: string;
  clientSecret: string;
};

export type OAuthStartInput = {
  state: string;
  redirectUrl?: string;
};

export type OAuthExchangeInput = {
  code: string;
  redirectUrl?: string;
};

export type OAuthExchangeResult = {
  accountId: string;
  tokenRef: string;
  scopes?: string[];
  providerMetadata?: Record<string, string>;
};

export type PublishPostInput = {
  accountId: string;
  accessToken: string;
  content: string;
};

export type PublishPostResult = {
  remoteId: string;
};

export type Connector = {
  provider: ConnectorProvider;
  buildOAuthUrl: (_input: OAuthStartInput) => string;
  exchangeCode: (_input: OAuthExchangeInput) => Promise<OAuthExchangeResult>;
  publishPost: (_input: PublishPostInput) => Promise<PublishPostResult>;
};
