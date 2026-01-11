# Express TypeScript Backend

A Node.js 20+ backend application built with Express.js and TypeScript, featuring MongoDB, JWT authentication, and comprehensive security middleware.

## Prerequisites

- Node.js 20+ 
- npm 10+
- MongoDB (local or remote instance)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

## Development

Run the development server with hot-reload:
```bash
npm run dev
```

The server will start on the port specified in your `.env` file (default: 3000).

## Build

Build the project for production:
```bash
npm run build
```

The compiled JavaScript files will be in the `dist/` directory.

## Production

Run the production build:
```bash
npm start
```

## Project Structure

```
.
├── src/
│   ├── index.ts          # Application entry point
│   └── app.ts            # Express app configuration
├── dist/                 # Compiled JavaScript (generated)
├── .env                  # Environment variables (create from .env.example)
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Features

- **Express.js** - Fast, minimalist web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB (Mongoose)** - Database integration
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **Joi** - Schema validation
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-Origin Resource Sharing
- **express-rate-limit** - Rate limiting
- **Swagger (OpenAPI)** - API documentation

## Environment Variables

See `.env.example` for all available environment variables and their descriptions.

## License

ISC
