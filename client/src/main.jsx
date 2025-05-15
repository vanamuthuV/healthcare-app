import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "antd/dist/reset.css";
import { ConfigProvider } from "antd";
import { UserDataProvider } from "./provider/userDataProvider.jsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ConfigProvider>
      <UserDataProvider>
        <App />
      </UserDataProvider>
    </ConfigProvider>
  </BrowserRouter>
);
