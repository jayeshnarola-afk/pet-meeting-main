# Notification Status Toggle API

## API Endpoint
```
PUT /api/user/notification-status
```

## Authentication
- Requires Bearer token in Authorization header
- User must be authenticated

## Request Body
```json
{
  "notificationType": "matches" | "message",
  "status": true | false | "true" | "false" | "yes" | "no" | "1" | "0" | 1 | 0
}
```

## Parameters
- `notificationType`: Type of notification to toggle
  - `"matches"` - For match notifications
  - `"message"` - For message notifications
- `status`: Notification status
  - `true`, `"true"`, `"yes"`, `"1"`, `1` - Enable notifications (saves as 1)
  - `false`, `"false"`, `"no"`, `"0"`, `0` - Disable notifications (saves as 0)

## Response
```json
{
  "message": "matches notification enabled successfully",
  "notificationType": "matches",
  "status": 1,
  "currentSettings": {
    "matchesNotification": 1,
    "messageNotification": 0
  }
}
```

## Example Usage

### Enable match notifications
```bash
curl -X PUT http://localhost:3000/api/user/notification-status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notificationType": "matches",
    "status": true
  }'
```

### Disable message notifications
```bash
curl -X PUT http://localhost:3000/api/user/notification-status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notificationType": "message",
    "status": "no"
  }'
```

### Enable with different formats
```bash
# Using "yes"
curl -X PUT http://localhost:3000/api/user/notification-status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notificationType": "matches",
    "status": "yes"
  }'

# Using "1"
curl -X PUT http://localhost:3000/api/user/notification-status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notificationType": "message",
    "status": "1"
  }'
```

## Error Responses

### Invalid notification type
```json
{
  "message": "Invalid notification type. Must be \"matches\" or \"message\""
}
```

### Invalid status
```json
{
  "message": "Invalid status. Must be true/yes/1 or false/no/0"
}
```

### User not found
```json
{
  "message": "User not found"
}
```

## Database Storage
- Values are stored as `tinyint` in the database
- `1` = enabled, `0` = disabled
- Default value is `1` (enabled) for both notification types

