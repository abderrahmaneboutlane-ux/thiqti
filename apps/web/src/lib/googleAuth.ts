import { createRemoteJWKSet, jwtVerify } from "jose";

const GOOGLE_CERTS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const JWKS = createRemoteJWKSet(new URL(GOOGLE_CERTS_URL));

export interface GoogleUser {
  sub: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

/**
 * Verifie un ID token Google (Google Identity Services) avec les clefs
 * publiques de Google (RS256). Aucun secret n'est necessaire cote serveur.
 */
export async function verifyGoogleIdToken(
  idToken: string,
  clientId: string
): Promise<GoogleUser | null> {
  try {
    const { payload } = await jwtVerify(idToken, JWKS, {
      audience: clientId,
      issuer: ["https://accounts.google.com", "accounts.google.com"],
    });

    if (typeof payload.email !== "string" || payload.email_verified !== true) {
      return null;
    }

    return {
      sub: typeof payload.sub === "string" ? payload.sub : "",
      email: payload.email,
      emailVerified: payload.email_verified === true,
      name: typeof payload.name === "string" ? payload.name : undefined,
      picture: typeof payload.picture === "string" ? payload.picture : undefined,
    };
  } catch (err) {
    console.error("Google ID token verification failed:", err);
    return null;
  }
}
