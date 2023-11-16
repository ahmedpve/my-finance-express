import bcrypt from "bcryptjs";
import { HydratedDocument, Schema, model } from "mongoose";
import validator from "validator";
import { createToken, encryptToken } from "../lib/crypto";
import { IPasswordChange, IUser, IUserMethods, MoneyComponent, UserModel } from "./user.model.types";

const passwordChangeSubSchema = new Schema<IPasswordChange>({
  /* #7.1 */
  changedAt: {
    type: Date,
  },
  /* #7.2 */
  resetToken: {
    type: String,
  },
  /* #7.3 */
  resetTokenExpiresIn: {
    type: Date,
  },
});

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    /* #1 */
    name: {
      type: String,
      required: [true, "This field is required"],
      trim: true,
      minLength: [5, "This field must be at least 5 characters"],
      maxLength: [40, "This field must be at most 40 characters"],
      validate: {
        validator: function (val: string) {
          return validator.isAlphanumeric(val, "en-US", { ignore: " .-" });
        },
        message: "This field can contain only alphanumeric characters, spaces, dots, and dashes",
      },
    },
    /* #2 */
    email: {
      type: String,
      unique: true,
      required: [true, "This field is required"],
      trim: true,
      lowercase: true,
      maxLength: [100, "This field must be at most 100 characters"],
      validate: {
        validator: function (val: string) {
          return validator.isEmail(val);
        },
        message: (props: { value: string }) => `${props.value} is not a valid email address`,
      },
    },
    /* #3 */
    password: {
      type: String,
      required: [true, "This field is required"],
      minLength: [8, "This field must be at least 8 characters"],
      maxLength: [100, "This field must be at most 100 characters"],
      select: false,
    },
    /* #4 */
    image: {
      path: {
        type: String,
        trim: true,
        minLength: [2, "This field must be at least 2 characters"],
        maxLength: [100, "This field must be at most 100 characters"],
      },
    },
    /* #5 */
    accounts: {
      type: [{ _id: String, color: String, subs: [String] }],
      default: [
        { _id: "cash", color: "green", subs: [] },
        { _id: "bank", color: "red", subs: [] },
      ],
      validate: {
        validator: function (value: MoneyComponent[]) {
          return value.length > 1;
        },
        message: "There must be at least one account",
      },
    },
    /* #6 */
    categories: {
      /* #6.1 */
      income: {
        type: [{ _id: String, color: String, subs: [String] }],
        default: [
          { _id: "wages", color: "green", subs: [] },
          { _id: "interests & dividends", color: "green", subs: [] },
          { _id: "sale", color: "green", subs: [] },
          { _id: "rental income", color: "green", subs: [] },
          { _id: "refunds", color: "green", subs: [] },
          { _id: "gifts", color: "green", subs: [] },
        ],
        validate: {
          validator: function (value: MoneyComponent[]) {
            return value.length > 1;
          },
          message: "There must be at least one category",
        },
      },
      /* #6.2 */
      expense: {
        type: [{ _id: String, color: String, subs: [String] }],
        default: [
          { _id: "food & drinks", color: "red", subs: [] },
          { _id: "shopping", color: "cyan", subs: [] },
          { _id: "housing", color: "orange", subs: [] },
          { _id: "transportation", color: "slate", subs: [] },
          { _id: "life & entertainment", color: "yellow", subs: [] },
          { _id: "communication", color: "blue", subs: [] },
          { _id: "financial expenses", color: "blueviolet", subs: [] },
          { _id: "others", color: "grey", subs: [] },
        ],
        validate: {
          validator: function (value: MoneyComponent[]) {
            return value.length > 1;
          },
          message: "There must be at least one category",
        },
      },
    },
    /* #7 */
    passwordChange: {
      type: passwordChangeSubSchema,
      default: {},
      select: false,
    },
  },
  {
    virtuals: {
      transactions: {
        ref: "Transaction",
        localField: "_id",
        foreignField: "user",
      },
    },
  }
);

/* Methods */
userSchema.methods.isPasswordValid = async function (this: HydratedDocument<IUser>, inputPassword: string) {
  const isValid = await bcrypt.compare(inputPassword, this.password);
  return isValid;
};
userSchema.methods.generatePasswordResetToken = function (this: HydratedDocument<IUser>) {
  const passwordResetToken = createToken();
  const hashedPasswordResetToken = encryptToken(passwordResetToken);
  this.passwordChange.resetToken = hashedPasswordResetToken;
  this.passwordChange.resetTokenExpiresIn = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return passwordResetToken;
};
userSchema.methods.isPasswordResetTokenValid = function (this: HydratedDocument<IUser>, inputToken: string) {
  const hashedPasswordResetToken = encryptToken(inputToken);
  if (!this.passwordChange.resetToken || !this.passwordChange.resetTokenExpiresIn) return false;
  return (
    hashedPasswordResetToken === this.passwordChange.resetToken && this.passwordChange.resetTokenExpiresIn > new Date()
  );
};
userSchema.methods.resetPassword = function (this: HydratedDocument<IUser>, newPassword) {
  this.password = newPassword;
  this.passwordChange.resetToken = undefined;
  this.passwordChange.resetTokenExpiresIn = undefined;
};

/* Middlewares */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const hashedPassword = await bcrypt.hash(this.password, 12);
  this.password = hashedPassword;
  if (!this.isNew) this.passwordChange.changedAt = new Date();
});

const User = model("User", userSchema);

export default User;
