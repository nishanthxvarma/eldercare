# Database Documentation

ElderCare Connect uses MongoDB with Mongoose ORM. The database is designed for a single-facility operation in Version 1, but includes architectural hooks (`facilityId` on core collections) to support multi-tenancy in future versions.

## Collections & Schemas

### 1. `users`
Stores all user accounts (Admins, Caretakers, Family Members).
- **Fields**: `firstName`, `lastName`, `email`, `password` (hashed), `role` (ADMIN, CARETAKER, FAMILY), `facilityId`, `isActive`.
- **Indexes**: `email` (unique).

### 2. `facilities`
Stores facility metadata.
- **Fields**: `name`, `address`, `contactEmail`, `contactPhone`, `isActive`.

### 3. `residents`
Stores elder resident profiles.
- **Fields**: `firstName`, `lastName`, `dateOfBirth`, `gender`, `roomNumber`, `facilityId`, `emergencyContact` (name, relation, phone), `medicalHistory` (allergies, conditions, bloodType).
- **Relationships**: `facilityId` (Ref: Facility).

### 4. `medications`
Stores prescribed medications for residents.
- **Fields**: `residentId`, `name`, `dosage`, `frequency`, `instructions`, `startDate`, `endDate`, `isDeleted`.
- **Relationships**: `residentId` (Ref: Resident).

### 5. `medicationLogs`
Tracks the administration of medications.
- **Fields**: `medicationId`, `residentId`, `caretakerId`, `status` (ADMINISTERED, MISSED, REFUSED), `administeredAt`, `notes`.
- **Relationships**: `medicationId` (Ref: Medication), `residentId` (Ref: Resident), `caretakerId` (Ref: User).

### 6. `healthRecords`
Logs vital signs and discrete health data points.
- **Fields**: `residentId`, `type` (VITALS, LAB_RESULT, ASSESSMENT), `measurements` (bloodPressure, heartRate, temperature, bloodSugar, weight), `recordedAt`, `notes`.
- **Relationships**: `residentId` (Ref: Resident).

### 7. `dailyCareLogs`
Tracks qualitative care events.
- **Fields**: `residentId`, `type` (MEAL, HYGIENE, ACTIVITY, INCIDENT), `description`, `timestamp`, `status`, `notes`.
- **Relationships**: `residentId` (Ref: Resident).

### 8. `messages`
Stores direct messages between users.
- **Fields**: `senderId`, `receiverId`, `content`, `isRead`, `readAt`.
- **Relationships**: `senderId` (Ref: User), `receiverId` (Ref: User).

### 9. `notifications`
Stores system and user alerts.
- **Fields**: `recipientId`, `type` (ALERT, MESSAGE, SYSTEM), `title`, `message`, `isRead`, `linkData`.
- **Relationships**: `recipientId` (Ref: User).

### 10. `activityLogs`
Audit trails for critical system actions.
- **Fields**: `userId`, `action`, `entityType`, `entityId`, `details`, `ipAddress`.
- **Relationships**: `userId` (Ref: User).

---

## Indexing Strategy
- **Users**: Unique index on `email`.
- **Residents**: Indexed on `facilityId` and `roomNumber` for quick roster generation.
- **Medications/Logs/Records**: Indexed heavily on `residentId` and `createdAt`/`timestamp` to support chronological feed generation.
- **Messages**: Compound index on `senderId` and `receiverId`.
