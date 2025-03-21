"use client";

/**
 * Authentication utility functions for managing user login state
 */

// Check if user is logged in by looking for userId in localStorage
export const isUserLoggedIn = (): boolean => {
  if (typeof window === "undefined") return false;

  const userId = localStorage.getItem("userId");
  return Boolean(userId);
};

// Get the current user's ID from localStorage
export const getCurrentUserId = (): string | null => {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("userId");
};

// Get the current user's name from localStorage
export const getCurrentUserName = (): string | null => {
  if (typeof window === "undefined") return null;

  return localStorage.getItem("userName");
};

// Log out the current user by removing their data from localStorage
export const logoutUser = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
};