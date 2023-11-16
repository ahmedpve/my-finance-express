import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../controllers/transactions.controllers";
import { checkAuthentication } from "../middlewares/auth.middlewares";

const transactionsRouter = Router();

transactionsRouter.use(checkAuthentication);
transactionsRouter.route("/").get(getTransactions).post(createTransaction);
transactionsRouter.route("/:transactionId").patch(updateTransaction).delete(deleteTransaction);

export default transactionsRouter;
