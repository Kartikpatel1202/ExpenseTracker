# API Outline

Base URL: `/api`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `PATCH /auth/profile`

## Expenses

- `GET /expenses`
- `POST /expenses`
- `GET /expenses/:id`
- `PATCH /expenses/:id`
- `DELETE /expenses/:id`
- `POST /expenses/:id/receipt`

## Analytics

- `GET /analytics/summary`
- `GET /analytics/category-wise`
- `GET /analytics/month-wise`
- `GET /analytics/export`

## Groups and Splits

- `GET /groups`
- `POST /groups`
- `GET /groups/:id`
- `POST /groups/:id/members`
- `POST /groups/:id/splits`
- `POST /groups/:id/settlements`

## Chat

- `GET /groups/:id/messages`
- Socket events:
  - `group:join`
  - `message:send`
  - `message:new`
  - `typing:start`
  - `typing:stop`

## Notifications

- `GET /notifications`
- `PATCH /notifications/:id/read`
- `POST /notifications/subscribe`

## Jobs

- `POST /jobs/monthly-report`
- `POST /jobs/reminder`

