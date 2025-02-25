import { Router } from "express";
import PublicationController from "../controllers/publication.js";
import auth from "../middlewares/auth.js";
import multer from "multer";
import path from "node:path";

const router = Router();

// Configuración para la carga de imágenes para las publicaciones

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/publications/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `pub-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

router.post(
  "/publication/save",
  [auth, upload.single("publication")],
  PublicationController.save
);

router.get("/publication/list/:id?/:page?", auth, PublicationController.list);

router.get("/publication/media/:file", PublicationController.media);

export default router;
