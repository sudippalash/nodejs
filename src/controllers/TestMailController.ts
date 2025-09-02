import { Request, Response } from "express";
import { sendMail } from "../helpers/Mailer";

class TestMailController {
  async index(req: Request, res: Response) {
    await sendMail(
      'palash.sudip@gmail.com',
      "Test Mail",
      `
        <p>Hello,</p>
        <p>This is a demo email</p>
      `
    );
  
    return res.json({
      success: true,
      message: "Password reset link sent to your email",
    });
  }
}

export default new TestMailController();
