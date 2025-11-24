export interface LoginResponse {
  user: {
    userId: string;
    email: string;
    role: "ADMIN" | "KITCHEN" | "RECEPTIONIST";
    name: string;
  };
  token: string;
}
