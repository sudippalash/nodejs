import express, { Request, Response } from "express";
import { createResourceRouter } from "../helpers/ResourceRouter";
import UserController from "../controllers/UserController";
import TestMailController from "../controllers/TestMailController";

const app = express();

const router = createResourceRouter();

// Default route for /api
router.get('/mail', TestMailController.index);
router.get('/', (req: Request, res: Response) => {
    res.json({ message: "API Working" });
});

router.resource("/users", UserController);
app.use(router);

export default router;