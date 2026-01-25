import { getAccessToken, getSession } from "@auth0/nextjs-auth0";

export const getUserSession = async () => {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Missing user session");
  }
  return session;
};

export const getApiAccessToken = async (): Promise<string> => {
  const audience = process.env.AUTH0_AUDIENCE;
  const { accessToken } = await getAccessToken(
    audience ? { authorizationParams: { audience } } : undefined,
  );
  if (!accessToken) {
    throw new Error("Missing access token");
  }
  return accessToken;
};
