import { NextFunction, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { CustomRequest } from "../controllers/controllers.types";
import { verifyJwtToken } from "../lib/jwt";
import OperationalError from "../lib/operational-error";
import { User } from "../models";

export const checkAuthentication = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const accessToken =
      req.headers.authorization && req.headers.authorization.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null;
    if (!accessToken) {
      return next(new OperationalError(401, "You are not signed in. Please sign in to access this route."));
    }
    const decodedAccessToken = (await verifyJwtToken(accessToken)) as JwtPayload;
    const user = await User.findOne({ _id: decodedAccessToken.id }).select(["+password", "+passwordChange"]);
    if (!user) {
      return next(new OperationalError(404, "No user is associated with this access token."));
    }
    if (decodedAccessToken.iat && user.passwordChange.changedAt) {
      if (decodedAccessToken.iat * 1000 < user.passwordChange.changedAt.getTime() - 5000) {
        return next(
          new OperationalError(401, "The access token is no longer valid because you changed your password.")
        );
      }
    }
    req.locals = { authenticatedUser: user };
    next();
  } catch (error) {
    next(error);
  }
};
