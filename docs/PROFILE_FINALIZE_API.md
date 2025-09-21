# Profile Finalize API

## Overview

The `/api/profile/finalize` endpoint is a server-only route that handles the finalization of user profiles during the onboarding process. It ensures data integrity by using database transactions and enforces Row Level Security (RLS) policies.

## Endpoint

```
POST /api/profile/finalize
```

## Authentication

- **Required**: JWT token in Authorization header
- **Format**: `Bearer <token>`
- **Source**: Supabase Auth session

## Request Body

```typescript
{
  // Required fields
  username: string
  age: number
  gender: string
  height: number
  weight: number
  activity_level: "low" | "moderate" | "high"
  health_goal: string
  
  // Optional fields
  full_name?: string
  calorie_target?: number
  dietary_preferences?: string[]
  excluded_ingredients?: string[]
  include_snacks?: boolean
  allergies?: string[]
  intolerances?: string[]
  max_prep_time?: number
  macro_priority?: string
}
```

## Response

### Success (201 Created)

```typescript
{
  message: "Profile created successfully",
  user: {
    id: string
    email: string
    full_name: string | null
    username: string
    created_at: string
    updated_at: string
  },
  preferences: {
    id: string
    user_id: string
    age: number
    gender: string
    height: number
    weight: number
    activity_level: string
    health_goal: string
    calorie_target: number
    // ... other preference fields
  }
}
```

### Error Responses

#### 401 Unauthorized
```typescript
{
  error: "Unauthorized",
  message: "Invalid or missing authentication"
}
```

#### 400 Bad Request
```typescript
{
  error: "Bad Request",
  message: "Missing required fields"
}
```

#### 409 Conflict
```typescript
{
  error: "Conflict",
  message: "User profile already exists"
}
```

#### 500 Internal Server Error
```typescript
{
  error: "Database error" | "Internal Server Error",
  message: "Detailed error message"
}
```

## Features

### 1. Authentication
- Validates JWT token from Supabase Auth
- Ensures only authenticated users can create profiles

### 2. Duplicate Prevention
- Checks if user profile already exists
- Returns 409 Conflict if profile exists

### 3. Username Resolution
- Automatically resolves username conflicts
- Appends numbers to make username unique (e.g., `john`, `john1`, `john2`)

### 4. Transaction Safety
- Uses database transactions for data integrity
- Rolls back user creation if preferences creation fails

### 5. RLS Enforcement
- Enforces Row Level Security policies
- Only allows users to create their own profiles

### 6. Metadata Update
- Sets `onboarding_complete: true` in user metadata
- Updates user metadata with profile information

## Database Operations

1. **Check existing user**: Verifies no profile exists
2. **Resolve username**: Ensures username uniqueness
3. **Insert user profile**: Creates record in `public.users`
4. **Insert preferences**: Creates record in `public.user_preferences`
5. **Update metadata**: Sets onboarding completion flag

## Security

- **RLS Policies**: Enforced on both `users` and `user_preferences` tables
- **Authentication**: JWT token validation
- **Authorization**: Users can only create their own profiles
- **Data Validation**: Required field validation
- **Transaction Safety**: Atomic operations with rollback

## Usage Example

```typescript
const response = await fetch('/api/profile/finalize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  },
  body: JSON.stringify({
    username: 'johndoe',
    age: 30,
    gender: 'male',
    height: 175,
    weight: 70,
    activity_level: 'moderate',
    health_goal: 'maintain_weight',
    calorie_target: 2200,
    dietary_preferences: ['vegetarian'],
    excluded_ingredients: ['nuts']
  })
})

const result = await response.json()
```

## Error Handling

The API provides detailed error messages for different scenarios:

- **Missing authentication**: 401 with clear message
- **Profile already exists**: 409 with conflict message
- **Missing required fields**: 400 with validation message
- **Database errors**: 500 with specific error details
- **Transaction failures**: Automatic rollback with error reporting

## Testing

Use the provided test script:

```bash
npx tsx scripts/test-profile-finalize.ts
```

This will:
1. Create a test user
2. Test profile creation
3. Test duplicate prevention
4. Clean up test data
