import Follow from "../models/Follow.js";

const save = async (req, res) => {
  const user = req.user.id;
  const followed = req.body.followed;

  if (!followed) {
    return res.status(401).json({
      status: "error",
      message: "faltan datos por suministrar",
    });
  }

  try {
    const userFound = await Follow.find({ user, followed });

    if (userFound.length > 0) {
      return res.status(403).json({
        status: "error",
        message: "Ya sigues a este usuario",
      });
    }

    const userFollowed = new Follow({
      user,
      followed,
    });

    userFollowed.save();
    return res.status(200).json({
      status: "success",
      message: "Usuario seguido con éxito",
    });
  } catch (error) {
    return res.status(404).json({
      status: "error",
      message: "Usuario no encontrado",
    });
  }
};

const unfollow = async (req, res) => {
  const user = req.user.id;
  const unfollow = req.body.unfollow;

  if (!unfollow) {
    return res.status(401).json({
      status: "error",
      message: "Faltan datos por suministrar",
    });
  }

  try {
    const userFound = await Follow.findOneAndDelete(
      { user: user, followed: unfollow },
      { new: true }
    );

    if (!userFound) {
      return res.status(404).json({
        status: "error",
        message: "No sigues al usuario seleccionado",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "El usuario se ha dejado de seguir exitosamente",
      userFound,
    });
  } catch (error) {}
};

const following = async (req, res) => {
  let userId = req.user.id;
  let page = 1;
  if (req.params.id && req.params.id != "{id}") {
    if (!isNaN(req.params.id)) {
      page = req.params.id;
    } else {
      userId = req.params.id;
    }
  }

  if (req.params.page) {
    page = req.params.page;
  }

  const options = {
    page,
    limit: 5,
    select: "-_id followed",
    populate: { path: "followed", select: "firstName lastName email image" },
  };

  try {
    const usersFollowed = await Follow.paginate({ user: userId }, options);

    if (page > usersFollowed.totalPages) {
      return res.status(404).json({
        status: "error",
        message: "Página inválida",
        totalFollowing: usersFollowed.totalDocs,
        totalPages: usersFollowed.totalPages,
        page: usersFollowed.page,
      });
    }

    if (usersFollowed.docs.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "The user doesn't follow any users yet",
      });
    }

    const myFollowing = await Follow.find({ user: req.user.id });

    return res.status(200).json({
      status: "success",
      following: usersFollowed.docs,
      totalFollowing: usersFollowed.totalDocs,
      totalPages: usersFollowed.totalPages,
      itemsPerPage: usersFollowed.limit,
      page: usersFollowed.page,
      myFollowing,
      myUser: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      error,
      message: "Error en la búsqueda",
    });
  }
};

const followers = async (req, res) => {
  let userId = req.user.id;
  let page = 1;

  if (req.params.id && req.params.id != "{id}") {
    if (!isNaN(req.params.id)) {
      page = req.params.id;
    } else {
      userId = req.params.id;
    }
  }

  if (req.params.page) {
    page = req.params.page;
  }

  const options = {
    page,
    limit: 5,
    select: "-_id user",
    populate: { path: "user", select: "firstName lastName email image" },
  };

  try {
    const followers = await Follow.paginate({ followed: userId }, options);

    if (page > followers.totalPages) {
      return res.status(404).json({
        status: "error",
        message: "Página inválida",
        totalFollowing: followers.totalDocs,
        totalPages: followers.totalPages,
        page: followers.page,
      });
    }

    if (followers.docs.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "The user doesn't have followers yet",
      });
    }

    const myFollowing = await Follow.find({ user: req.user.id });

    return res.status(200).json({
      status: "success",
      followers: followers.docs,
      totalFollowers: followers.totalDocs,
      totalPages: followers.totalPages,
      itemsPerPage: followers.limit,
      page: followers.page,
      myFollowing,
      myUser: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en la búsqueda",
    });
  }
};

export default {
  save,
  unfollow,
  following,
  followers,
};
