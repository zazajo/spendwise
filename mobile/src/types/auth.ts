import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginPayload = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password2: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.password2, {
    message: "Passwords don't match",
    path: ['password2'],
  });

export type RegisterPayload = z.infer<typeof registerSchema>;

export interface Profile {
  id: number;
  username: string;
  email: string;
  // Absolute URL, or null when the user hasn't set a picture.
  avatar: string | null;
  currency: string;
  monthly_income: string | null;
  financial_health_score: number | null;
  last_score_calculation: string | null;
}

export interface UserPreference {
  id: number;
  notification_enabled: boolean;
  budget_alert_threshold: number;
  dark_mode: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  profile: Profile;
  preferences: UserPreference;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface RegisterResponse extends AuthTokens {
  user: Pick<User, 'id' | 'username' | 'email'>;
  message: string;
}
