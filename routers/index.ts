import express from "express";
import transactionsRouter from "./transactions.router";
import usersRouter from "./users.router";

const mainRouter = express.Router();

mainRouter.use("/users", usersRouter);
mainRouter.use("/transactions", transactionsRouter);

export default mainRouter;
