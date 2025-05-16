"use client";

import { Button, Typography, Carousel } from "antd";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { api } from "../../api/axios";
import { message } from "antd";
import { useUser } from "../hooks/userUser";
import { motion } from "framer-motion";
import { HeartFilled } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const Landing = () => {
  const navigate = useNavigate();
  const [msg, contextHolder] = message.useMessage();
  const { userdata, setUserData } = useUser();

  // Health quotes for the carousel
  const healthQuotes = [
    {
      quote: "The greatest wealth is health.",
      author: "Virgil",
    },
    {
      quote: "Health is not valued until sickness comes.",
      author: "Thomas Fuller",
    },
    {
      quote: "Take care of your body. It's the only place you have to live.",
      author: "Jim Rohn",
    },
    {
      quote:
        "Health is a state of complete harmony of the body, mind, and spirit.",
      author: "B.K.S. Iyengar",
    },
  ];

  useEffect(() => {
    const checkUserSession = async () => {
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
        console.error("Session check error:", error);
      }
    };

    checkUserSession();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {contextHolder}
      <div className="mb-8 sm:mb-10 md:mb-5">
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center px-3 sm:px-8 md:px-16 py-2 sm:py-5 bg-white shadow-md z-10 w-full"
        >
          <div className="flex items-center">
            <HeartFilled
              style={{ fontSize: 20, color: "#1890ff", marginRight: 4 }}
              className="sm:text-2xl sm:mr-2"
            />
            <Title
              level={5}
              className="m-0 text-sm sm:text-xl"
              style={{ color: "#1890ff" }}
            >
              HealthCare
            </Title>
          </div>
          <div className="flex space-x-1 sm:space-x-3 md:space-x-5">
            <Button
              type="link"
              onClick={() => navigate("/login")}
              size="small"
              className="text-xs sm:text-sm sm:size-middle px-1 sm:px-3"
            >
              Login
            </Button>
            <Button
              type="primary"
              onClick={() => navigate("/register")}
              size="small"
              shape="round"
              className="text-xs sm:text-sm sm:size-middle px-2 sm:px-4"
            >
              Register
            </Button>
          </div>
        </motion.header>
      </div>
      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-8 md:px-16 py-0">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left Text */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center md:text-left space-y-8"
          >
            <Title
              className="!text-4xl md:!text-5xl lg:!text-6xl font-bold !leading-tight"
              style={{ color: "#1890ff" }}
            >
              Your Health, Our Priority
            </Title>
            <Paragraph className="text-lg md:text-xl text-gray-700">
              Experience healthcare reimagined. Book appointments, manage your
              health records, and connect with certified doctors — all in one
              seamless platform.
            </Paragraph>
            <div className="pt-6">
              <Button
                type="primary"
                size="large"
                shape="round"
                onClick={() => navigate("/register")}
                style={{
                  height: 50,
                  fontSize: 16,
                  paddingLeft: 30,
                  paddingRight: 30,
                }}
              >
                Get Started
              </Button>
            </div>

            {/* Quotes Carousel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12 pt-4 max-w-lg mx-auto md:mx-0"
            >
              <Carousel
                autoplay
                effect="fade"
                dots={false}
                autoplaySpeed={5000}
              >
                {healthQuotes.map((item, index) => (
                  <div key={index} className="py-2">
                    <p className="text-lg italic text-gray-600">
                      "{item.quote}"
                    </p>
                    <p className="text-right text-gray-500 mt-2">
                      — {item.author}
                    </p>
                  </div>
                ))}
              </Carousel>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex justify-center"
          >
            <img
              src="https://img.freepik.com/free-vector/doctors-concept-illustration_114360-1515.jpg"
              alt="Healthcare Illustration"
              className="w-full max-w-lg"
            />
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="text-center py-6 text-gray-600 bg-white shadow-inner"
      >
        <div className="flex justify-center items-center gap-2">
          <HeartFilled
            style={{ fontSize: 16, color: "#1890ff", marginRight: 4 }}
          />
          <span>© 2025 HealthCare. All rights reserved.</span>
        </div>
      </motion.footer>
    </div>
  );
};

export default Landing;
