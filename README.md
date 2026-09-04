# Expense Tracker with Analytics

A MERN training project for interns. The goal is to build a resume-ready personal finance app in gradual difficulty levels, starting with simple expense tracking and ending with collaborative features like expense split, real-time chat, uploads, web notifications, and background workers.

## Project Goals

- Build a clean MERN application structure.
- Practice frontend, backend, database, authentication, and deployment.
- Add real-world product features in stages.
- Prepare clear interview talking points around architecture and tradeoffs.

## Tech Stack

- Frontend: React, Vite, React Router
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Auth: JWT-based authentication
- Realtime: Socket.IO
- Uploads: Multer or cloud storage integration
- Notifications: Web Notifications API
- Background Jobs: BullMQ with Redis

## Features

### Backend
- CRUD APIs
- Filtering, Searching & Sorting
- Summary Analytics
- Category-wise Analytics
- Month-wise Analytics
- MongoDB Aggregation Pipeline
- Validation
- Error Handling
- Consistent API Responses

### Frontend
- React Dashboard
- Expense Form
- Expense List
- Search & Filters
- Analytics Cards
- Responsive UI

## Folder Structure

```text
expense-tracker/
├── client/
│   ├── src/
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.js
│   ├── package.json
│   └── .env
└── README.md
```

## Installation

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm start
```

### Environment Variables

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Health Check |
| POST | /api/expenses | Add Expense |
| GET | /api/expenses | Get All Expenses |
| GET | /api/expenses/:id | Get Expense |
| PUT | /api/expenses/:id | Update Expense |
| DELETE | /api/expenses/:id | Delete Expense |
| GET | /api/analytics/summary | Summary |
| GET | /api/analytics/category-wise | Category Analytics |
| GET | /api/analytics/month-wise | Month Analytics |

# 📌 API Examples

This section provides sample request bodies, success responses, and error responses for each API endpoint. These examples help developers understand how to interact with the Expense Tracker API.

---

# ➕ Create Expense

### Endpoint

```http
POST /api/expenses
```

### Sample Request Body

```json
{
  "title": "Salary",
  "amount": 50000,
  "category": "Job",
  "type": "Income"
}
```

### Sample Success Response

```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "_id": "687abc1234567890abcdef12",
    "title": "Salary",
    "amount": 50000,
    "category": "Job",
    "type": "Income",
    "createdAt": "2026-07-30T10:15:20.000Z",
    "updatedAt": "2026-07-30T10:15:20.000Z"
  }
}
```

### Sample Error Response

```json
{
  "success": false,
  "message": "All fields are required",
  "data": null
}
```

---

# 📄 Get All Expenses

### Endpoint

```http
GET /api/expenses
```

### Sample Success Response

```json
{
  "success": true,
  "message": "Expenses fetched successfully",
  "data": [
    {
      "_id": "687abc1234567890abcdef12",
      "title": "Salary",
      "amount": 50000,
      "category": "Job",
      "type": "Income"
    },
    {
      "_id": "687abc1234567890abcdef13",
      "title": "Food",
      "amount": 650,
      "category": "Food",
      "type": "Expense"
    }
  ]
}
```

### Sample Error Response

```json
{
  "success": false,
  "message": "No expenses found",
  "data": null
}
```

---

# 🔍 Get Expense by ID

### Endpoint

```http
GET /api/expenses/:id
```

### Sample Success Response

```json
{
  "success": true,
  "message": "Expense fetched successfully",
  "data": {
    "_id": "687abc1234567890abcdef12",
    "title": "Food",
    "amount": 650,
    "category": "Food",
    "type": "Expense"
  }
}
```

### Sample Error Response

```json
{
  "success": false,
  "message": "Expense not found",
  "data": null
}
```

---

# ✏️ Update Expense

### Endpoint

```http
PUT /api/expenses/:id
```

### Sample Request Body

```json
{
  "title": "Groceries",
  "amount": 1200,
  "category": "Food",
  "type": "Expense"
}
```

### Sample Success Response

```json
{
  "success": true,
  "message": "Expense updated successfully",
  "data": {
    "_id": "687abc1234567890abcdef12",
    "title": "Groceries",
    "amount": 1200,
    "category": "Food",
    "type": "Expense"
  }
}
```

### Sample Error Response

```json
{
  "success": false,
  "message": "Invalid Expense ID",
  "data": null
}
```

---

# ❌ Delete Expense

### Endpoint

```http
DELETE /api/expenses/:id
```

### Sample Success Response

```json
{
  "success": true,
  "message": "Expense deleted successfully",
  "data": {
    "_id": "687abc1234567890abcdef12",
    "title": "Groceries",
    "amount": 1200,
    "category": "Food",
    "type": "Expense"
  }
}
```

### Sample Error Response

```json
{
  "success": false,
  "message": "Expense not found",
  "data": null
}
```

---

# 📊 Summary Analytics

### Endpoint

```http
GET /api/analytics/summary
```

### Sample Success Response

```json
{
  "success": true,
  "message": "Summary fetched successfully",
  "data": {
    "totalIncome": 100000,
    "totalExpense": 25000,
    "balance": 75000,
    "totalTransactions": 18,
    "highestExpense": {
      "title": "House Rent",
      "amount": 12000
    }
  }
}
```

---

# 📈 Category-wise Analytics

### Endpoint

```http
GET /api/analytics/category-wise
```

### Sample Success Response

```json
{
  "success": true,
  "message": "Category-wise analytics fetched successfully",
  "data": [
    {
      "_id": "Food",
      "totalAmount": 4200
    },
    {
      "_id": "Travel",
      "totalAmount": 3500
    },
    {
      "_id": "Shopping",
      "totalAmount": 8000
    }
  ]
}
```

---

# 📅 Month-wise Analytics

### Endpoint

```http
GET /api/analytics/month-wise
```

### Sample Success Response

```json
{
  "success": true,
  "message": "Month-wise analytics fetched successfully",
  "data": [
    {
      "_id": {
        "month": 6
      },
      "totalIncome": 50000,
      "totalExpense": 18000
    },
    {
      "_id": {
        "month": 7
      },
      "totalIncome": 60000,
      "totalExpense": 22000
    }
  ]
}
```

---

# ⚠️ Common Error Responses

## 1. Missing Required Fields

```json
{
  "success": false,
  "message": "All fields are required",
  "data": null
}
```

---

## 2. Invalid Expense ID

```json
{
  "success": false,
  "message": "Invalid Expense ID",
  "data": null
}
```

---

## 3. Expense Not Found

```json
{
  "success": false,
  "message": "Expense not found",
  "data": null
}
```

---

## 4. Invalid Type

```json
{
  "success": false,
  "message": "Type must be either Income or Expense",
  "data": null
}
```

---

## 5. Route Not Found

```json
{
  "success": false,
  "message": "Route not found - /api/test",
  "data": null
}
```

---

## 6. Internal Server Error

```json
{
  "success": false,
  "message": "Internal Server Error",
  "data": null
}
```

---

## Response Format

Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

## Validation

- Required fields
- Positive amount
- Valid enum (Income/Expense)
- Invalid MongoDB ObjectId
- Route Not Found
- Server Error Handling

## Analytics

- Total Income
- Total Expense
- Balance
- Total Transactions
- Highest Expense
- Category-wise Aggregation
- Month-wise Aggregation

## Future Enhancements

- JWT Authentication
- Budget Planner
- Charts
- PDF Export
- Email Reports
- Cloud Deployment


# 🌐 Frontend & Backend Integration

This project has been successfully tested for seamless communication between the React frontend and Express backend.

---

## ✅ CORS Verification

Cross-Origin Resource Sharing (CORS) has been configured successfully in the Express backend to allow requests from the React frontend.

### Backend Configuration

```javascript
import cors from "cors";

