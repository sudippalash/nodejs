const express = require('express');
const app = express();

// Routes
app.get('/', (req, res) => {
    res.send('<h1>Hello, Server!</h1>');
});
app.use('/api', require('./routes/api'));

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});