import { Request, Response } from "express";

class UserController {
  // GET /users
  index(req: Request, res: Response) {
    res.json({ message: "List all users" });
  }

  // GET /users/:id
  show(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ message: `Show user with id ${id}` });
  }

  // POST /users
  create(req: Request, res: Response) {
    const data = req.body;
    res.json({ message: "User created", data });
  }

  // PUT /users/:id
  update(req: Request, res: Response) {
    const { id } = req.params;
    const data = req.body;
    res.json({ message: `User ${id} updated`, data });
  }

  // DELETE /users/:id
  destroy(req: Request, res: Response) {
    const { id } = req.params;
    res.json({ message: `User ${id} deleted` });
  }
}

export default new UserController();
