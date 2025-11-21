# Home Page API with Matching Count

## API Endpoint
```
GET /api/home
```

## Authentication
- Requires Bearer token in Authorization header
- User must be authenticated

## Query Parameters
- `typeId` (optional): Filter by pet type ID
- `breedId` (optional): Filter by pet breed ID  
- `size` (optional): Filter by pet size
- `personalityIds` (optional): Filter by personality IDs (comma-separated)
- `age` (optional): Filter by pet age
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)

## Response Format

### Success Response
```json
{
  "message": "No pet profiles available at the moment",
  "pets": [
    {
      "id": 1,
      "name": "Buddy",
      "age": 3,
      "size": "medium",
      "description": "Friendly dog",
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
      "personalityNames": ["Friendly", "Active"],
      "ownerName": "John Doe",
      "ownerLocation": "New York",
      "ownerProfilePhoto": "https://0260e1a1083a.ngrok-free.app/uploads/profiles/profile1.jpg",
      "isAlreadyLike": false,
      "totalMatches": 5
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalCount": 100,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null
  },
  "filters": {
    "typeId": null,
    "breedId": null,
    "size": null,
    "personalityIds": null,
    "age": null
  },
  "userPets": {
    "totalPets": 2,
    "enabledPets": 1,
    "disabledPets": 1
  }
}
```

## New Field Added

### `totalMatches`
- **Type**: `number`
- **Description**: Total number of matches for this pet
- **Calculation**: Counts matches where the pet is either `pet1` or `pet2` in the Match table
- **Default**: `0` if no matches found

## Example Usage

### Get all pets with matching counts
```bash
curl -X GET "http://localhost:3000/api/home" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get pets with filters and matching counts
```bash
curl -X GET "http://localhost:3000/api/home?typeId=1&size=medium&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get pets by personality
```bash
curl -X GET "http://localhost:3000/api/home?personalityIds=1,2,3" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Response Fields Explanation

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
- `ownerName`: Pet owner's full name
- `ownerLocation`: Pet owner's location
- `ownerProfilePhoto`: Pet owner's profile photo URL
- `isAlreadyLike`: Whether current user has already liked this pet
- **`totalMatches`**: **NEW** - Total number of matches for this pet

### Pagination Fields
- `currentPage`: Current page number
- `totalPages`: Total number of pages
- `totalCount`: Total number of pets matching filters
- `limit`: Number of items per page
- `hasNextPage`: Whether there's a next page
- `hasPrevPage`: Whether there's a previous page
- `nextPage`: Next page number (null if no next page)
- `prevPage`: Previous page number (null if no previous page)

## Database Query Details

The matching count is calculated by:
1. Counting matches where the pet is `pet1` in the Match table
2. Counting matches where the pet is `pet2` in the Match table  
3. Adding both counts together for the total
4. Only counting active matches (`isActive = true`)

This ensures that all matches for a pet are counted regardless of whether they were the initiator or recipient of the match.


