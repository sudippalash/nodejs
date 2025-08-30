import { Router } from "express";

const router = Router();

// Define a route
router.get('/', (req, res) => {
    res.send('this is api route');
});

router.get('/users', (req, res) => {
    res.send('this is users route');
});

export default router;