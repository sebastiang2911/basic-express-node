import { OAuth2Client } from "google-auth-library";

const googleClientId = process.env.GOOGLE_CLIENT_ID;

if (!googleClientId) {
  throw new Error("GOOGLE_CLIENT_ID is not defined");
}

const client = new OAuth2Client(googleClientId);

export const googleVerify = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload?.email || !payload.name) {
    throw new Error("Google token does not contain the required user data");
  }

  return {
    googleId: payload.sub,
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
  };
};
