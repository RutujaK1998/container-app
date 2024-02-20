const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());

let containers = [];
console.log(`Server is running on http://localhost:${port}`);
// Route to handle POST requests to create a container
app.post('/api/containers', (req, res) => {
    try {
        const newContainer = req.body;
        containers.push(newContainer);
        res.status(201).json(newContainer); // Respond with the created container
    } catch (error) {
        console.error('Error creating container:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});