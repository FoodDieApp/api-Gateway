import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import dotenv from "dotenv";

dotenv.config();

const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM!;
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID!;
const COOKIE_NAME = process.env.COOKIE_NAME!;

const client = jwksClient({
  jwksUri: `http://127.0.0.1:8080/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`,
  requestHeaders: {}, // optional
  timeout: 30000,
});

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err, null);
    if (!key || typeof (key as any).getPublicKey !== "function") {
      return callback(new Error("Signing key not found"), null);
    }
    const signingKey = (key as any).getPublicKey();
    callback(null, signingKey);
  });
}

// Middleware factory to enforce optional roles
export const keycloakAuth = (requiredRoles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "No token in cookie" });

    console.log('token',token)
    jwt.verify(token, getKey, {}, (err, decoded: any) => {
        console.log('err',err)
      if (err) return res.status(401).json({ message: "Invalid token" });

      // check client roles
      const clientRoles = decoded.resource_access?.[KEYCLOAK_CLIENT_ID]?.roles || [];

      if (
        requiredRoles.length > 0 &&
        !requiredRoles.some((r) => clientRoles.includes(r))
      ) {
        return res.status(403).json({ message: "Forbidden: role required" });
      }

      // attach decoded token to request
      (req as any).user = decoded;

      next();
    });
  };
};
