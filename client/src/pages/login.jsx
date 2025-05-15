import { Form, Input, Button, Typography, message } from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { useUser } from "../hooks/userUser";

const { Title } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [msg, contextHolder] = message.useMessage();

  const { userdata, setUserData } = useUser();
  console.log(userdata);

  const onFinish = async (values) => {
    try {
      const response = await api.post("/auth/login", values);
      if (response?.data?.success) {
        msg.success(response?.data?.message, 3);
        setUserData(response?.data?.data);

        const delay = setTimeout(() => {
          navigate(
            response?.data?.data.role === "DOCTOR" ? "/doctor" : "/patient"
          );
        }, 1000);

        delay.close();
      }
    } catch (error) {
      console.log(error.message);
      message.error(error.message);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Login Failed:", errorInfo);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      {contextHolder}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-6">
          <Title level={2} className="!text-blue-600 !mb-2">
            Welcome Back
          </Title>
          <p className="text-gray-500">Login to your HealthCare account</p>
        </div>

        <Form
          layout="vertical"
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input size="large" placeholder="Enter your email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password size="large" placeholder="Enter your password" />
          </Form.Item>

          <Form.Item className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="w-full"
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{" "}
          <button
            className="text-blue-600 hover:underline font-medium"
            onClick={() => navigate("/register")}
          >
            Register Now
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
