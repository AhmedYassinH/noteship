"use client";

import type { Auth0Client, User } from "@auth0/auth0-spa-js";

const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? "";
const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ?? "";
const auth0Audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE ?? "";
const auth0RedirectUri = process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI ?? "";
const auth0LogoutRedirectUri = process.env.NEXT_PUBLIC_AUTH0_LOGOUT_REDIRECT_URI ?? "";

let clientPromise: Promise<Auth0Client> | null = null;

const getClient = () => {
  if (typeof window === "undefined") {
    throw new Error("Auth0 SPA client must be used in the browser.");
  }

  if (!clientPromise) {
    clientPromise = import("@auth0/auth0-spa-js").then((mod) =>
      mod.createAuth0Client({
        domain: auth0Domain,
        clientId: auth0ClientId,
        cacheLocation: "localstorage",
        useRefreshTokens: false,
        authorizationParams: {
          audience: auth0Audience || undefined,
          redirect_uri: auth0RedirectUri || undefined,
          scope: "openid profile email",
        },
      }),
    );
  }

  return clientPromise;
};

export const getAccessToken = async () => {
  const client = await getClient();
  return client.getTokenSilently();
};

export const getUserProfile = async (): Promise<User | undefined> => {
  const client = await getClient();
  return client.getUser();
};

export const isAuthenticated = async (): Promise<boolean> => {
  const client = await getClient();
  return client.isAuthenticated();
};

export const loginWithRedirect = async (returnTo?: string) => {
  const client = await getClient();
  await client.loginWithRedirect({
    appState: returnTo ? { returnTo } : undefined,
    authorizationParams: {
      redirect_uri: auth0RedirectUri || undefined,
      audience: auth0Audience || undefined,
    },
  });
};

export const handleAuthCallback = async (): Promise<string | undefined> => {
  const client = await getClient();
  const { appState } = await client.handleRedirectCallback();
  return appState?.returnTo as string | undefined;
};

export const logout = async () => {
  const client = await getClient();
  await client.logout({
    logoutParams: {
      returnTo: auth0LogoutRedirectUri || undefined,
    },
  });
};
