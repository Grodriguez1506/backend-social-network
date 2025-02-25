import jwt from "jsonwebtoken";
import moment from "moment";

const createAccesToken = (user) => {
  const payload = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    image: user.image,
    iat: moment().unix(),
    exp: moment().add(1, "hour").unix(),
  };

  return jwt.sign(payload, process.env.JWT_SECRET);
};

export default createAccesToken;
