# Cyllux Homes — Backend API

REST API for the Cyllux Homes e-commerce frontend. Built with **Node.js / Express / MongoDB (Mongoose)**.

---

## Stack
| Layer | Tech |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | MongoDB + Mongoose |
| Auth | JWT (Bearer token) |
| Validation | express-validator |
| Security | helmet, cors, express-rate-limit |
| Email | Nodemailer (optional) |

---

## Project Structure
```
src/
├── server.js              # Entry point
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   └── ContactMessage.js
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── cartController.js
│   ├── contactController.js
│   └── adminController.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── orders.js
│   ├── cart.js
│   ├── contact.js
│   └── admin.js
├── middleware/
│   ├── auth.js            # JWT protect + restrictTo
│   ├── rateLimiter.js
│   └── errorHandler.js
└── utils/
    ├── seed.js            # DB seeder
    └── api-client.js      # Drop-in frontend helper
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET at minimum
```

### 3. Seed the database
```bash
npm run seed
# Creates all 19 products + admin@cylluxhomes.com / Admin@1234!
```

### 4. Run the server
```bash
npm run dev     # development (nodemon)
npm start       # production
```

---

## API Reference

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Register new account |
| POST | `/login` | — | Login, returns JWT |
| GET | `/me` | ✅ | Get current user |
| PATCH | `/me` | ✅ | Update profile |
| PATCH | `/change-password` | ✅ | Change password |

### Products — `/api/products`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all (supports `?catKey=tech&maxPrice=500000&sort=price-asc&featured=true`) |
| GET | `/:id` | — | Single product by slug id |
| POST | `/` | Admin | Create product |
| PATCH | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Soft-delete product |

### Orders — `/api/orders`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | Optional | Place order (guest or logged-in) |
| GET | `/mine` | ✅ | My order history |
| GET | `/:orderId` | ✅ | Single order |
| PATCH | `/:orderId/status` | Admin | Update order status |

### Cart — `/api/cart` (logged-in users only)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✅ | Get cart |
| POST | `/` | ✅ | Add item |
| PATCH | `/:productId` | ✅ | Update qty |
| DELETE | `/:productId` | ✅ | Remove item |
| DELETE | `/` | ✅ | Clear cart |

### Contact — `/api/contact`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | — | Submit contact form |

### Admin — `/api/admin`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/dashboard` | Admin | Stats + recent orders |
| GET | `/orders` | Admin | All orders (paginated) |
| GET | `/users` | Admin | All users |
| GET | `/messages` | Admin | Contact messages |
| PATCH | `/messages/:id/read` | Admin | Mark message read |

---

## Frontend Integration

1. Copy `src/utils/api-client.js` into your frontend folder.
2. Include it in each HTML page **before** your other scripts:
   ```html
   <script src="api.js"></script>
   ```
3. Replace the simulated login in `login.html`:
   ```js
   async function handleLogin() {
     try {
       await apiLogin(
         document.getElementById('login-email').value,
         document.getElementById('login-password').value
       );
       window.location.href = 'index.html';
     } catch (err) {
       showToast(err.message);
     }
   }
   ```
4. Replace simulated checkout in `checkout.js` → `placeOrder()`:
   ```js
   const { order } = await apiPlaceOrder({
     items: cart.map(i => ({ productId: i.id, qty: i.qty })),
     shipping: { firstName, lastName, email, address },
     paymentMethod: 'card',
   });
   ```
5. Replace `chatbot.js` mock response with a real API call (see chatbot upgrade below).

---

## Deployment (Railway)
```bash
# Push to GitHub, connect repo on railway.app
# Set env vars in Railway dashboard:
#   MONGO_URI, JWT_SECRET, NODE_ENV=production, CORS_ORIGIN
```

---

## Security Notes
- Passwords hashed with bcrypt (cost 12)
- Product prices recalculated server-side on every order — client prices are never trusted
- JWT tokens expire in 7 days
- Rate limiting: 200 req/15min globally, 10 req/15min on auth endpoints
- `helmet` sets security headers automatically
