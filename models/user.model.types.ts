import { Model, Types } from "mongoose";

export type MoneyComponent = { _id: string; color: string; subs: string[] };

export interface IPasswordChange {
  changedAt: Date;
  resetToken: string | undefined;
  resetTokenExpiresIn: Date | undefined;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  image: {
    path: string;
  };
  accounts: Types.Array<MoneyComponent>;
  categories: {
    income: Types.Array<MoneyComponent>;
    expense: Types.Array<MoneyComponent>;
  };
  passwordChange: IPasswordChange;
}

export interface IUserMethods {
  isPasswordValid: (inputPassword: string) => Promise<boolean>;
  generatePasswordResetToken: () => string;
  isPasswordResetTokenValid: (inputToken: string) => boolean;
  resetPassword: (newPassword: string) => void;
}

export type UserModel = Model<IUser, {}, IUserMethods>;
