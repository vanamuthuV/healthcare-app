import { useState } from "react";
import { UserDataContext } from "../context/userData";

export const UserDataProvider = ({ children }) => {
  const [userdata, setUserData] = useState({});

  return (
    <UserDataContext.Provider value={{ userdata, setUserData }}>
      {children}
    </UserDataContext.Provider>
  );
};
