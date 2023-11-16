import { Model, Types } from "mongoose";

export interface IEntry {
  classification: "account" | "income" | "expense";
  main: string;
  sub?: string;
}

export interface ITransaction {
  debit: IEntry;
  credit: IEntry;
  amount: number;
  date: Date;
  user: Types.ObjectId;
}

export type TransactionModel = Model<ITransaction>;
