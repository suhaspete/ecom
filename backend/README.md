# E-Commerce Backend API

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start the server:
```bash
npm start
```

The server will run on http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login

### Products
- GET `/api/products` - Get all products (with optional filters)
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (requires auth)
- PUT `/api/products/:id` - Update product (requires auth)
- DELETE `/api/products/:id` - Delete product (requires auth)

### Cart
- GET `/api/cart` - Get user's cart (requires auth)
- POST `/api/cart/add` - Add item to cart (requires auth)
- PUT `/api/cart/update/:id` - Update cart item quantity (requires auth)
- DELETE `/api/cart/remove/:id` - Remove item from cart (requires auth)
- DELETE `/api/cart/clear` - Clear entire cart (requires auth)

### Orders
- GET `/api/orders` - Get user's orders (requires auth)
- GET `/api/orders/:id` - Get order details (requires auth)
- POST `/api/orders/create` - Create new order from cart (requires auth)
- PUT `/api/orders/:id/status` - Update order status (requires auth)

## Database

Uses SQLite with the following tables:
- users
- products
- cart_items
- orders
- order_items

The database is automatically initialized with sample products on first run.