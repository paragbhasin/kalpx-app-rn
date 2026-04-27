export type LoginRequest = {
  email: string;
  password: string;
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
  user?: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    [key: string]: unknown;
  };
  message?: string;
};

export type SignupStep1Request = {
  email: string;
  recaptcha_token: string;
  recaptcha_action?: string;
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
