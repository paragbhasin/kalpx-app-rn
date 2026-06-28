export type LoginRequest = {
  email: string;
  password: string;
  recaptcha_token?: string;
};

export type TokenPair = {
  access: string;
  refresh: string;
};

/** Backend returns access_token/refresh_token on login (not access/refresh) */
export type LoginResponse = {
  access_token?: string;
  refresh_token?: string;
  access?: string;
  refresh?: string;
  role?: string;
  user_type?: "ops" | "guide" | "user";
  is_superuser?: boolean;
  user?: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    [key: string]: unknown;
  };
  profile?: {
    user?: {
      role?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  creator_profile?: {
    user?: {
      role?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  message?: string;
};

export type SignupStep1Request = {
  email: string;
  recaptcha_token: string;
  recaptcha_action?: string;
  context?: string;
};

export type SignupOtpVerifyRequest = {
  email: string;
  otp: string;
  recaptcha_token: string;
  recaptcha_action?: string;
};

export type SignupRegisterRequest = {
  email: string;
  password: string;
  confirm_password?: string;
  first_name?: string;
  last_name?: string;
  recaptcha_token: string;
  recaptcha_action?: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  otp: string;
  new_password: string;
  recaptcha_token: string;
  recaptcha_action?: string;
};

export type UserProfile = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  profile_name?: string;
  [key: string]: unknown;
};
