import express, { Request, Response } from "express";
import { createResourceRouter } from "../helpers/ResourceRouter";
import UserController from "../controllers/UserController";

const app = express();
app.use(express.json());

const router = createResourceRouter();

// Default route for /api
router.get('/', (req: Request, res: Response) => {
    res.json({ message: "API Working" });
});

router.resource("/users", UserController);
app.use(router);

export default router;