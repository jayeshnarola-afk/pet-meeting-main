# 🐾 PetMeeter API - CURL Commands Documentation

## Base URL
```
http://localhost:4000
```

---

## 📋 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User Profile APIs](#user-profile-apis)
3. [Pet Management APIs](#pet-management-apis)
4. [File Upload APIs](#file-upload-apis)

---

## 🔐 Authentication APIs

### 1. User Registration

**Endpoint:** `POST /api/auth/signup-with-files`

**Content-Type:** `multipart/form-data`

**CURL Command:**
```bash
curl --location 'http://localhost:4000/api/auth/signup-with-files' \
  --form 'fullName="Priya Sharma"' \
  --form 'age="28"' \
  --form 'email="priya@example.com"' \
  --form 'password="password123"' \
  --form 'location="Mumbai"' \
  --form 'profilePhoto=@"/home/freshcodes/Pictures/Wallpapers/pexels-eberhardgross-730981.jpg"'
```

**Response:**
```json
{
  "message": "User registered successfully. You can now add your pets!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoicHJpeWExMjNAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjAzNTUyNjV9.44l-CaVoW0DOJLSM4yCM3LU5iWtMmtXkBmqA3xhc3Wg",
  "user": {
    "id": 10,
    "fullName": "Priya Sharma",
    "email": "priya@example.com",
    "age": 28,
    "location": "Mumbai",
    "profilePhoto": "/uploads/profiles/profile-1760355264974-630046463.jpg"
  }
}
```

---

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Content-Type:** `application/json`

**CURL Command:**
```bash
curl --location 'http://localhost:4000/api/auth/login' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "priya@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 10,
    "fullName": "Priya Sharma",
    "email": "priya@example.com",
    "age": 28,
    "location": "Mumbai",
    "profilePhoto": "/uploads/profiles/profile-1760355264974-630046463.jpg"
  }
}
```

---

### 3. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Content-Type:** `application/json`

**CURL Command:**
```bash
curl --location 'http://localhost:4000/api/auth/forgot-password' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "priya@example.com"
  }'
```

**Response:**
```json
{
  "message": "OTP sent to your email",
  "email": "priya@example.com"
}
```

---

### 4. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Content-Type:** `application/json`

**CURL Command:**
```bash
curl --location 'http://localhost:4000/api/auth/reset-password' \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "priya@example.com",
    "otp": "123456",
    "newPassword": "newpassword123"
  }'
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

---

## 👤 User Profile APIs

**Note:** All user profile endpoints require JWT token in Authorization header.

### 1. Get User Profile

**Endpoint:** `GET /api/user/profile`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**CURL Command:**
```bash
curl --location 'http://localhost:4000/api/user/profile' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoicHJpeWExMjNAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjAzNTUyNjV9.44l-CaVoW0DOJLSM4yCM3LU5iWtMmtXkBmqA3xhc3Wg'
```

**Response:**
```json
{
  "message": "User profile retrieved successfully",
  "user": {
    "id": 10,
    "fullName": "Priya Sharma",
    "email": "priya@example.com",
    "age": 28,
    "location": "Mumbai",
    "profilePhoto": "/uploads/profiles/profile-1760355264974-630046463.jpg",
    "createdAt": "2025-10-13T11:34:55.084Z",
    "updatedAt": "2025-10-13T11:34:55.084Z"
  }
}
```

---

### 2. Update User Profile

**Endpoint:** `PUT /api/user/profile`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`

**CURL Command:**
```bash
curl --location --request PUT 'http://localhost:4000/api/user/profile' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoicHJpeWExMjNAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjAzNTUyNjV9.44l-CaVoW0DOJLSM4yCM3LU5iWtMmtXkBmqA3xhc3Wg' \
  --header 'Content-Type: application/json' \
  --data '{
    "fullName": "Priya Sharma Updated",
    "age": 29,
    "location": "Delhi",
    "bio": "Love pets and nature!"
  }'
```

**Response:**
```json
{
  "message": "User profile updated successfully",
  "user": {
    "id": 10,
    "fullName": "Priya Sharma Updated",
    "email": "priya@example.com",
    "age": 29,
    "location": "Delhi",
    "bio": "Love pets and nature!",
    "profilePhoto": "/uploads/profiles/profile-1760355264974-630046463.jpg",
    "updatedAt": "2025-10-13T11:45:30.123Z"
  }
}
```

---

### 3. Change Password

**Endpoint:** `POST /api/user/change-password`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`

**CURL Command:**
```bash
curl --location 'http://localhost:4000/api/user/change-password' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoicHJpeWExMjNAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjAzNTUyNjV9.44l-CaVoW0DOJLSM4yCM3LU5iWtMmtXkBmqA3xhc3Wg' \
  --header 'Content-Type: application/json' \
  --data '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

---

### 4. Delete User Profile

**Endpoint:** `DELETE /api/user/profile`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**CURL Command:**
```bash
curl --location --request DELETE 'http://localhost:4000/api/user/profile' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoicHJpeWExMjNAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjAzNTUyNjV9.44l-CaVoW0DOJLSM4yCM3LU5iWtMmtXkBmqA3xhc3Wg'
```

**Response:**
```json
{
  "message": "User profile deleted successfully"
}
```

---

## 🐾 Pet Management APIs

**Note:** All pet endpoints require JWT token in Authorization header.

### 1. Get All User's Pets

**Endpoint:** `GET /api/pets`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**CURL Command:**
```bash
curl --location 'http://localhost:4000/api/pets' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoicHJpeWExMjNAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjAzNTUyNjV9.44l-CaVoW0DOJLSM4yCM3LU5iWtMmtXkBmqA3xhc3Wg'
```

**Response:**
```json
{
  "message": "Pets retrieved successfully",
  "pets": [
    {
      "id": 15,
      "name": "Whiskers",
      "type": "cat",
      "breed": "Persian",
      "age": 2,
      "gender": "female",
      "size": "small",
      "color": "white",
      "personality": null,
      "bio": null,
      "vaccinationNotes": null,
      "specialNeeds": null,
      "photos": ["/uploads/pets/pet-1760355321566-758880184.png"],
      "ownerId": 10,
      "createdAt": "2025-10-13T11:35:21.578Z",
      "updatedAt": "2025-10-13T11:35:21.578Z"
    },
    {
      "id": 14,
      "name": "Bruno",
      "type": "dog",
      "breed": "Golden Retriever",
      "age": 3,
      "gender": "male",
      "size": "large",
      "color": "golden",
      "personality": "friendly",
      "bio": "Very playful dog",
      "vaccinationNotes": null,
      "specialNeeds": null,
      "photos": [
        "/uploads/pets/pet-1760355295064-611245347.png",
        "/uploads/pets/pet-1760355295066-743910970.png",
        "/uploads/pets/pet-1760355295069-114118248.png"
      ],
      "ownerId": 10,
      "createdAt": "2025-10-13T11:34:55.084Z",
      "updatedAt": "2025-10-13T11:34:55.084Z"
    }
  ],
  "count": 2
}
```

---

### 2. Get Single Pet

**Endpoint:** `GET /api/pets/:id`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**CURL Command:**
```bash
curl --location 'http://localhost:4000/api/pets/14' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoicHJpeWExMjNAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjAzNTUyNjV9.44l-CaVoW0DOJLSM4yCM3LU5iWtMmtXkBmqA3xhc3Wg'
```

**Response:**
```json
{
  "message": "Pet retrieved successfully",
  "pet": {
    "id": 14,
    "name": "Bruno",
    "type": "dog",
    "breed": "Golden Retriever",
    "age": 3,
    "gender": "male",
    "size": "large",
    "color": "golden",
    "personality": "friendly",
    "bio": "Very playful dog",
    "photos": [
      "/uploads/pets/pet-1760355295064-611245347.png",
      "/uploads/pets/pet-1760355295066-743910970.png",
      "/uploads/pets/pet-1760355295069-114118248.png"
    ],
    "ownerId": 10,
    "createdAt": "2025-10-13T11:34:55.084Z",
    "updatedAt": "2025-10-13T11:34:55.084Z"
  }
}
```

---

### 3. Add Pet (with FormData)

**Endpoint:** `POST /api/pets/add-with-files`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Content-Type:** `multipart/form-data`

**CURL Command:**
```bash
curl --location 'http://localhost:4000/api/pets/add-with-files' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoicHJpeWExMjNAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjAzNTUyNjV9.44l-CaVoW0DOJLSM4yCM3LU5iWtMmtXkBmqA3xhc3Wg' \
  --form 'name="Bruno"' \
  --form 'typeId="1"' \
  --form 'breedId="1"' \
  --form 'age="3"' \
  --form 'gender="male"' \
  --form 'size="large"' \
  --form 'color="golden"' \
  --form 'personalityIds="1,2,3"' \
  --form 'bio="Very playful dog"' \
  --form 'vaccinationNotes="All vaccinations up to date"' \
  --form 'specialNeeds="None"' \
  --form 'lookingFor="Playmate"' \
  --form 'isEnabled="true"' \
  --form 'petPhotos=@"/home/freshcodes/Pictures/Screenshot from 2025-10-02 16-24-29.png"' \
  --form 'petPhotos=@"/home/freshcodes/Pictures/Screenshot from 2025-10-02 12-53-25.png"' \
  --form 'petPhotos=@"/home/freshcodes/Pictures/Screenshot from 2025-10-02 12-31-26.png"'
```

**Response:**
```json
{
  "message": "Pet added successfully",
  "pet": {
    "id": 14,
    "name": "Bruno",
    "type": "dog",
    "breed": "Golden Retriever",
    "age": 3,
    "gender": "male",
    "photos": [
      "/uploads/pets/pet-1760355295064-611245347.png",
      "/uploads/pets/pet-1760355295066-743910970.png",
      "/uploads/pets/pet-1760355295069-114118248.png"
    ],
    "createdAt": "2025-10-13T11:34:55.084Z"
  }
}
```

---

### 4. Add Pet (JSON - backward compatibility)

**Endpoint:** `POST /api/pets`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`

**CURL Command:**
```bash
curl --location 'http://localhost:4000/api/pets' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoicHJpeWExMjNAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjAzNTUyNjV9.44l-CaVoW0DOJLSM4yCM3LU5iWtMmtXkBmqA3xhc3Wg' \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "Whiskers",
    "typeId": 2,
    "breedId": 2,
    "age": 2,
    "gender": "female",
    "size": "small",
    "color": "white",
    "personalityIds": [4, 5],
    "bio": "Very gentle cat",
    "vaccinationNotes": "All vaccinations complete",
    "specialNeeds": "None",
    "lookingFor": "Quiet companion",
    "isEnabled": true,
    "photos": [
      "/uploads/pets/pet-1760355321566-758880184.png"
    ]
  }'
```

**Response:**
```json
{
  "message": "Pet added successfully",
  "pet": {
    "id": 15,
    "name": "Whiskers",
    "type": "cat",
    "breed": "Persian",
    "age": 2,
    "gender": "female",
    "size": "small",
    "color": "white",
    "personality": "calm",
    "bio": "Very gentle cat",
    "photos": ["/uploads/pets/pet-1760355321566-758880184.png"],
    "ownerId": 10,
    "createdAt": "2025-10-13T11:35:21.578Z",
    "updatedAt": "2025-10-13T11:35:21.578Z"
  }
}
```

---

### 5. Update Pet

**Endpoint:** `PUT /api/pets/:id`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`

**CURL Command:**
```bash
curl --location --request PUT 'http://localhost:4000/api/pets/14' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoicHJpeWExMjNAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjAzNTUyNjV9.44l-CaVoW0DOJLSM4yCM3LU5iWtMmtXkBmqA3xhc3Wg' \
  --header 'Content-Type: application/json' \
  --data '{
    "name": "Bruno Updated",
    "age": 4,
    "bio": "Updated bio - now 4 years old",
    "personality": "very friendly"
  }'
```

**Response:**
```json
{
  "message": "Pet updated successfully",
  "pet": {
    "id": 14,
    "name": "Bruno Updated",
    "type": "dog",
    "breed": "Golden Retriever",
    "age": 4,
    "gender": "male",
    "size": "large",
    "color": "golden",
    "personality": "very friendly",
    "bio": "Updated bio - now 4 years old",
    "photos": [
      "/uploads/pets/pet-1760355295064-611245347.png",
      "/uploads/pets/pet-1760355295066-743910970.png",
      "/uploads/pets/pet-1760355295069-114118248.png"
    ],
    "ownerId": 10,
    "createdAt": "2025-10-13T11:34:55.084Z",
    "updatedAt": "2025-10-13T11:45:30.123Z"
  }
}
```

---

### 6. Delete Pet

**Endpoint:** `DELETE /api/pets/:id`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**CURL Command:**
```bash
curl --location --request DELETE 'http://localhost:4000/api/pets/14' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoicHJpeWExMjNAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjAzNTUyNjV9.44l-CaVoW0DOJLSM4yCM3LU5iWtMmtXkBmqA3xhc3Wg'
```

**Response:**
```json
{
  "message": "Pet deleted successfully"
}
```

---

### 7. Add Photo to Pet

**Endpoint:** `POST /api/pets/:id/photos`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`

**CURL Command:**
```bash
curl --location 'http://localhost:4000/api/pets/15/photos' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoicHJpeWExMjNAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjAzNTUyNjV9.44l-CaVoW0DOJLSM4yCM3LU5iWtMmtXkBmqA3xhc3Wg' \
  --header 'Content-Type: application/json' \
  --data '{
    "photoPath": "/uploads/pets/pet-new-photo-123456.jpg"
  }'
```

**Response:**
```json
{
  "message": "Photo added successfully",
  "pet": {
    "id": 15,
    "name": "Whiskers",
    "photos": [
      "/uploads/pets/pet-1760355321566-758880184.png",
      "/uploads/pets/pet-new-photo-123456.jpg"
    ]
  }
}
```

---

### 8. Remove Photo from Pet

**Endpoint:** `DELETE /api/pets/:id/photos`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`

**CURL Command:**
```bash
curl --location --request DELETE 'http://localhost:4000/api/pets/15/photos' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoicHJpeWExMjNAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjAzNTUyNjV9.44l-CaVoW0DOJLSM4yCM3LU5iWtMmtXkBmqA3xhc3Wg' \
  --header 'Content-Type: application/json' \
  --data '{
    "photoPath": "/uploads/pets/pet-new-photo-123456.jpg"
  }'
```

**Response:**
```json
{
  "message": "Photo removed successfully",
  "pet": {
    "id": 15,
    "name": "Whiskers",
    "photos": ["/uploads/pets/pet-1760355321566-758880184.png"]
  }
}
```

---

## 📁 File Upload APIs

### 1. Upload Profile Photo

**Endpoint:** `POST /api/upload/profile`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Content-Type:** `multipart/form-data`

**CURL Command:**
```bash
curl --location 'http://localhost:4000/api/upload/profile' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoicHJpeWExMjNAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjAzNTUyNjV9.44l-CaVoW0DOJLSM4yCM3LU5iWtMmtXkBmqA3xhc3Wg' \
  --form 'profilePhoto=@"/home/freshcodes/Pictures/Wallpapers/pexels-eberhardgross-730981.jpg"'
```

**Response:**
```json
{
  "message": "Profile photo uploaded successfully",
  "filePath": "/uploads/profiles/profile-1760355264974-630046463.jpg",
  "fileDetails": {
    "originalName": "pexels-eberhardgross-730981.jpg",
    "fileName": "profile-1760355264974-630046463.jpg",
    "size": 1234567,
    "mimeType": "image/jpeg"
  }
}
```

---

### 2. Upload Pet Photos

**Endpoint:** `POST /api/upload/pets/:petId`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Content-Type:** `multipart/form-data`

**CURL Command:**
```bash
curl --location 'http://localhost:4000/api/upload/pets/15' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTAsImVtYWlsIjoicHJpeWExMjNAZXhhbXBsZS5jb20iLCJpYXQiOjE3NjAzNTUyNjV9.44l-CaVoW0DOJLSM4yCM3LU5iWtMmtXkBmqA3xhc3Wg' \
  --form 'petPhotos=@"/home/freshcodes/Pictures/Screenshot from 2025-10-02 16-24-29.png"' \
  --form 'petPhotos=@"/home/freshcodes/Pictures/Screenshot from 2025-10-02 12-53-25.png"' \
  --form 'petPhotos=@"/home/freshcodes/Pictures/Screenshot from 2025-10-02 12-31-26.png"'
```

**Response:**
```json
{
  "message": "Pet photos uploaded successfully for pet 15",
  "petId": "15",
  "filePaths": [
    "/uploads/pets/pet-1760355295064-611245347.png",
    "/uploads/pets/pet-1760355295066-743910970.png",
    "/uploads/pets/pet-1760355295069-114118248.png"
  ],
  "fileDetails": [
    {
      "originalName": "Screenshot from 2025-10-02 16-24-29.png",
      "fileName": "pet-1760355295064-611245347.png",
      "size": 123456,
      "mimeType": "image/png"
    },
    {
      "originalName": "Screenshot from 2025-10-02 12-53-25.png",
      "fileName": "pet-1760355295066-743910970.png",
      "size": 234567,
      "mimeType": "image/png"
    },
    {
      "originalName": "Screenshot from 2025-10-02 12-31-26.png",
      "fileName": "pet-1760355295069-114118248.png",
      "size": 345678,
      "mimeType": "image/png"
    }
  ]
}
```

---

## 🔄 Complete Registration Flow Example

### Step 1: Register User
```bash
# Save the token from this response!
curl --location 'http://localhost:4000/api/auth/signup-with-files' \
  --form 'fullName="Raj Kumar"' \
  --form 'age="30"' \
  --form 'email="raj@example.com"' \
  --form 'password="password123"' \
  --form 'location="Bangalore"' \
  --form 'profilePhoto=@"/home/freshcodes/Pictures/Wallpapers/pexels-eberhardgross-730981.jpg"'
```

### Step 2: Add First Pet
```bash
# Use the token from Step 1
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl --location 'http://localhost:4000/api/pets/add-with-files' \
  --header "Authorization: Bearer $TOKEN" \
  --form 'name="Max"' \
  --form 'typeId="1"' \
  --form 'breedId="1"' \
  --form 'age="2"' \
  --form 'gender="male"' \
  --form 'size="medium"' \
  --form 'color="brown"' \
  --form 'personalityIds="1,2"' \
  --form 'bio="Very energetic dog"' \
  --form 'vaccinationNotes="All vaccinations up to date"' \
  --form 'specialNeeds="None"' \
  --form 'lookingFor="Playmate"' \
  --form 'isEnabled="true"' \
  --form 'petPhotos=@"/home/freshcodes/Pictures/dog1.jpg"' \
  --form 'petPhotos=@"/home/freshcodes/Pictures/dog2.jpg"'
```

### Step 3: Add Second Pet
```bash
curl --location 'http://localhost:4000/api/pets/add-with-files' \
  --header "Authorization: Bearer $TOKEN" \
  --form 'name="Fluffy"' \
  --form 'typeId="2"' \
  --form 'breedId="2"' \
  --form 'age="1"' \
  --form 'gender="female"' \
  --form 'size="small"' \
  --form 'color="white"' \
  --form 'personalityIds="4,5"' \
  --form 'bio="Very gentle cat"' \
  --form 'vaccinationNotes="All vaccinations complete"' \
  --form 'specialNeeds="None"' \
  --form 'lookingFor="Quiet companion"' \
  --form 'isEnabled="true"' \
  --form 'petPhotos=@"/home/freshcodes/Pictures/cat1.jpg"'
```

### Step 4: Get All Pets
```bash
curl --location 'http://localhost:4000/api/pets' \
  --header "Authorization: Bearer $TOKEN"
```

### Step 5: Get User Profile
```bash
curl --location 'http://localhost:4000/api/user/profile' \
  --header "Authorization: Bearer $TOKEN"
```

---

## 📊 Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

## 🖼️ Image URLs

Uploaded images are accessible at:
```
http://localhost:4000/uploads/profiles/<filename>
http://localhost:4000/uploads/pets/<filename>
```

**Examples:**
- Profile: `http://localhost:4000/uploads/profiles/profile-1760355264974-630046463.jpg`
- Pet: `http://localhost:4000/uploads/pets/pet-1760355295064-611245347.png`

---

## ⚠️ Important Notes

1. **JWT Token:** Save the token from signup/login and use it in all protected routes
2. **File Size:** Max 5MB per file
3. **Pet Photos:** Max 3 photos per pet
4. **File Types:** JPEG, JPG, PNG, GIF, WebP
5. **OTP Expiry:** 10 minutes for forgot password

---

**Last Updated:** October 13, 2025  
**API Version:** 1.0.0

**Happy Testing! 🚀**
