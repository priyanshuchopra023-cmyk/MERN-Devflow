import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const defaultUser = { name: "DevFlow User", email: "hello@devflow.local" };

export function AuthProvider({ children }) {
  const [user] = useState(defaultUser);
  const [loading] = useState(false);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
