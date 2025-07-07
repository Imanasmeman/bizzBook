# BizzBook API

A Node.js/Express REST API for business, user, product, and invoice management.

---

## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
  - [User Routes](#user-routes)
  - [Product Routes](#product-routes)
  - [Business Routes](#business-routes)
  - [Invoice Routes](#invoice-routes)
- [Swagger Documentation](#swagger-documentation)
- [Development](#development)

---

## Features
- User registration, login, and role-based access
- Business registration and management
- Product CRUD and purchase
- Invoice creation and retrieval
- JWT authentication
- MongoDB (Mongoose)
- Swagger UI documentation

---

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Imanasmeman/bizzBook.git
   cd bizzBook
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Create a `.env` file** (see [Environment Variables](#environment-variables))
4. **Start the server:**
   ```sh
   npm start
   ```
5. **Access Swagger UI:**
   Visit [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Environment Variables
Create a `.env` file in the root of the `bizzBook` directory. Example:

```
MONGO_URI="mongodb://127.0.0.1:27017/bizzBook"
JWT_SECRET="your_jwt_secret_here"
```

- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing

**Note:** Never commit your `.env` file to version control.

---

## API Endpoints

### User Routes
| Method | Endpoint         | Description                | Auth         | Roles           |
|--------|------------------|----------------------------|--------------|-----------------|
| POST   | `/user/signup`   | Register a new user        | No           | -               |
| POST   | `/user/login`    | User login                 | No           | -               |
| GET    | `/user`          | Get all users              | Yes          | admin, manager  |

#### Example: Register User
```json
POST /user/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin",
  "businessId": "<business_id>"
}
```

---

### Product Routes
| Method | Endpoint                | Description                  | Auth         | Roles                |
|--------|-------------------------|------------------------------|--------------|----------------------|
| GET    | `/product`              | Get all products             | No           | -                    |
| GET    | `/product/:id`          | Get product by ID            | No           | -                    |
| POST   | `/product`              | Create product               | Yes          | admin, manager       |
| PUT    | `/product/:id`          | Update product               | Yes          | admin, manager       |
| DELETE | `/product/:id`          | Delete product               | Yes          | admin, manager       |
| PATCH  | `/product/:id/quantity` | Purchase product             | Yes          | customer             |

#### Example: Create Product
```json
POST /product
{
  "name": "Item",
  "description": "Desc",
  "price": 10,
  "quantity": 100,
  "businessId": "<business_id>"
}
```

---

### Business Routes
| Method | Endpoint         | Description                  | Auth         | Roles           |
|--------|------------------|------------------------------|--------------|-----------------|
| POST   | `/business`      | Register a new business      | Yes          | admin           |
| GET    | `/business`      | Get all businesses           | Yes          | admin, manager  |
| GET    | `/business/:id`  | Get business by ID           | Yes          | admin, manager  |
| PUT    | `/business/:id`  | Update business by ID        | Yes          | admin           |
| DELETE | `/business/:id`  | Delete business by ID        | Yes          | admin           |

#### Example: Register Business
```json
POST /business
{
  "name": "BizName",
  "address": "123 St",
  "phone": "1234567890",
  "email": "biz@example.com"
}
```

---

### Invoice Routes
| Method | Endpoint         | Description                  | Auth         | Roles           |
|--------|------------------|------------------------------|--------------|-----------------|
| POST   | `/invoice`       | Create invoice               | Yes          | customer        |
| GET    | `/invoice`       | Get all invoices             | Yes          | admin, manager  |
| GET    | `/invoice/:id`   | Get invoice by ID            | Yes          | all (see notes) |

#### Example: Create Invoice
```json
POST /invoice
{
  "products": [
    { "product": "<product_id>", "quantity": 2 }
  ],
  "business": "<business_id>"
}
```

**Note:** Customers can only view their own invoices.

---

## Swagger Documentation

Interactive API docs available at: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Development
- Start: `npm start`
- Dev (with nodemon): `npm run dev` (if you add a dev script)
- Environment: Node.js 18+ recommended

---

## License
ISC

---

## Contact
For issues, open a ticket on [GitHub Issues](https://github.com/Imanasmeman/bizzBook/issues)
