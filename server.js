const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname)));

// Middleware to parse JSON bodies
app.use(express.json());

// Basic API route example
app.get('/api/status', (req, res) => {
  res.json({ message: 'Backend server is running!', timestamp: new Date().toISOString() });
});

// Example route for products (placeholder for future use)
app.get('/api/products', (req, res) => {
  // For now, return a simple message. Later, connect to a database or file.
  res.json({ message: 'Products endpoint - to be implemented', products: [] });
});

// Catch-all handler: send back index.html for any non-API routes (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});