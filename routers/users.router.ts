import { Router } from "express";
import {
  authenticateUser,
  createUser,
  forgotPassword,
  getAuthenticatedUser,
  resetPassword,
  updatePassword,
  updateUser,
} from "../controllers/users.controllers";
import { checkAuthentication } from "../middlewares/auth.middlewares";

const usersRouter = Router();

usersRouter.route("/signup").post(createUser);
usersRouter.route("/signin").post(authenticateUser);
usersRouter.route("/forgot-password").post(forgotPassword);
usersRouter.route("/reset-password/:resetToken").patch(resetPassword);
usersRouter.use(checkAuthentication);
usersRouter.route("/my-account").get(getAuthenticatedUser).patch(updateUser);
usersRouter.route("/update-password").patch(updatePassword);

export default usersRouter;
