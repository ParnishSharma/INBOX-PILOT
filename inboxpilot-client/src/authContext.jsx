import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("https://inbox-pilot-production.up.railway.app/me", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setChecking(false);
console.log("Fetch result", data);

      
          navigate("/dashboard"); // 
      })
      .catch(() => {
        setUser(null);
        setChecking(false);
        console.error("Auth check failed");

        if (window.location.pathname !== "/") {
          navigate("/"); // redirect to login
        }
      });
  }, []);

  return (
    <AuthContext.Provider value={{ user, checking }}>
      {checking ? (
        <div className="p-10 text-2xl">Checking session...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
