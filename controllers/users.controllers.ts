import { NextFunction, Request, Response } from "express";
import { signJwtToken } from "../lib/jwt";
import OperationalError from "../lib/operational-error";
import { User } from "../models";
import { IUser } from "../models/user.model.types";
import { CustomRequest } from "./controllers.types";

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return next(
        new OperationalError(400, "Name, email, and password fields are required for creating a new account.")
      );
    }
    const user = await User.create({ name, email, password });

    res.status(201).json({
      statusMessage: "Success",
      message: "Your account has been created successfully. Please sign in with your email and password.",
    });
  } catch (error) {
    next(error);
  }
};

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new OperationalError(400, "Email and password fields are required for user authentication."));
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.isPasswordValid(password))) {
      return next(new OperationalError(401, "The email or password or both are invalid."));
    }
    const accessToken = signJwtToken({ id: user._id.toString() });
    user.password = "";

    res.status(200).json({
      statusMessage: "Success",
      data: {
        user,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAuthenticatedUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = await req.locals?.authenticatedUser.populate("transactions");
    if (!user) {
      return next(new OperationalError(404, "No authenticated user was found."));
    }
    user.password = "";

    res.status(200).json({
      statusMessage: "Success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.locals?.authenticatedUser;
    if (!user) {
      return next(new OperationalError(404, "No authenticated user was found."));
    }
    const allowedFields: (keyof IUser)[] = ["name", "email", "image"];
    allowedFields.forEach((field) => {
      if (req.body[field]) {
        user[field] = req.body[field];
      }
    });
    await user.save();
    user.password = "";

    res.status(200).json({
      statusMessage: "Success",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.locals?.authenticatedUser;
    if (!user) {
      return next(new OperationalError(404, "No authenticated user was found."));
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(
        new OperationalError(400, "Current password and new password fields are required to update your password.")
      );
    }
    if (!(await user.isPasswordValid(currentPassword))) {
      return next(new OperationalError(401, "The current password is invalid."));
    }
    user.password = newPassword;
    await user.save();
    user.password = "";

    res.status(200).json({
      statusMessage: "Success",
      message: "Your password has been changed successfully. Please sign in with the new password.",
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new OperationalError(400, "The email field is required to reset your password."));
    }
    const user = await User.findOne({ email }).select("+passwordChange");
    if (!user) {
      return next(new OperationalError(404, `No user was found with this email "${email}".`));
    }
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    const passwordResetServerUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}/reset-password/${resetToken}`;
    // const passwordResetClientUrl = `${process.env.CLIENT_HOST}/users/resetpassword/${resetToken}`;

    res.status(200).json({
      statusMessage: "Success",
      // message: "A password reset URL has been sent to your email.",
      data: {
        passwordResetUrl: passwordResetServerUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resetToken } = req.params;
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return next(new OperationalError(400, "Email and new password fields are required to reset your password."));
    }
    const user = await User.findOne({ email }).select("+passwordChange");
    if (!user) {
      return next(new OperationalError(404, `No user was found with this email "${email}".`));
    }
    if (!user.isPasswordResetTokenValid(resetToken)) {
      return next(new OperationalError(401, "The password reset token is not valid or has expired."));
    }
    user.resetPassword(newPassword);
    await user.save();

    res.status(200).json({
      statusMessage: "Success",
      message: "Your password has been changed successfully. Please sign in with the new password.",
    });
  } catch (error) {
    next(error);
  }
};
