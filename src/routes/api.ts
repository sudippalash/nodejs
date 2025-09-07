import express, { Request, Response } from "express";
import { createRouter } from "../helpers/Router";
import { authMiddleware, verifiedMiddleware } from "../middlewares/AuthMiddleware";
import AuthController from "../controllers/AuthController";
import UserController from "../controllers/UserController";

const app = express();

const router = createRouter();

// Default route for /api
router.get('/', (req: Request, res: Response) => res.json({ message: "API Working" }));

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/password/email", AuthController.forgotPassword);
router.post("/password/reset", AuthController.resetPassword);
router.get("/email/verify/:hash", AuthController.emailVerify);

router.group([authMiddleware], (r) => {
    r.get("/me", authMiddleware, AuthController.me);
    r.post("/logout", authMiddleware, AuthController.logout);
    r.post("/email/resend", authMiddleware, AuthController.emailResend);
});

router.group([authMiddleware, verifiedMiddleware], (r) => {
    r.get("/dashboard", (req: Request, res: Response) => res.json({ success: true, message: "Welcome to your dashboard!" }));

    r.resource("/users", UserController);
});

app.use(router);

export default router;