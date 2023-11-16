import crypto from "crypto";

export const createToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const encryptToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
