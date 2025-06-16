// Mock authentication service

interface User {
  id: string
  name: string
  email: string
}

// Mock user data
const mockUsers: User[] = [
  {
    id: "user1",
    name: "Demo User",
    email: "demo@example.com",
  },
]

// Mock authentication functions
export async function getCurrentUser(): Promise<User | null> {
  // In a real app, this would check the session
  return mockUsers[0]
}

export async function login(email: string, password: string): Promise<User | null> {
  // In a real app, this would validate credentials
  console.log("Login attempt:", email)

  // For demo purposes, always return the mock user
  return mockUsers[0]
}

export async function register(name: string, email: string, password: string): Promise<User> {
  // In a real app, this would create a new user
  console.log("Register attempt:", name, email)

  // For demo purposes, always return the mock user
  return mockUsers[0]
}

export async function logout(): Promise<void> {
  // In a real app, this would clear the session
  console.log("User logged out")
}
