import { Router } from "express";
import FollowController from "../controllers/follow.js";
import auth from "../middlewares/auth.js";

const router = Router();

router.post("/follow/save", auth, FollowController.save);

router.delete("/follow/unfollow", auth, FollowController.unfollow);

router.get("/follow/following/:id?/:page?", auth, FollowController.following);

router.get("/follow/followers/:id?/:page?", auth, FollowController.followers);

export default router;
