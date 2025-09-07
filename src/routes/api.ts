import express, { Request, Response } from "express";
import { createRouter } from "../helpers/Router";
import { authMiddleware, verifiedMiddleware } from "../middlewares/AuthMiddleware";
import AuthController from "../controllers/AuthController";
import ProfileController from "../controllers/ProfileController";
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
    r.get("/me", AuthController.me);
    r.post("/logout", AuthController.logout);
    r.post("/email/resend", AuthController.emailResend);
});

router.group([authMiddleware, verifiedMiddleware], (r) => {
    r.get("/dashboard", (req: Request, res: Response) => res.json({ success: true, message: "Welcome to your dashboard!" }));
    
    r.post("/profile/update-details", ProfileController.updateDetails);
    r.post("/profile/update-password", ProfileController.updatePassword);

    r.resource("/users", UserController);
});

app.use(router);

export default router;