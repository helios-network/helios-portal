const accessToken = "access_token";
const refreshToken = "refresh_token";
const isRememberMeKey = "remember_me";
export const uuid = "uuid";
export const lastUserActive = "last_user_active";

export function hasStorageJwtToken() {
  return !!localStorage.getItem(accessToken);
}

export function removeStorageJwtToken() {
  localStorage.removeItem(accessToken);
}

export function removeStorageUUID() {
  localStorage.removeItem(uuid);
}

export function setStorageJwtToken(token: string) {
  localStorage.setItem(accessToken, token);
}

export function getStorageJwtToken() {
  return localStorage.getItem(accessToken);
}

export function removeStorageRefreshToken() {
  localStorage.removeItem(refreshToken);
}

export function setStorageRefreshToken(token: string) {
  localStorage.setItem(refreshToken, token);
}

export function getStorageRefreshToken() {
  return localStorage.getItem(refreshToken);
}

export function setStorageIsRememberMe(isRememberMe: boolean) {
  localStorage.setItem(isRememberMeKey, JSON.stringify(isRememberMe));
}

export function getStorageIsRememberMe() {
  return JSON.parse(localStorage.getItem(isRememberMeKey) || "false");
}

