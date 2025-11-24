# Pet List API with Matching Count

## API Endpoint
```
GET /api/pets
```

## Authentication
- Requires Bearer token in Authorization header
- User must be authenticated
- Returns all pets owned by the current user

## Response Format

### Success Response
```json
{
  "message": "Pets retrieved successfully",
  "pets": [
    {
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
      "ownerId": 1,
      "typeId": 1,
      "breedId": 5,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "typeName": "Dog",
      "breedName": "Golden Retriever",
      "personalityNames": ["Friendly", "Active", "Playful"],
      "totalMatches": 8
    },
    {
      "id": 2,
      "name": "Whiskers",
      "age": 2,
      "size": "small",
      "description": "Cute and cuddly cat",
      "photos": [
        "https://0260e1a1083a.ngrok-free.app/uploads/pets/photo3.jpg"
      ],
      "isEnabled": true,
      "ownerId": 1,
      "typeId": 2,
      "breedId": 8,
      "createdAt": "2024-01-20T14:15:00.000Z",
      "updatedAt": "2024-01-20T14:15:00.000Z",
      "typeName": "Cat",
      "breedName": "Persian",
      "personalityNames": ["Calm", "Affectionate"],
      "totalMatches": 3
    },
    {
      "id": 3,
      "name": "Max",
      "age": 4,
      "size": "large",
      "description": "Big and strong dog",
      "photos": [],
      "isEnabled": false,
      "ownerId": 1,
      "typeId": 1,
      "breedId": 3,
      "createdAt": "2024-01-10T09:00:00.000Z",
      "updatedAt": "2024-01-10T09:00:00.000Z",
      "typeName": "Dog",
      "breedName": "German Shepherd",
      "personalityNames": ["Protective", "Loyal"],
      "totalMatches": 0
    }
  ],
  "count": 3
}
```

## New Field Added

### `totalMatches` (in each pet object)
- **Type**: `number`
- **Description**: Total number of matches for this pet
- **Calculation**: 
  - Counts matches where the pet is `pet1` (initiator)
  - Counts matches where the pet is `pet2` (recipient)
  - Adds both counts together for total matches
  - Only counts active matches (`isActive = true`)
- **Default**: `0` if no matches found

## Example Usage

### Get all user's pets with matching counts
```bash
curl -X GET "http://localhost:3000/api/pets" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response for user with 3 pets
```json
{
  "message": "Pets retrieved successfully",
  "pets": [
    {
      "id": 1,
      "name": "Buddy",
      "age": 3,
      "size": "medium",
      "description": "Friendly dog who loves to play",
      "photos": [
        "https://0260e1a1083a.ngrok-free.app/uploads/pets/photo1.jpg"
      ],
      "isEnabled": true,
      "ownerId": 1,
      "typeId": 1,
      "breedId": 5,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "typeName": "Dog",
      "breedName": "Golden Retriever",
      "personalityNames": ["Friendly", "Active", "Playful"],
      "totalMatches": 8
    },
    {
      "id": 2,
      "name": "Whiskers",
      "age": 2,
      "size": "small",
      "description": "Cute and cuddly cat",
      "photos": [
        "https://0260e1a1083a.ngrok-free.app/uploads/pets/photo3.jpg"
      ],
      "isEnabled": true,
      "ownerId": 1,
      "typeId": 2,
      "breedId": 8,
      "createdAt": "2024-01-20T14:15:00.000Z",
      "updatedAt": "2024-01-20T14:15:00.000Z",
      "typeName": "Cat",
      "breedName": "Persian",
      "personalityNames": ["Calm", "Affectionate"],
      "totalMatches": 3
    }
  ],
  "count": 2
}
```

## Error Responses

### Server Error
```json
{
  "message": "Server error"
}
```

## Database Query Details

The matching count is calculated using two separate queries for all user's pets:

1. **Matches as Pet1**: Counts matches where each pet is the initiator
   ```sql
   SELECT pet1Id, COUNT(*) FROM matches 
   WHERE pet1Id IN (petIds) AND isActive = true
   GROUP BY pet1Id
   ```

2. **Matches as Pet2**: Counts matches where each pet is the recipient
   ```sql
   SELECT pet2Id, COUNT(*) FROM matches 
   WHERE pet2Id IN (petIds) AND isActive = true
   GROUP BY pet2Id
   ```

3. **Total Matches**: Adds both counts together for each pet

This ensures that all matches for each pet are counted regardless of whether they initiated the match or received it.

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

### Response Metadata
- `count`: Total number of pets owned by the user

## Use Cases

This API is useful for:
- Pet owners to see how many matches each of their pets has
- Displaying match statistics in the pet list
- Showing pet popularity metrics for all user's pets
- Analytics and reporting features
- Comparing match performance across different pets
- Managing pet profiles with match insights

## Ordering

Pets are ordered by creation date in descending order (newest first), so the most recently added pets appear first in the list.


