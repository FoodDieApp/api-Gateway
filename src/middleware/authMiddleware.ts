import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { failResponse } from "../utils/response";
import { JWT_TOKEN_NAME, Messages } from "../utils/constants";
const cookieParser = require("cookie-parser");
export interface AuthRequest extends Request {
  user?: string | object;
}

// Middleware to protect routes
export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;
  token = req.cookies[`${JWT_TOKEN_NAME}`];

  if (token) {
    try {
      const decoded = await verifyToken(token!);
      
      // Attach user to the request object (you can use this in your protected routes)
      req.user = decoded;
      next();
    } catch (err: any) {
      console.log("err", err);
      if (err) {
        if (err.name === Messages.Token_Expired_Error) {
          return failResponse(res, Messages.Token_Expired, 401);
        }
        return failResponse(res, Messages.Invalid_Token, 401);
      }
    }
  }
  if (!token) {
    return failResponse(res, Messages.Not_Authorized_No_Token, 401);
  }
};
