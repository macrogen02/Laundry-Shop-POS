# Laundry Shop POS

A full-stack Laundry Shop Point of Sale web app starter built with:

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** NestJS (Node.js + TypeScript)
- **Database:** PostgreSQL via Prisma schema
- **Authentication:** JWT staff login endpoint

## Features Included

### Core POS
- New order creation
- Service selection (wash / dry / fold)
- Auto price calculation by kg
- Payment method capture (cash / card / online)
- Receipt action trigger (UI button)
- Order status tracking

### Customer Management
- Customer profile list
- Phone numbers
- Order count and loyalty points display

### Laundry Workflow
- Pending → Washing → Drying → Ready → Picked up
- One-click status progression

### Admin Dashboard
- Daily sales
- Monthly sales estimate
- Top services
- Ready-for-pickup count
- Staff login API
- Inventory API (detergent, bags, softener)

## Project Structure

- `frontend/`: Vite React POS dashboard UI
- `backend/`: NestJS REST API modules
- `backend/prisma/schema.prisma`: PostgreSQL schema

## Quick Start

```bash
npm install
npm run dev -w backend
npm run dev -w frontend
```

- Frontend default: `http://localhost:5173`
- Backend default: `http://localhost:4000`

