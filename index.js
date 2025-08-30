import express from "express";
import dotenv from "dotenv";
import apiRoutes from "./src/routes/api.js";

const app = express();

dotenv.config();

// Routes
app.get('/', (req, res) => {
    res.send('<h1>Hello, Server!</h1>');
});
app.use('/api', apiRoutes);

// Start the server
const port = process.env.APP_PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});