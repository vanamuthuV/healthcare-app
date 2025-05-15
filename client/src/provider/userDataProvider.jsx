import { useState, useEffect } from "react";
import { UserDataContext } from "../context/userData";
import { api } from "../../api/axios";

export const UserDataProvider = ({ children }) => {
  const [userdata, setUserData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get("/auth/me");
        if (response?.data?.success) {
          setUserData(response.data.data);
        } else {
          setUserData(null);
        }
      } catch {
        setUserData(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <UserDataContext.Provider value={{ userdata, setUserData, isLoading }}>
      {children}
    </UserDataContext.Provider>
  );
};
