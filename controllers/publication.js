import Publication from "../models/Publication.js";
import User from "../models/User.js";
import config from "../config.js";
import { join } from "path";
import { stat } from "fs/promises";

const save = async (req, res) => {
  const text = req.body.text;
  let file;

  if (!text) {
    return res.status(404).json({
      status: "error",
      message: "Publications fields are empty",
    });
  }

  const params = {
    user: req.user.id,
    text,
  };

  if (req.file) {
    params.file = req.file.filename;
  }

  try {
    const newPublication = new Publication(params);

    const publicationSaved = await newPublication.save();

    const userPublication = await User.findById(publicationSaved.user).select({
      firstName: 1,
      lastName: 1,
    });

    return res.status(200).json({
      status: "success",
      message: "Publicación creada con éxito",
      pubication: {
        id: publicationSaved._id,
        user: userPublication,
        text: publicationSaved.text,
        file: publicationSaved.file,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al cargar la publicación",
    });
  }
};

const list = async (req, res) => {
  let userIdentity = req.user.id;
  let page = 1;

  if (req.params.id) {
    if (!isNaN(req.params.id)) {
      page = req.params.id;
    } else {
      userIdentity = req.params.id;
    }
  }

  if (req.params.page) {
    page = req.params.page;
  }

  const options = {
    page,
    limit: 3,
    select: "-__v ",
    populate: { path: "user", select: "_id firstName lastName" },
    sort: { createdAt: -1 },
  };

  try {
    const publications = await Publication.paginate(
      { user: userIdentity },
      options
    );

    if (page > publications.totalPages) {
      return res.status(404).json({
        status: "error",
        message: "Página inválida",
        totalPublications: publications.totalDocs,
        itemsPerPage: publications.limit,
        totalPages: publications.totalPages,
        currentPage: publications.page,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Lista de publicaciones",
      totalPublications: publications.totalDocs,
      itemsPerPage: publications.limit,
      totalPages: publications.totalPages,
      currentPage: publications.page,
      publications: publications.docs,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en la consulta de publicaciones",
    });
  }
};

const media = async (req, res) => {
  const __dirname = config.getRootPath();
  const filePath = join(__dirname, "uploads", "publications");
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

export default {
  save,
  list,
  media,
};
