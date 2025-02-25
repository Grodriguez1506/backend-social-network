import validator from "validator";

const validateRegister = (params) => {
  let firstName =
    !validator.isEmpty(params.firstName) &&
    validator.isAlpha(params.firstName) &&
    validator.isLength(params.firstName, { min: 3, max: undefined });

  if (!firstName) {
    throw new Error(
      "First name should have only letters, should have minimun 3 characters and is a mandatory field"
    );
  }

  if (params.lastName) {
    let lastName =
      validator.isAlpha(params.lastName) &&
      validator.isLength(params.lastName, { min: 3, max: undefined });

    if (!lastName) {
      throw new Error(
        "Last name should have only letters and should have minimun 3 characters"
      );
    }
  }

  let email =
    !validator.isEmpty(params.email) && validator.isEmail(params.email);

  if (!email) {
    throw new Error("Email should have a valid email and is a mandatory field");
  }

  let password =
    !validator.isEmpty(params.password) &&
    validator.isLength(params.password, { min: 6, max: undefined });

  if (!password) {
    throw new Error(
      "Password should have minimun 6 character and is a mandatory field"
    );
  }
};

export default validateRegister;
