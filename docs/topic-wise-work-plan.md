# Topic-wise Work Plan

This plan is intentionally gradual. The intern should complete each level with a small demo, code review, and short written summary before moving to the next level.

## Level 1: Foundation

| Topic | Work to Do | Output |
| --- | --- | --- |
| Project setup | Create React app, Express app, folder structure, environment files, and Git workflow. | Running frontend and backend locally. |
| UI layout | Build login, dashboard shell, sidebar, topbar, and empty states. | Clean responsive screens. |
| API basics | Create health check API and common response/error format. | `/api/health` endpoint. |
| MongoDB basics | Connect Express to MongoDB using Mongoose. | Successful DB connection log. |

## Level 2: Authentication and User Profile

| Topic | Work to Do | Output |
| --- | --- | --- |
| Registration | Add user registration with name, email, password. | Signup API and form. |
| Login | Add JWT login and protected routes. | Login API and frontend auth flow. |
| Profile | Allow user to view and update profile details. | Profile page and update API. |
| Security basics | Hash passwords, validate input, handle auth errors. | Safer auth implementation. |

## Level 3: Expense Tracker Core

| Topic | Work to Do | Output |
| --- | --- | --- |
| Expense model | Add amount, title, category, type, date, note, payment mode. | Mongoose expense schema. |
| Expense CRUD | Create, list, update, delete expenses. | Functional expense module. |
| Filters | Add search, category filter, date range, income/expense type filter. | Usable expense list. |
| Pagination | Add backend pagination and frontend page controls. | Scalable expense listing. |

## Level 4: Analytics

| Topic | Work to Do | Output |
| --- | --- | --- |
| Summary cards | Show income, expense, balance, monthly spend. | Dashboard metrics. |
| Charts | Add category-wise and month-wise charts. | Visual analytics dashboard. |
| MongoDB aggregation | Build analytics APIs using aggregation pipeline. | Efficient backend reports. |
| Export | Add CSV export for filtered expenses. | Downloadable report. |

## Level 5: Uploads

| Topic | Work to Do | Output |
| --- | --- | --- |
| Receipt upload | Attach image/PDF receipts to expenses. | Upload API and preview. |
| File validation | Validate file size and file type. | Safer upload flow. |
| Profile image | Add avatar upload for user profile. | Image upload practice. |
| Storage cleanup | Remove old files when records are deleted. | Basic file lifecycle handling. |

## Level 6: Expense Split

| Topic | Work to Do | Output |
| --- | --- | --- |
| Groups | Create groups with members. | Group expense workspace. |
| Split expense | Split expenses equally or manually. | Split calculation logic. |
| Balances | Show who owes whom. | Settlement summary. |
| Settle up | Mark payments as settled. | Group balance lifecycle. |

## Level 7: Real-time Chat

| Topic | Work to Do | Output |
| --- | --- | --- |
| Socket setup | Connect frontend and backend with Socket.IO. | Live socket connection. |
| Group chat | Add chat inside each expense group. | Real-time group messages. |
| Message history | Store and load previous messages from MongoDB. | Persistent chat. |
| Typing indicator | Show typing status to group members. | Better real-time UX. |

## Level 8: Web Notifications

| Topic | Work to Do | Output |
| --- | --- | --- |
| Browser permission | Ask notification permission at the right time. | Controlled permission flow. |
| Expense reminders | Notify for upcoming due or recurring expenses. | Reminder notification. |
| Split alerts | Notify members when a split is created or settled. | Collaboration alert. |
| Notification center | Store and list notifications inside the app. | In-app notification history. |

## Level 9: Background Workers

| Topic | Work to Do | Output |
| --- | --- | --- |
| Worker setup | Add Redis and BullMQ worker process. | Separate job processor. |
| Monthly report job | Generate monthly expense summary in the background. | Async reporting job. |
| Reminder job | Schedule upcoming bill reminders. | Scheduled notifications. |
| Retry handling | Add failed job logging and retry attempts. | Production-style reliability. |

## Level 10: Deployment and Interview Preparation

| Topic | Work to Do | Output |
| --- | --- | --- |
| Deployment | Deploy frontend, backend, and database. | Public project URL. |
| Seed data | Add demo users, expenses, groups, and messages. | Interview-ready demo. |
| README polish | Add screenshots, setup steps, features, and API list. | Strong GitHub presentation. |
| Resume summary | Write 3-4 resume bullets and project explanation. | Interview talking points. |

## Suggested Resume Bullets

- Built a MERN expense tracker with JWT authentication, expense CRUD, analytics dashboards, receipt uploads, and CSV export.
- Implemented group expense splitting with balances, settlements, and real-time group chat using Socket.IO.
- Added web notifications and background workers for reminders, monthly reports, and async processing.
- Designed MongoDB schemas and aggregation APIs for category-wise, monthly, and user-specific expense insights.

