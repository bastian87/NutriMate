# Profile Restart API

## Overview

The Profile Restart API allows users to delete their incomplete accounts and start fresh. This is useful when users get stuck during the onboarding process or want to restart with different credentials.

## Endpoint

```
POST /api/profile/restart
```

## Authentication

- **Required**: JWT token in Authorization header
- **Format**: `Bearer <token>`
- **Source**: Supabase Auth session

## Prerequisites

The API will only work if ALL of the following conditions are met:

1. **User is authenticated** (valid JWT token)
2. **Onboarding is NOT complete** (`user_metadata.onboarding_complete !== true`)
3. **No profile exists** in `public.users` table
4. **No preferences exist** in `public.user_preferences` table

## Request

### Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Body

No body required (empty JSON object `{}`)

## Response

### Success (200 OK)

```typescript
{
  message: "User account restarted successfully",
  userId: "uuid",
  email: "user@example.com"
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

#### 400 Bad Request - Onboarding Complete
```typescript
{
  error: "Bad Request",
  message: "User onboarding is already complete"
}
```

#### 400 Bad Request - Profile Exists
```typescript
{
  error: "Bad Request",
  message: "User profile already exists in database"
}
```

#### 400 Bad Request - Preferences Exist
```typescript
{
  error: "Bad Request",
  message: "User preferences already exist in database"
}
```

#### 500 Internal Server Error
```typescript
{
  error: "Database error" | "Internal Server Error",
  message: "Detailed error message"
}
```

## What Happens

When the API is called successfully:

1. **Validates** all prerequisites
2. **Deletes** the user from Supabase Auth
3. **Logs** the operation for audit purposes
4. **Returns** success confirmation

## Security Considerations

### 1. Authentication Required
- Only authenticated users can call this API
- JWT token must be valid and not expired

### 2. Prerequisites Validation
- Multiple checks prevent accidental deletion
- Users with complete profiles cannot be deleted
- Users with existing data cannot be deleted

### 3. Audit Logging
- All restart operations are logged
- Includes user ID and email for tracking

### 4. Idempotency
- Multiple calls with same user will fail after first deletion
- No side effects from repeated calls

## Usage Examples

### 1. JavaScript/TypeScript

```typescript
const restartProfile = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No active session')
    }

    const response = await fetch('/api/profile/restart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (response.ok) {
      console.log('Profile restarted successfully:', result)
      // Redirect to signup page
      window.location.href = '/signup'
    } else {
      console.error('Restart failed:', result)
    }
  } catch (error) {
    console.error('Error restarting profile:', error)
  }
}
```

### 2. cURL

```bash
curl -X POST https://your-domain.com/api/profile/restart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 3. React Hook

```typescript
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useProfileRestart() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const restartProfile = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch('/api/profile/restart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Restart failed')
      }

      // Sign out and redirect
      await supabase.auth.signOut()
      window.location.href = '/signup'
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return { restartProfile, loading, error }
}
```

## Error Handling

### Common Error Scenarios

1. **User Not Authenticated**
   - Check if user is signed in
   - Verify JWT token is valid

2. **Onboarding Already Complete**
   - User has completed profile setup
   - Cannot restart completed accounts

3. **Profile Already Exists**
   - User has profile in database
   - Cannot restart accounts with existing data

4. **Preferences Already Exist**
   - User has preferences in database
   - Cannot restart accounts with existing data

5. **Database Errors**
   - Check Supabase connection
   - Verify service role key permissions

## Testing

### Manual Testing

```bash
# Test with valid user
npx tsx scripts/test-profile-restart.ts
```

### Automated Testing

```typescript
describe('Profile Restart API', () => {
  it('should restart incomplete user', async () => {
    // Create incomplete user
    const { data: { user } } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123'
    })

    // Call restart API
    const response = await fetch('/api/profile/restart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    expect(response.ok).toBe(true)
    
    // Verify user was deleted
    const { data: { user: deletedUser } } = await supabase.auth.getUser()
    expect(deletedUser).toBeNull()
  })

  it('should reject completed user', async () => {
    // Create completed user with profile
    // ... setup code ...

    const response = await fetch('/api/profile/restart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    expect(response.status).toBe(400)
  })
})
```

## Monitoring

### Logs to Monitor

1. **Successful Restarts**
   ```
   ✅ User {user_id} ({email}) restarted - deleted from auth
   ```

2. **Failed Restarts**
   ```
   ❌ Error deleting user from auth: {error}
   ```

3. **Validation Failures**
   ```
   ❌ User onboarding is already complete
   ❌ User profile already exists in database
   ```

### Metrics to Track

- Restart success rate
- Common failure reasons
- User retention after restart
- Time between signup and restart

## Related APIs

- **POST /api/profile/finalize** - Complete profile setup
- **GET /api/user/check-username** - Check username availability
- **POST /api/auth/signup** - Create new account

## Changelog

- **v1.0.0** - Initial implementation
  - Basic restart functionality
  - Prerequisites validation
  - Audit logging
