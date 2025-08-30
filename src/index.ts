import express, { Request, Response } from "express";
import dotenv from "dotenv";
import apiRoutes from "./routes/api";

dotenv.config();

const app = express();
const PORT = process.env.APP_PORT || 3000;

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('<h1>Hello, Server!</h1>');
});
app.use('/api', apiRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});