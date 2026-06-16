export type ConnectorProvider = "linkedin";

export type ConnectorConfig = {
  clientId: string;
  clientSecret: string;
  apiVersion?: string;
};

export type OAuthStartInput = {
  state: string;
  redirectUri?: string;
};

export type OAuthExchangeInput = {
  code: string;
  redirectUri?: string;
};

export type ConnectorCredentials = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  refreshTokenExpiresAt?: string;
};

export type OAuthExchangeResult = {
  accountId: string;
  credentials: ConnectorCredentials;
  scopes?: string[];
  providerMetadata?: Record<string, string>;
};

export type PublishPostInput = {
  accountId: string;
  accessToken: string;
  content: string;
  media?:
    | {
        type: "images";
        images: Array<{
          bytes: ArrayBuffer;
          contentType: string;
          altText?: string;
        }>;
      }
    | {
        type: "pdf";
        pdf: {
          bytes: ArrayBuffer;
          contentType: string;
          title?: string;
        };
      };
};

export type PublishPostResult = {
  remoteId: string;
};

export type PublishCommentInput = {
  accountId: string;
  accessToken: string;
  parentId: string;
  content: string;
};

export type PublishCommentResult = {
  remoteId: string;
};

export type Connector = {
  provider: ConnectorProvider;
  buildOAuthUrl: (_input: OAuthStartInput) => string;
  exchangeCode: (_input: OAuthExchangeInput) => Promise<OAuthExchangeResult>;
  publishPost: (_input: PublishPostInput) => Promise<PublishPostResult>;
  publishComment?: (_input: PublishCommentInput) => Promise<PublishCommentResult>;
};