app.use(cors());
```

### Verification

- ✔ Cross-origin requests are allowed.
- ✔ No CORS policy errors were encountered in the browser.
- ✔ React frontend successfully communicates with the backend APIs.

---

## ❤️ Backend Health API Verification

A Health Check API is implemented to verify that the backend server is running properly.

### Endpoint

```http
GET /api/health
```

### Sample Success Response

```json
{
  "success": true,
  "message": "Server is running successfully",
  "data": {
    "status": "Healthy"
  }
}
```

---

## 🔗 Frontend Health API Test

The React frontend successfully calls the backend Health API using Axios.

### Example

```javascript
import axios from "axios";

const response = await axios.get("http://localhost:5000/api/health");

console.log(response.data);
```

### Expected Output

```json
{
  "success": true,
  "message": "Server is running successfully",
  "data": {
    "status": "Healthy"
  }
}
```

### Verification Checklist

- ✔ Backend server starts successfully.
- ✔ Health API returns HTTP 200 OK.
- ✔ React frontend receives the response correctly.
- ✔ No CORS-related issues.
- ✔ Frontend and backend communication verified successfully.

## Required System Tools

Install these tools before running the project.

| Tool | Why it is needed |
| --- | --- |
| Git | Optional but recommended for learning commits, branches, and project history. Not required if the project is shared as a ZIP/RAR file. |
| Node.js LTS | Run React, Vite, Express, and npm packages. |
| npm | Install and run project dependencies. Comes with Node.js. |
| MongoDB Community Server or MongoDB Atlas | Store users, expenses, groups, messages, and notifications. |
| MongoDB Compass | Optional GUI for checking MongoDB data. |
| Redis | Required later for background workers with BullMQ. |
| Archive extractor | Extract the shared ZIP/RAR/TAR project folder. Windows can use built-in ZIP extraction or 7-Zip. Ubuntu can use `unzip` or `tar`. |
| Visual Studio Code | Recommended editor for interns. |
| Postman or Thunder Client | Test backend APIs during development. |

Official references:

- Node.js: https://nodejs.org/en/download
- MongoDB Community Server: https://www.mongodb.com/docs/manual/administration/install-community/
- MongoDB Atlas: https://www.mongodb.com/products/platform/atlas-database
- Redis: https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/
- Visual Studio Code: https://code.visualstudio.com/
- Postman: https://www.postman.com/downloads/

## Setup on Windows

### 1. Install Git

Git is optional for this training setup because the project will be shared as a compressed folder. Install it if the intern also needs to practice commits and branches.

Download and install Git from:

```text
https://git-scm.com/download/win
```

After installation, open PowerShell and verify:

```powershell
git --version
```

### 2. Install Node.js LTS

Download the LTS installer from:

```text
https://nodejs.org/en/download
```

After installation, open a new PowerShell window and verify:

```powershell
node -v
npm -v
```

### 3. Install MongoDB

For local development, install MongoDB Community Server:

```text
https://www.mongodb.com/docs/manual/administration/install-community/
```

During installation, keep the option to run MongoDB as a Windows service enabled.

Optional but recommended:

```text
https://www.mongodb.com/products/tools/compass
```

Verify MongoDB is running:

```powershell
mongosh
```

If `mongosh` opens successfully, exit with:

```javascript
exit
```

Alternative: use MongoDB Atlas instead of local MongoDB and place the Atlas connection string in `.env`.

### 4. Install Redis for Background Workers

Redis is needed only when the intern reaches the background worker level. On Windows, the recommended beginner-friendly option is to use WSL Ubuntu.

Install WSL:

```powershell
wsl --install
```

Restart the system if Windows asks for it. Then open Ubuntu from the Start menu and install Redis using the Ubuntu steps below.

### 5. Extract and Open the Project

Extract the shared ZIP/RAR file first. Recommended folder location:

```powershell
C:\MERN-Projects\expense-tracker-analytics
```

For ZIP files, right-click the file and choose `Extract All`. For RAR files, install 7-Zip or WinRAR and extract the folder.

Then open PowerShell and move to the extracted project folder:

```powershell
cd "C:\MERN-Projects\expense-tracker-analytics"
```

### 6. Create Environment File

Copy the example environment file:

```powershell
copy .env.example .env
```

Update `.env` if required:

```env
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SERVER_PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/expense_tracker_analytics
JWT_SECRET=replace_with_local_secret
JWT_EXPIRES_IN=7d
UPLOAD_STORAGE=local
REDIS_URL=redis://127.0.0.1:6379
```

### 7. Install Project Packages

From the project root:

```powershell
npm install
npm run install:all
```

### 8. Run the Project

Start both frontend and backend:

```powershell
npm run dev
```

Open the frontend:

```text
http://localhost:5173
```

Check the backend health API:

```text
http://localhost:5000/api/health
```

### 9. Run Background Workers Later

When Redis is installed and running:

```powershell
npm run worker --prefix server
```

## Setup on Ubuntu

### 1. Update System Packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Git

```bash
sudo apt install git -y
git --version
```

### 3. Install Archive Tools

Install archive tools to extract the shared compressed project folder.

```bash
sudo apt install unzip tar -y
```

### 4. Install Node.js LTS

Recommended simple option for interns: install Node.js from the official Node.js download page or use Node Version Manager.

Install NVM:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Close and reopen the terminal, then install Node.js LTS:

```bash
nvm install --lts
nvm use --lts
node -v
npm -v
```

### 5. Install MongoDB

Follow the official MongoDB Community Server instructions for your Ubuntu version:

```text
https://www.mongodb.com/docs/manual/administration/install-community/
```

After installation, start MongoDB:

```bash
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

