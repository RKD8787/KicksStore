# Sneaker Website Backend

A simple Node.js backend server for the sneaker e-commerce website.

## Setup

1. Ensure Node.js is installed on your system.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the server.

## Usage

- The server serves static files from the root directory.
- API endpoints:
  - `GET /api/status`: Returns server status.
  - `GET /api/products`: Placeholder for products (returns empty array for now).
- The frontend (index.html and script.js) can be accessed at `http://localhost:3000`.

## Connecting to Frontend

In your `script.js`, you can make API calls to the backend, e.g.:

```javascript
fetch('/api/products')
  .then(response => response.json())
  .then(data => console.log(data));
```

## Development

- Use `npm run dev` for development with nodemon (auto-restart on changes).
- Server runs on port 3000 by default, or set `PORT` environment variable.

## Troubleshooting

- If port 3000 is in use, change the PORT in server.js or set an environment variable.
- Ensure all dependencies are installed via `npm install`.
- Check console for any error messages when starting the server.