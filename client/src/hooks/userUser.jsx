import { useContext } from "react";
import { UserDataContext } from "../context/userData";

const useUser = () => {
  return useContext(UserDataContext);
};

export { useUser };
