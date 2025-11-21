# Get Pet By ID API with Matching Count

## API Endpoint
```
GET /api/pets/{petId}
```

## Authentication
- Requires Bearer token in Authorization header
- User must be authenticated
- User can only access their own pets

## Path Parameters
- `petId` (required): The ID of the pet to retrieve

## Response Format

### Success Response
```json
{
  "message": "Pet retrieved successfully",
  "pet": {
    "id": 1,
    "name": "Buddy",
    "age": 3,
    "size": "medium",
    "description": "Friendly dog who loves to play",
    "photos": [
      "https://0260e1a1083a.ngrok-free.app/uploads/pets/photo1.jpg",
      "https://0260e1a1083a.ngrok-free.app/uploads/pets/photo2.jpg"
    ],
    "isEnabled": true,
    "ownerId": 2,
    "typeId": 1,
    "breedId": 5,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "typeName": "Dog",
    "breedName": "Golden Retriever",
    "personalityNames": ["Friendly", "Active", "Playful"],
    "totalMatches": 8
  }
}
```

## New Field Added

### `totalMatches`
- **Type**: `number`
- **Description**: Total number of matches for this pet
- **Calculation**: 
  - Counts matches where the pet is `pet1` (initiator)
  - Counts matches where the pet is `pet2` (recipient)
  - Adds both counts together for total matches
  - Only counts active matches (`isActive = true`)
- **Default**: `0` if no matches found

## Example Usage

### Get pet details with matching count
```bash
curl -X GET "http://localhost:3000/api/pets/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response for a pet with 8 matches
```json
{
  "message": "Pet retrieved successfully",
  "pet": {
    "id": 1,
    "name": "Buddy",
    "age": 3,
    "size": "medium",
    "description": "Friendly dog who loves to play",
    "photos": [
      "https://0260e1a1083a.ngrok-free.app/uploads/pets/photo1.jpg"
    ],
    "isEnabled": true,
    "ownerId": 2,
    "typeId": 1,
    "breedId": 5,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "typeName": "Dog",
    "breedName": "Golden Retriever",
    "personalityNames": ["Friendly", "Active", "Playful"],
    "totalMatches": 8
  }
}
```

## Error Responses

### Invalid Pet ID
```json
{
  "message": "Invalid pet ID"
}
```

### Pet Not Found
```json
{
  "message": "Pet not found"
}
```

### Server Error
```json
{
  "message": "Server error"
}
```

## Database Query Details

The matching count is calculated using two separate queries:

1. **Matches as Pet1**: Counts matches where the pet is the initiator
   ```sql
   SELECT COUNT(*) FROM matches 
   WHERE pet1Id = ? AND isActive = true
   ```

2. **Matches as Pet2**: Counts matches where the pet is the recipient
   ```sql
   SELECT COUNT(*) FROM matches 
   WHERE pet2Id = ? AND isActive = true
   ```

3. **Total Matches**: Adds both counts together

This ensures that all matches for a pet are counted regardless of whether they initiated the match or received it.

## Field Descriptions

### Pet Object Fields
- `id`: Pet ID
- `name`: Pet name
- `age`: Pet age
- `size`: Pet size (small, medium, large)
- `description`: Pet description
- `photos`: Array of photo URLs
- `isEnabled`: Whether pet is enabled for matching
- `ownerId`: ID of pet owner
- `typeId`: Pet type ID
- `breedId`: Pet breed ID
- `createdAt`: Pet creation date
- `updatedAt`: Pet last update date

### Additional Fields
- `typeName`: Pet type name (e.g., "Dog", "Cat")
- `breedName`: Pet breed name (e.g., "Golden Retriever")
- `personalityNames`: Array of personality trait names
- **`totalMatches`**: **NEW** - Total number of matches for this pet

## Use Cases

This API is useful for:
- Pet owners to see how many matches their pet has
- Displaying match statistics in the pet profile
- Showing pet popularity metrics
- Analytics and reporting features


