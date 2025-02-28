import User from "../models/User.js";
import Follow from "../models/Follow.js";
import Publication from "../models/Publication.js";
import bcrypt from "bcrypt";
import "dotenv/config";
import {
  createAccesToken,
  createRefreshToken,
  createNewAccesToken,
} from "../services/jwt.js";
import jwt from "jsonwebtoken";
import config from "../config.js";
import { join } from "path";
import { stat } from "fs/promises";
import validateRegister from "../helpers/validate.js";

const register = async (req, res) => {
  const params = req.body;

  if (!params) {
    return res.status(400).json({
      status: "error",
      message: "Datos incompletos",
    });
  }

  try {
    validateRegister(params);
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.message,
    });
  }

  try {
    const userFound = await User.findOne({ email: params.email });

    if (userFound) {
      return res.status(409).json({
        status: "error",
        message: "El email ya se encuentra registrado",
      });
    }

    const hashedPassword = await bcrypt.hash(params.password, 10);

    const userCreated = new User(params);

    userCreated.password = hashedPassword;

    userCreated.save();

    return res.status(200).json({
      status: "succes",
      message: `Usuario creado con exito`,
      userCreated,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en el registro",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(401).json({
      status: "error",
      message: "Email and password are mandatory fields",
    });
  }

  try {
    const userFound = await User.findOne({ email });

    if (!userFound) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }
    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    const refreshToken = createRefreshToken(userFound);
    const token = createAccesToken(userFound);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // Expira en 7 días
    });
    return res.status(200).json({
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Error en el inicio de sesión",
    });
  }
};

const refresh = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: "error",
        message: "Expired token",
      });
    }

    const newAccessToken = createNewAccesToken(user);
    return res.json({
      status: "success",
      token: newAccessToken,
    });
  });
};

const update = async (req, res) => {
  const userIdentity = req.user;
  const params = req.body;

  try {
    const usersFound = await User.find({ email: params.email });

    let userExists = false;

    usersFound.forEach((user) => {
      if (user && user._id != userIdentity.id) userExists = true;
    });

    if (userExists) {
      return res.status(400).json({
        status: "error",
        message: "El email ingresado ya existe",
      });
    }

    if (params.password) {
      let pwd = await bcrypt.hash(params.password, 10);
      params.password = pwd;
    } else {
      delete params.password;
    }

    if (params.firstName) {
      if (params.firstName.length < 3) {
        return res.status(400).json({
          status: "error",
          message: "El nombre debe contener mínimo 3 caracteres",
        });
      }
    } else {
      delete params.firstName;
    }

    if (params.lastName) {
      if (params.lastName.length < 3) {
        return res.status(400).json({
          status: "error",
          message: "El apellido debe contener mínimo 3 caracteres",
        });
      }
    } else {
      delete params.lastName;
    }

    if (params.email) {
      if (!params.email.includes("@") || !params.email.includes(".com")) {
        return res.status(400).json({
          status: "error",
          message: "Ingresa un email válido",
        });
      }
    } else {
      delete params.email;
    }

    const userUpdated = await User.findByIdAndUpdate(userIdentity.id, params);

    return res.status(200).json({
      status: "success",
      message: `El usuario ${userUpdated.email} ha sido actualizado correctamente`,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en la actualización",
    });
  }
};

const upload = async (req, res) => {
  const userIdentity = req.user.id;
  const image = req.file.filename;
  if (!image) {
    return res.status(404).json({
      status: "error",
      message: "Faltan datos por suministrar",
    });
  }

  try {
    const userUpdated = await User.findByIdAndUpdate(
      userIdentity,
      { image },
      { new: true }
    );

    userUpdated.save();

    return res.status(200).json({
      status: "success",
      message: "Actualización de imagen de perfil realizada exitosamente",
      imageName: userUpdated.image,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en la carga de la imagen de perfil",
    });
  }
};

const profile = async (req, res) => {
  let userId = req.user.id;

  if (req.params.id && req.params.id != "{id}") {
    userId = req.params.id;
  }

  try {
    const user = await User.findById(userId).select({
      password: 0,
      role: 0,
      __v: 0,
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    const followingCount = await Follow.countDocuments({ user: userId });
    const followersCount = await Follow.countDocuments({ followed: userId });
    const publicationsCount = await Publication.countDocuments({
      user: userId,
    });

    const publicationsList = await Publication.find({ user: userId })
      .populate("user")
      .sort("-createdAt");

    const myFollowings = await Follow.find({ user: req.user.id });

    return res.status(200).json({
      status: "success",
      message: "Bienvenido al perfil",
      userSelected: user,
      following: followingCount,
      followers: followersCount,
      publicationsCount,
      publicationsList,
      user: req.user,
      myFollowings,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      status: "error",
      message: "Usuario no encontrado",
    });
  }
};

const feed = async (req, res) => {
  const user = req.user;

  try {
    const usersFollowed = await Follow.find({ user: user.id });

    if (usersFollowed.length == 0) {
      return res.status(200).json({
        status: "Succes",
        message: "No hay publicaciones para mostrar",
        user,
      });
    }

    let followed = new Array();

    usersFollowed.forEach((user) => {
      followed.push(user.followed.toString());
    });

    const publications = await Publication.find({ user: followed })
      .sort("-createdAt")
      .populate("user");

    if (publications.length == 0) {
      return res.status(200).json({
        status: "success",
        message: "No hay publicaciones para mostrar",
        user,
      });
    }

    delete user.iat;
    delete user.exp;
    delete user.role;

    return res.status(200).json({
      status: "success",
      user,
      publications,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en el servidor al listar las publicaciones",
    });
  }
};

const search = async (req, res) => {
  const searchParam = req.params.search;

  if (!searchParam) {
    return res.status(400).json({
      status: "error",
      message: "Search input is empty",
    });
  }

  try {
    const usersFound = await User.find({
      $and: [
        { _id: { $ne: req.user.id } },
        {
          $or: [
            { firstName: { $regex: searchParam, $options: "i" } },
            { lastName: { $regex: searchParam, $options: "i" } },
            { email: { $regex: searchParam, $options: "i" } },
          ],
        },
      ],
    });

    const following = await Follow.find({ user: req.user.id });

    return res.status(200).json({
      status: "success",
      message: "Users list",
      users: usersFound,
      following,
      user: req.user,
    });
  } catch (error) {
    console.log(error);
  }
};

const avatar = async (req, res) => {
  const __dirname = config.getRootPath();
  const filePath = join(__dirname, "uploads", "avatar");
  const fileName = join(filePath, req.params.file);

  try {
    await stat(fileName);

    return res.status(200).sendFile(fileName);
  } catch (error) {
    return res.status(404).json({
      status: "error",
      message: "El archivo especificado no existe",
    });
  }
};

const logout = async (req, res) => {
  res.clearCookie("refreshToken");

  return res.status(200).json({
    status: "success",
    message: "Cierre de sesión exitoso",
  });
};

export default {
  register,
  login,
  refresh,
  update,
  upload,
  profile,
  feed,
  search,
  avatar,
  logout,
};
