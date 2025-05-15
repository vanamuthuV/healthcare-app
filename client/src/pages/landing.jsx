import { Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { api } from "../../api/axios";
import { message } from "antd";
import { useUser } from "../hooks/userUser";

const { Title, Paragraph } = Typography;

const Landing = () => {
  const navigate = useNavigate();
  const [msg, contextHolder] = message.useMessage();
  const { userdata, setUserData } = useUser();

  useEffect(() => {
    console.log("We ran bruh");
    (async () => {
      try {
        const response = await api.get("/auth/me");
        if (response?.data?.success) {
          setUserData(response?.data?.data);
          navigate(
            response?.data?.data?.role === "DOCTOR" ? "/doctor" : "/patient"
          );
        } else {
          setUserData({});
        }
      } catch (error) {
        msg.error("Error fetching user session", 3);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-blue-600">HealthCare</h1>
        <div className="space-x-4">
          <Button type="link" onClick={() => navigate("/login")}>
            Login
          </Button>
          <Button type="primary" onClick={() => navigate("/register")}>
            Register
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-16 bg-gray-100">
        {/* Left Text */}
        <div className="md:w-1/2 text-center md:text-left space-y-6">
          <Title className="!text-4xl md:!text-5xl font-bold">
            Trusted Healthcare at Your Fingertips
          </Title>
          <Paragraph className="text-lg text-gray-700">
            Book appointments, manage your health records, and connect with
            certified doctors — all in one platform.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/register")}
          >
            Get Started
          </Button>
        </div>

        {/* Right Image */}
        <div className="mt-10 md:mt-0 md:w-1/2 flex justify-center">
          <img
            src="https://cdn.dribbble.com/users/292037/screenshots/14913845/media/f4a5bdb1eab64d99e3f6aef6c1d26800.png"
            alt="Healthcare Illustration"
            className="w-full max-w-sm"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-sm py-6 text-gray-600 bg-white shadow-inner">
        © 2025 HealthCare. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
