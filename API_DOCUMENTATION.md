# API Documentation

All API requests expect and return `application/json`.
Base URL: `/api/v1` (or as configured in environment variables).

## Authentication APIs

### `POST /auth/register`
Creates a new user account.
- **Body**: `{ email, password, firstName, lastName, role, facilityId }`
- **Response**: `201 Created` - `{ success: true, data: user }`

### `POST /auth/login`
Authenticates a user and sets an HttpOnly refresh token cookie.
- **Body**: `{ email, password }`
- **Response**: `200 OK` - `{ success: true, data: { user, accessToken } }`

### `POST /auth/refresh`
Generates a new access token using the stored refresh token cookie.
- **Response**: `200 OK` - `{ success: true, accessToken }`

### `POST /auth/logout`
Clears the refresh token cookie.
- **Response**: `200 OK` - `{ success: true }`

---

## Resident APIs

### `POST /residents`
Add a new resident. (Admin only)
- **Body**: `{ firstName, lastName, dateOfBirth, gender, roomNumber, emergencyContact, medicalHistory }`
- **Response**: `201 Created`

### `GET /residents`
Fetch all residents. Supports search.
- **Query Params**: `?search=John`
- **Response**: `200 OK` - `{ success: true, data: { residents, pagination } }`

### `GET /residents/:id`
Fetch a specific resident by ID.
- **Response**: `200 OK`

---

## Medication APIs

### `POST /medications`
Assign a new medication to a resident.
- **Body**: `{ residentId, name, dosage, frequency, instructions, startDate, endDate }`
- **Response**: `201 Created`

### `GET /medications`
Fetch medications, optionally filtered by resident.
- **Query Params**: `?residentId=123`
- **Response**: `200 OK`

### `POST /medications/:id/log`
Log the administration of a medication.
- **Body**: `{ status: 'ADMINISTERED' | 'MISSED' | 'REFUSED', notes }`
- **Response**: `201 Created`

---

## Care Log APIs

### `POST /health-records`
Log vitals or medical measurements.
- **Body**: `{ residentId, type: 'VITALS', measurements: { bloodPressure, heartRate, ... } }`
- **Response**: `201 Created`

### `GET /health-records`
Retrieve health records for a resident.
- **Query Params**: `?residentId=123`
- **Response**: `200 OK`

### `POST /daily-care-logs`
Log meals, activities, or general care notes.
- **Body**: `{ residentId, type: 'MEAL' | 'ACTIVITY', description, status }`
- **Response**: `201 Created`

### `GET /daily-care-logs`
Retrieve daily care logs for a resident.
- **Response**: `200 OK`

---

## Notification APIs

### `GET /notifications`
Retrieve user notifications.
- **Query Params**: `?isRead=false`
- **Response**: `200 OK`

### `PATCH /notifications/:id/read`
Mark a specific notification as read.
- **Response**: `200 OK`

### `PATCH /notifications/read-all`
Mark all notifications for the current user as read.
- **Response**: `200 OK`

---

## Messaging APIs

### `GET /messages`
Retrieve message history between two users.
- **Query Params**: `?userId=456`
- **Response**: `200 OK`

*Note: Real-time messaging transmission is handled via Socket.io events (`send_message`, `receive_message`).*
