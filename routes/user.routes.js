import { Router } from "express";
import UserController from "../controllers/user.js";
import auth from "../middlewares/auth.js";
import multer from "multer";
import path from "node:path";

const router = Router();

// Configuración para la carga de imágenes en las fotos de perfil

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "uploads/avatar/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `avatar-${req.user.firstName}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

router.post("/user/register", UserController.register);

router.post("/user/login", UserController.login);

router.put("/user/update", auth, UserController.update);

router.post(
  "/user/upload",
  [auth, upload.single("avatar")],
  UserController.upload
);

router.get("/user/profile/:id?", auth, UserController.profile);

router.get("/user/feed", auth, UserController.feed);

router.get("/user/search/:search?", auth, UserController.search);

router.get("/user/avatar/:file", UserController.avatar);

router.post("/user/logout", auth, UserController.logout);

export default router;
