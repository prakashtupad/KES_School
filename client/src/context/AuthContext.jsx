import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = 'kes_portal_token';
const USER_STORAGE_KEY = 'kes_portal_user';
const PARENT_SESSION_STORAGE_KEY = 'kes_parent_portal_session';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [parentSession, setParentSession] = useState(() => {
    try {
      const saved =
        sessionStorage.getItem(PARENT_SESSION_STORAGE_KEY) ||
        localStorage.getItem(PARENT_SESSION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(PARENT_SESSION_STORAGE_KEY);
    sessionStorage.removeItem(PARENT_SESSION_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setParentSession(null);
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!token) {
      setLoading(false);
      return undefined;
    }

    // If current session is a Parent / Student portal session, skip /api/v1/auth/me
    // because all sibling data is cached client-side to minimize MongoDB load.
    if (user?.role === 'parent') {
      if (!parentSession || !Array.isArray(parentSession.siblings) || parentSession.siblings.length === 0) {
        logout();
      }
      setLoading(false);
      return undefined;
    }

    fetch('/api/v1/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Session expired');
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted && data?.user) {
          setUser(data.user);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        }
      })
      .catch(() => {
        if (isMounted) {
          logout();
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token, user?.role, parentSession, logout]);

  const login = async (email, password) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const rawText = await response.text();
    let data = {};
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          'Server returned an unexpected response. Please make sure the backend server is running.'
        );
      }
    } else if (!response.ok) {
      throw new Error('Cannot reach the backend server (port 5000). Please try again in a moment.');
    }

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Invalid login credentials.');
    }

    localStorage.removeItem(PARENT_SESSION_STORAGE_KEY);
    sessionStorage.removeItem(PARENT_SESSION_STORAGE_KEY);
    setParentSession(null);

    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  /**
   * Student & Parent Multi-Sibling Portal Login
   * Calls POST /api/v1/student-portal/login and caches siblings + homeworkList client-side.
   */
  const parentLogin = async (mobileNumber, accessCode) => {
    const response = await fetch('/api/v1/student-portal/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mobileNumber, accessCode }),
    });

    const rawText = await response.text();
    let data = {};
    if (rawText) {
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error('Unexpected response from server. Please try again.');
      }
    } else if (!response.ok) {
      throw new Error('Cannot reach the school portal server. Please try again shortly.');
    }

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || data.message || 'Invalid Mobile Number or Access Code.'
      );
    }

    const firstChild = data.siblings?.[0] || {};
    const parentName =
      firstChild.father?.name ||
      firstChild.fatherName ||
      firstChild.mother?.name ||
      firstChild.motherName ||
      'Parent / Guardian';

    const parentUser = {
      _id: `parent_${data.parentPhone}`,
      role: 'parent',
      fullName: parentName,
      email: `+91 ${data.parentPhone}`,
      mobileNumber: data.parentPhone,
      siblingCount: (data.siblings || []).length,
    };

    const sessionPayload = {
      token: data.token,
      parentPhone: data.parentPhone,
      siblings: data.siblings || [],
      homeworkList: data.homeworkList || [],
      loggedInAt: new Date().toISOString(),
    };

    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(parentUser));
    sessionStorage.setItem(PARENT_SESSION_STORAGE_KEY, JSON.stringify(sessionPayload));
    localStorage.setItem(PARENT_SESSION_STORAGE_KEY, JSON.stringify(sessionPayload));

    setParentSession(sessionPayload);
    setUser(parentUser);
    setToken(data.token);

    return { user: parentUser, session: sessionPayload };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        parentSession,
        setParentSession,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        parentLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
