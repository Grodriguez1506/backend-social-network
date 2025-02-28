import jwt from "jsonwebtoken";
import moment from "moment";

export const createAccesToken = (user) => {
  const payload = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(15, "minutes").unix(),
  };

  return jwt.sign(payload, process.env.JWT_SECRET);
};

export const createNewAccesToken = (user) => {
  const payload = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(15, "minutes").unix(),
  };

  return jwt.sign(payload, process.env.JWT_SECRET);
};

export const createRefreshToken = (user) => {
  const payload = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(7, "days").unix(),
  };

  return jwt.sign(payload, process.env.REFRESH_SECRET);
};
