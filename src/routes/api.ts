import express, { Request, Response } from "express";
import { createResourceRouter } from "../helpers/ResourceRouter";
import { authMiddleware, verifiedMiddleware } from "../middlewares/AuthMiddleware";
import AuthController from "../controllers/AuthController";
import UserController from "../controllers/UserController";

const app = express();

const router = createResourceRouter();

// Default route for /api
router.get('/', (req: Request, res: Response) => {
    res.json({ message: "API Working" });
});

router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/password/email", AuthController.forgotPassword);
router.post("/password/reset", AuthController.resetPassword);
router.get("/me", authMiddleware, AuthController.me);
router.post("/logout", authMiddleware, AuthController.logout);
router.get("/email/verify/:hash", AuthController.emailVerify);
router.post("/email/resend", authMiddleware, AuthController.emailResend);

router.post("/change-password", authMiddleware, AuthController.changePassword);

router.get("/dashboard", authMiddleware, verifiedMiddleware, (req, res) => {
    res.json({ success: true, message: "Welcome to your dashboard!" });
});

router.resource("/users", UserController);
app.use(router);

export default router;