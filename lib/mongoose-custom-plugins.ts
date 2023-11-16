import { Schema } from "mongoose";

export function setSchemaOptions(schema: Schema) {
  schema.set("toJSON", { getters: true });
  schema.set("toObject", { getters: true });
  schema.set("timestamps", true);
}

export function setUpdateQueryOptions(schema: Schema) {
  const options = { new: true, runValidators: true };
  schema.pre(/update/i, function () {
    this.setOptions(options);
  });
}
