import { Schema, model } from "mongoose";
import OperationalError from "../lib/operational-error";
import { User } from "./index";
import { IEntry, ITransaction } from "./transaction.model.types";

const entrySchema = new Schema<IEntry>({
  classification: {
    type: String,
    required: [true, "This field is required"],
    enum: {
      values: ["account", "income", "expense"],
      message: `This field must only be "account", "income", or "expense"`,
    },
  },
  main: {
    type: String,
    required: [true, "This field is required"],
  },
  sub: {
    type: String,
  },
});

const transactionSchema = new Schema<ITransaction>({
  /* #1 */
  debit: {
    type: entrySchema,
    required: [true, "This field is required"],
  },
  /* #2 */
  credit: {
    type: entrySchema,
    required: [true, "This field is required"],
  },
  /* #3 */
  amount: {
    type: Number,
    required: [true, "This field is required"],
    set: function (val: number) {
      let valStr = val.toString();
      if (valStr[valStr.length - 1] === "5") {
        valStr = valStr.slice(0, -1) + "6";
      }
      return Math.round(+valStr * 10) / 10;
    },
  },
  /* #4 */
  date: {
    type: Date,
    required: [true, "This field is required"],
    validate: {
      validator: function (val: Date) {
        return val <= new Date();
      },
      message: "This field must be less than or equal to the current date",
    },
  },
  /* #5 */
  user: {
    type: Schema.Types.ObjectId,
    required: [true, "This field is required"],
  },
});

/* Middlewares */
transactionSchema.pre("save", async function (next) {
  const user = await User.findById(this.user);
  if (!user) {
    return next(new OperationalError(404, `No user was found with this id "${this.user}".`));
  }
  const getClassificationValidateError = (entry: "debit" | "credit") => {
    const classification = this[entry].classification;
    const searchArr = classification === "account" ? user.accounts : user.categories[classification];
    const isSupportedByUser = searchArr.some(
      (i) => i._id === this[entry].main && i.subs.find((s) => s === this[entry].sub)
    );
    if (!isSupportedByUser) {
      return `The user doesn't have a registered ${classification} with these details "${this[entry].main}/${this[entry].sub}".`;
    } else {
      return "";
    }
  };
  const debitClassificationError = getClassificationValidateError("debit");
  const creditClassificationError = getClassificationValidateError("credit");
  if (debitClassificationError || creditClassificationError) {
    return next(new OperationalError(404, debitClassificationError || creditClassificationError));
  }
  next();
});

transactionSchema.index({ user: 1 });

const Transaction = model("Transaction", transactionSchema);

export default Transaction;
