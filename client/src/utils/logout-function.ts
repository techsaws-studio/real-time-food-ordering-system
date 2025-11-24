import { ApiRequest } from "./api-request";

export const LogoutFunction = async () => {
  try {
    await ApiRequest("auth/logout", "POST");
  } catch (error) {
    console.error("Logout error:", error);
  }

  document.cookie = "authToken=; path=/; max-age=0";
  document.cookie = "user_role=; path=/; max-age=0";
  document.cookie = "user_info=; path=/; max-age=0";
  window.location.href = "/authentication";
};
