<<<<<<< HEAD
# Inventory Management System (IPMS)

A web-based stock, inventory, and sales management system built with React, Vite, React Router, React Bootstrap, React Icons, and Recharts.

## Features

- Role-based authentication with admin, manager, and salesman access
- Dashboard with sales and inventory summary cards
- Product management with search, add, edit, and delete actions
- Supplier and customer management
- Stock-in workflow to increase inventory quantities
- Invoice creation with live totals, discounts, and taxes
- Period-based sales reports (daily, monthly, yearly)
- Mock data layer using localStorage for frontend development

## Project Structure

```text
IPMS/
├── client/
│   ├── src/
│   ├── package.json
│   └── ...
├── README.md
└── .gitignore
```

## Run Locally

```bash
cd client
npm install
npm run dev -- --host 0.0.0.0
```

Then open the local URL shown by Vite in the browser.

## Default Demo Accounts

- Admin: admin@ipms.com / admin123
- Manager: manager@ipms.com / manager123
- Salesman: salesman@ipms.com / sales123

## Tech Stack

- React
- Vite
- React Router
- React Bootstrap
- React Icons
- Recharts

## Notes

This frontend uses mock data for the current phase and stores records in localStorage. The API layer is centralized in `src/services/api.js` so it can later be replaced with real HTTP calls to a backend API.
=======
# Inventory-Management-System-ISMS-
>>>>>>> origin/main
