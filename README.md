# Student Accommodation Portal

## Overview

This is a full-stack web application designed to help students find suitable accommodation and landlords to list their properties. The platform aims to streamline the process of connecting students with available housing options, featuring user authentication, accommodation listing management, and a user-friendly interface.

## Tech Stack

### Frontend
- **ReactJS**: A JavaScript library for building user interfaces.
- **Bootstrap**: A popular front-end framework for developing responsive, mobile-first projects on the web.

### Backend
- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express**: A fast, unopinionated, minimalist web framework for Node.js.
- **Sequelize**: A promise-based Node.js ORM for MySQL.
- **MySQL**: A relational database management system.
- **JWT (JSON Web Tokens)**: For secure user authentication.
- **bcryptjs**: For password hashing.

## Setup and Installation

For detailed instructions on how to set up and run the project locally, please refer to the [Setup Instructions](docs/Setup_Instructions.md) in the `docs` folder.

## API Documentation

For comprehensive documentation on the backend API endpoints, please refer to the [API Documentation](docs/API_Documentation.md) in the `docs` folder.

## Project Structure

```
student-accommodation-portal/
├── client/               # ReactJS frontend application
│   ├── public/           # Static assets
│   ├── src/              # React source code
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # React pages/views
│   │   └── services/     # API service calls
│   └── .env.example
├── server/               # Node.js Express backend API
│   ├── config/           # Database configuration
│   ├── controllers/      # Business logic for routes
│   ├── models/           # Sequelize models (database schemas)
│   ├── routes/           # API routes
│   └── middleware/       # JWT authentication middleware
│   └── .env.example
├── docs/                 # Project documentation
│   ├── API_Documentation.md
│   ├── Setup_Instructions.md
│   └── README.md
└── README.md             # Root project README
``` 