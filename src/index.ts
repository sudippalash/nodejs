import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import apiRoutes from "./routes/api";

dotenv.config();

const app = express();
const PORT = process.env.APP_PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req: Request, res: Response) => {
    res.send('<h1>Hello, Server!</h1>');
});
app.use('/api', apiRoutes);

// Catch-all for unknown routes (must be last)
app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Route not found`,
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});