Verify connection:

```bash
mongosh
```

Exit Mongo shell:

```javascript
exit
```

Alternative: use MongoDB Atlas instead of local MongoDB and place the Atlas connection string in `.env`.

### 6. Install Redis

Redis is needed for background workers.

```bash
sudo apt install redis-server -y
sudo systemctl start redis-server
sudo systemctl enable redis-server
redis-cli ping
```

Expected output:

```text
PONG
```

### 7. Extract and Open the Project

Extract the shared ZIP/TAR file first. Recommended folder location:

```bash
~/mern-projects/expense-tracker-analytics
```

Example for ZIP:

```bash
mkdir -p ~/mern-projects
unzip expense-tracker-analytics.zip -d ~/mern-projects
```

Example for TAR:

```bash
mkdir -p ~/mern-projects
tar -xf expense-tracker-analytics.tar -C ~/mern-projects
```

Then move to the extracted project folder:

```bash
cd ~/mern-projects/expense-tracker-analytics
```

### 8. Create Environment File

```bash
cp .env.example .env
```

Update `.env` if required:

```env
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SERVER_PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/expense_tracker_analytics
JWT_SECRET=replace_with_local_secret
JWT_EXPIRES_IN=7d
UPLOAD_STORAGE=local
REDIS_URL=redis://127.0.0.1:6379
```

