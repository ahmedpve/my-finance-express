import jwt from "jsonwebtoken";

export const signJwtToken = (payload: { id: string }) => {
  const accessToken = jwt.sign(payload, String(process.env.JWT_SECRET), { expiresIn: process.env.JWT_EXPIRESIN });
  return accessToken;
};

export const verifyJwtToken = async (accessToken: string) => {
  const decodedAccessToken = await new Promise((resolve, reject) => {
    jwt.verify(accessToken, String(process.env.JWT_SECRET), (err, jwt) => {
      if (jwt) resolve(jwt);
      if (err) reject(err);
    });
  });
  return decodedAccessToken;
};
