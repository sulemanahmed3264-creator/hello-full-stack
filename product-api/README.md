# Product API (Node.js, Express, MongoDB)

A RESTful API for managing products and categories, built as part of the Full Stack JavaScript (MEAN/MERN) course. Data is stored in MongoDB using Mongoose.

## Features

- Full CRUD for products, create and read for categories
- Mongoose schemas with validation, defaults, enums, timestamps, virtuals and methods
- Relationship between products and categories using populate()
- Filtering, sorting and field selection with find(), select(), sort() and lean()
- API key protection on write routes
- Central error handling (validation 400, duplicate key 409, invalid id 400, not found 404)
- Basic NoSQL injection protection and security headers (Helmet, CORS)
- Automated tests with node:test and Supertest
- Seed script with sample data

## Tech Stack

Node.js, Express 5, MongoDB, Mongoose, dotenv, Helmet, CORS, Morgan, Supertest

## Getting Started

### Prerequisites

- Node.js
- MongoDB running locally (or a MongoDB Atlas connection string)

### Installation

bash
npm install


### Environment variables

Copy .env.example to .env and fill in the values:

env
PORT=3000
API_KEY=your_secret_key
MONGO_URI=mongodb://localhost:27017/product_db
MONGO_URI_TEST=mongodb://127.0.0.1:27017/product_db_test


Never commit your real .env file.

### Run

bash
npm run seed   # optional: loads 3 categories and 8 products (clears existing data)
npm run dev    # development with nodemon
npm start      # production
npm test       # runs the test suite on a separate test database


## API Endpoints

Base URL: http://localhost:3000

Write routes need the header x-api-key: your_secret_key.

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/products | No | List products. Query: name, category, sort (price or -price) |
| GET | /api/products/:id | No | Get one product with its category populated |
| POST | /api/products | Yes | Create a product |
| PUT | /api/products/:id | Yes | Update fields of a product |
| DELETE | /api/products/:id | Yes | Delete a product |

### Categories

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/categories | No | List categories |
| GET | /api/categories/:id | No | Get one category |
| POST | /api/categories | Yes | Create a category |

## Data Models

*Product:* name, price, category (enum), categoryId (reference to Category), stock, sku (unique), description, isAvailable, ratings, createdAt, updatedAt. Virtuals: priceWithTax, stockStatus.

*Category:* name (unique), description, createdAt, updatedAt.

## Example Request

http
POST /api/products
x-api-key: your_secret_key
Content-Type: application/json

{
  "name": "Laptop",
  "price": 85000,
  "category": "electronics",
  "stock": 3,
  "sku": "lap-001"
}


## Testing and Documentation

- Automated tests: npm test
- Postman collection: postman/product-api-chapter3.postman_collection.json (set the apiKey variable after importing)
- Database operations were also verified in MongoDB Compass

## Project Structure

text
product-api/
  config/        config.js, db.js
  controllers/   productController.js, categoryController.js
  middleware/    auth.js, errorHandler.js, logger.js, sanitize.js
  models/        Product.js, Category.js
  routes/        productRoutes.js, categoryRoutes.js
  tests/         product.test.js
  postman/       Postman collection
  app.js
  server.js
  seed.js


## Author

Suleman Ahmed