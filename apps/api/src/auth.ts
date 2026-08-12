import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const COOKIE_NAME = "family_admin";
const SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

export interface AdminAuthOptions {
  adminPassword?: string;
  sessionSecret?: string;
}

interface LoginAttempt {
  count: number;
  resetAt: number;
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEqual(left: string, right: string) {
  return timingSafeEqual(digest(left), digest(right));
}

function parseCookies(header?: string) {
  return Object.fromEntries((header || "").split(";").flatMap((part) => {
    const separator = part.indexOf("=");
    if (separator < 0) return [];
    try {
      return [[part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1).trim())]];
    } catch {
      return [];
    }
  }));
}

function requestUsesHttps(request: Request) {
  return request.secure || request.get("x-forwarded-proto")?.split(",")[0]?.trim() === "https";
}

export function createAdminAuth(options: AdminAuthOptions = {}) {
  const adminPassword = options.adminPassword || "";
  const sessionSecret = options.sessionSecret || adminPassword;
  const configured = Boolean(adminPassword && sessionSecret);
  const attempts = new Map<string, LoginAttempt>();

  const signature = (expiresAt: string) => createHmac("sha256", sessionSecret).update(expiresAt).digest("base64url");

  function createToken() {
    const expiresAt = String(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    return `${expiresAt}.${signature(expiresAt)}`;
  }

  function isValidToken(token?: string) {
    if (!configured || !token) return false;
    const [expiresAt, providedSignature, extra] = token.split(".");
    if (!expiresAt || !providedSignature || extra || !/^\d+$/.test(expiresAt) || Number(expiresAt) <= Date.now()) return false;
    return safeEqual(providedSignature, signature(expiresAt));
  }

  function isAdmin(request: Request) {
    return isValidToken(parseCookies(request.get("cookie"))[COOKIE_NAME]);
  }

  function setSessionCookie(request: Request, response: Response) {
    const secure = requestUsesHttps(request) ? "; Secure" : "";
    response.setHeader("Set-Cookie", `${COOKIE_NAME}=${createToken()}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`);
  }

  function clearSessionCookie(request: Request, response: Response) {
    const secure = requestUsesHttps(request) ? "; Secure" : "";
    response.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`);
  }

  function status(request: Request, response: Response) {
    response.setHeader("Cache-Control", "no-store");
    response.json({ configured, isAdmin: isAdmin(request) });
  }

  function login(request: Request, response: Response) {
    response.setHeader("Cache-Control", "no-store");
    if (!configured) return response.status(503).json({ code: "ADMIN_NOT_CONFIGURED", message: "管理员密码尚未配置，请先设置 ADMIN_PASSWORD" });
    const clientKey = request.ip || request.socket.remoteAddress || "unknown";
    const now = Date.now();
    const current = attempts.get(clientKey);
    if (current && current.resetAt > now && current.count >= MAX_LOGIN_ATTEMPTS) {
      return response.status(429).json({ code: "TOO_MANY_LOGIN_ATTEMPTS", message: "登录尝试次数过多，请 15 分钟后再试" });
    }
    if (current && current.resetAt <= now) attempts.delete(clientKey);

    const password = typeof request.body?.password === "string" ? request.body.password : "";
    if (!safeEqual(password, adminPassword)) {
      const previous = attempts.get(clientKey);
      attempts.set(clientKey, {
        count: (previous?.resetAt || 0) > now ? previous!.count + 1 : 1,
        resetAt: (previous?.resetAt || 0) > now ? previous!.resetAt : now + LOGIN_WINDOW_MS
      });
      return response.status(401).json({ code: "INVALID_ADMIN_PASSWORD", message: "管理员密码不正确" });
    }

    attempts.delete(clientKey);
    setSessionCookie(request, response);
    return response.json({ configured: true, isAdmin: true });
  }

  function logout(request: Request, response: Response) {
    response.setHeader("Cache-Control", "no-store");
    clearSessionCookie(request, response);
    response.json({ configured, isAdmin: false });
  }

  function requireAdmin(request: Request, response: Response, next: NextFunction) {
    if (!configured) return response.status(503).json({ code: "ADMIN_NOT_CONFIGURED", message: "管理员密码尚未配置，当前服务为浏览模式" });
    if (!isAdmin(request)) return response.status(401).json({ code: "ADMIN_REQUIRED", message: "仅管理员可以执行此操作，请先进入管理模式" });
    next();
  }

  return { configured, status, login, logout, requireAdmin };
}
