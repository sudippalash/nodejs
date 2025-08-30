import { Router } from "express";
import UserController from "../controllers/UserController";

const router = Router();

// Default route for /api
router.get('/', (req, res) => {
    res.send('this is api route');
});

router.get("/users", UserController.index);
router.get("/users/:id", UserController.show);
router.post("/users/", UserController.create);
router.put("/users/:id", UserController.update);
router.delete("/users/:id", UserController.destroy);

export default router;