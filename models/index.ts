import mongoose from "mongoose";
import { setSchemaOptions, setUpdateQueryOptions } from "../lib/mongoose-custom-plugins";

mongoose.plugin(setSchemaOptions);
mongoose.plugin(setUpdateQueryOptions);

/* Import the models after setting schema options by a mongoose plugin */
import Transaction from "./transaction.model";
import User from "./user.model";

export { Transaction, User };
