import { NextFunction, Response } from "express";
import OperationalError from "../lib/operational-error";
import { Transaction } from "../models";
import { ITransaction } from "../models/transaction.model.types";
import { CustomRequest } from "./controllers.types";

export const getTransactions = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.locals?.authenticatedUser;
    if (!user) {
      return next(new OperationalError(404, "No authenticated user was found."));
    }
    const transactions = await Transaction.find({ user: user._id });

    res.status(200).json({
      statusMessage: "Success",
      data: {
        transactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.locals?.authenticatedUser;
    if (!user) {
      return next(new OperationalError(404, "No authenticated user was found."));
    }
    const { debit, credit, amount, date } = req.body;
    if (!debit || !credit || !amount || !date) {
      return next(
        new OperationalError(400, "Debit, credit, amount, and date fields are required for creating a new transaction.")
      );
    }
    const transaction = await Transaction.create({ debit, credit, amount, date, user: user._id });

    res.status(200).json({
      statusMessage: "Success",
      data: {
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.locals?.authenticatedUser;
    if (!user) {
      return next(new OperationalError(404, "No authenticated user was found."));
    }
    const { transactionId } = req.params;
    const transaction = await Transaction.findOne({ _id: transactionId });
    if (!transaction) {
      return next(new OperationalError(404, `No transaction was found with this id "${transactionId}".`));
    }
    const allowedFields: (keyof ITransaction)[] = ["debit", "credit", "amount", "date"];
    allowedFields.forEach((field) => {
      if (req.body[field]) {
        transaction[field] = req.body[field];
      }
    });
    await transaction.save();

    res.status(200).json({
      statusMessage: "Success",
      data: {
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.locals?.authenticatedUser;
    if (!user) {
      return next(new OperationalError(404, "No authenticated user was found."));
    }
    const { transactionId } = req.params;
    await Transaction.deleteOne({ _id: transactionId });

    res.status(204).json({
      statusMessage: "Success",
      message: "A transaction has been deleted.",
    });
  } catch (error) {
    next(error);
  }
};
