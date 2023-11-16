import { Request } from "express";
import { HydratedDocument } from "mongoose";
import { IUser, IUserMethods } from "../models/user.model.types";

export interface CustomRequest extends Request {
  locals?: { authenticatedUser: HydratedDocument<IUser, IUserMethods> };
}