### 9. Install Project Packages

From the project root:

```bash
npm install
npm run install:all
```

### 10. Run the Project

Start both frontend and backend:

```bash
npm run dev
```

Open the frontend:

```text
http://localhost:5173
```

Check the backend health API:

```text
http://localhost:5000/api/health
```

### 11. Run Background Workers Later

When Redis is installed and running:

```bash
npm run worker --prefix server
```

## Useful Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install root-level tools such as `concurrently`. |
| `npm run install:all` | Install frontend and backend packages. |
| `npm run dev` | Run React and Express together. |
| `npm run dev --prefix client` | Run only the React frontend. |
| `npm run dev --prefix server` | Run only the Express backend. |
| `npm run worker --prefix server` | Run background workers. |
| `npm run build --prefix client` | Build frontend for production. |
| `npm start --prefix server` | Run backend in production mode. |

## Environment Variables

| Variable | Example | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `development` | Application environment. |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL allowed by backend/socket CORS. |
| `SERVER_PORT` | `5000` | Express server port. |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/expense_tracker_analytics` | MongoDB connection string. |
| `JWT_SECRET` | `replace_with_local_secret` | Secret key for JWT tokens. |
| `JWT_EXPIRES_IN` | `7d` | JWT expiry duration. |
| `UPLOAD_STORAGE` | `local` | Upload storage mode. |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis connection for workers. |

## Troubleshooting

### `npm` is not recognized

Close and reopen the terminal after installing Node.js. If it still fails, reinstall Node.js LTS and ensure it is added to PATH.

### MongoDB connection failed

Check that MongoDB is running.

Windows:

```powershell
mongosh
```

Ubuntu:

```bash
sudo systemctl status mongod
```

Also verify `MONGODB_URI` in `.env`.

### Redis connection failed

Redis is required only for background workers.

Ubuntu:

```bash
redis-cli ping
```

Expected output:

```text
PONG
```

On Windows, run Redis through WSL Ubuntu.

### Port already in use

Change the backend port in `.env`:

```env
SERVER_PORT=5001
```

Then restart the project.

### Frontend cannot connect to backend

Check:

- Backend is running on `http://localhost:5000`.
- `CLIENT_URL` in `.env` is `http://localhost:5173`.
- API calls from React use the correct backend base URL.

## Suggested Learning Flow

1. Basic setup and UI layout
2. Authentication
3. Expense CRUD
4. Analytics dashboard
5. File, image, and bill uploads
6. Expense split between users
7. Real-time group chat
8. Web notifications
9. Background workers
10. Deployment and resume documentation

See [docs/topic-wise-work-plan.md](docs/topic-wise-work-plan.md) for the detailed intern roadmap.

## Resume Positioning

Suggested resume bullet:

> Built a MERN-based expense tracker with analytics, JWT authentication, group expense splitting, receipt uploads, real-time chat, web notifications, and background job processing for scheduled reminders and reports.
