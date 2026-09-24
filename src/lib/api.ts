import axios, { AxiosHeaders } from "axios";

type SessionScope = "user" | "admin";
export const SESSION_EXPIRED_EVENT = "bdfx:session-expired";

export class ApiError extends Error {
  readonly response: { status: number; data: unknown };

  constructor(message: string, readonly status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.response = { status, data };
  }
}

function backendUrl(input: string | URL): URL {
  const configured = process.env.NEXT_PUBLIC_API_BASE;
  if (!configured) throw new Error("The account service is not configured.");
  const base = new URL(configured);
  if (!["https:", "http:"].includes(base.protocol) || base.username || base.password) {
    throw new Error("The account service address is invalid.");
  }
  const target = new URL(input, base);
  if (target.origin !== base.origin || target.username || target.password) {
    throw new Error("Authenticated requests must use the configured account service.");
  }
  return target;
}

function sessionToken(scope: SessionScope): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(scope === "admin" ? "adminToken" : "token");
}

function expireSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `token=; Path=/; Max-Age=0; SameSite=Lax;${
    window.location.protocol === "https:" ? " Secure;" : ""
  }`;
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("adminToken");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  if (token && localStorage.getItem("token") === token) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  // An administrator may also have a distinct active customer session.
  if (!localStorage.getItem("token")) expireSessionCookie();
}

export function clearUserSession() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("token");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  if (token && localStorage.getItem("adminToken") === token) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  }
  expireSessionCookie();
}

function rejectedSession(scope: SessionScope, status: number, sentToken?: string) {
  if (typeof window === "undefined" || (status !== 401 && !(scope === "admin" && status === 403))) return;
  // A slow response from an older session must not clear a newer login.
  const currentToken = sessionToken(scope);
  if (sentToken !== undefined && sentToken !== currentToken) return;
  if (scope === "admin") clearAdminSession();
  else clearUserSession();
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, { detail: { scope } }));
}

function createApi(scope: SessionScope) {
  const client = axios.create();
  client.interceptors.request.use(config => {
    const target = config.baseURL ? new URL(config.url || "", config.baseURL) : config.url || "";
    config.url = backendUrl(target).href;
    config.baseURL = undefined;
    config.headers = AxiosHeaders.from(config.headers);
    const token = sessionToken(scope);
    if (token && !config.headers.has("Authorization")) config.headers.set("Authorization", `Bearer ${token}`);
    return config;
  });
  client.interceptors.response.use(response => response, error => {
    const authorization = AxiosHeaders.from(error.config?.headers).get("Authorization");
    const sentToken = typeof authorization === "string" && authorization.startsWith("Bearer ") ? authorization.slice(7) : undefined;
    rejectedSession(scope, error.response?.status, sentToken);
    return Promise.reject(error);
  });
  return client;
}

async function backendFetch(scope: SessionScope, input: string | URL | Request, init: RequestInit = {}): Promise<Response> {
  const isRequest = typeof Request !== "undefined" && input instanceof Request;
  const target = backendUrl(isRequest ? input.url : input as string | URL);
  const headers = new Headers(isRequest ? input.headers : undefined);
  new Headers(init.headers).forEach((value, name) => headers.set(name, value));
  const token = sessionToken(scope);
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  const requestInit = { ...init, headers, redirect: "error" as const };
  const response = await fetch(isRequest ? new Request(target, input) : target, requestInit);
  if (!response.ok) {
    const data: unknown = await response.clone().json().catch(() => null);
    const message = data && typeof data === "object" && "message" in data && typeof data.message === "string"
      ? data.message : response.status === 401 ? "Please sign in again."
      : response.status === 403 ? "This account cannot perform that action." : "The request could not be completed.";
    const authorization = headers.get("Authorization");
    rejectedSession(scope, response.status, authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined);
    throw new ApiError(message, response.status, data);
  }
  return response;
}

export const api = createApi("user");
export const adminApi = createApi("admin");
export const apiFetch = (input: string | URL | Request, init?: RequestInit) => backendFetch("user", input, init);
export const adminFetch = (input: string | URL | Request, init?: RequestInit) => backendFetch("admin", input, init);
