## Overview

PoultryPro API is an Express.js application designed to manage poultry-related data and operations. It provides endpoints for authentication and chicken management.

## Features

- User authentication
- Chicken data management
- CORS enabled
- Logging with Morgan
- Environment variable support with dotenv

## Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:TaylorBeck/poultrypro-server.git
   cd poultrypro-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables:
   ```
   PORT=3001
   ```

## Usage

To start the server, run:

```bash
npm start
```

The server will run on `http://localhost:3001`.

## API Endpoints

### Authentication

- **POST** `/api/auth/login` - Log in a user
- **POST** `/api/auth/register` - Register a new user

### Chickens

- **GET** `/api/chickens` - Retrieve all chickens
- **POST** `/api/chickens` - Add a new chicken
- **GET** `/api/chickens/:id` - Retrieve a specific chicken
- **PUT** `/api/chickens/:id` - Update a specific chicken
- **DELETE** `/api/chickens/:id` - Delete a specific chicken

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
