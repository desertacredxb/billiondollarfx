"use client";
import { createContext, useContext } from "react";
import type { AdminSession } from "./adminAccess";
export const AdminSessionContext = createContext<AdminSession | null>(null);
export const useAdminSession = () => useContext(AdminSessionContext);
