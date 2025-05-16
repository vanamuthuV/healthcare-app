
import { Form, Input, Button, Typography, message, Card, Divider } from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/axios";
import { useUser } from "../hooks/userUser";
import {
  UserOutlined,
  LockOutlined,
  HeartFilled,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { Title, Text, Link } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [msg, contextHolder] = message.useMessage();
  const { userdata, setUserData } = useUser();

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

        return () => clearTimeout(delay);
      } else {
        msg.error(response?.data?.message, 3)
      }
    } catch (error) {
      console.log(error.message);
      msg.error(
        error?.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Login Failed:", errorInfo);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {contextHolder}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <motion.div variants={itemVariants} className="mb-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/")}
            size="large"
          >
            Back to Home
          </Button>
        </motion.div>

        <Card className="rounded-xl shadow-lg border-0 overflow-hidden">
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <HeartFilled style={{ fontSize: 64, color: "#1890ff" }} />
            </div>
            <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
              Welcome Back
            </Title>
            <Text type="secondary" style={{ fontSize: 18 }}>
              Login to your HealthCare account
            </Text>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Form
              layout="vertical"
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  {
                    type: "email",
                    message: "Please enter a valid email address!",
                  },
                ]}
              >
                <Input
                  prefix={
                    <UserOutlined
                      className="text-gray-400"
                      style={{ fontSize: 18 }}
                    />
                  }
                  placeholder="Email Address"
                  size="large"
                  style={{ height: 50 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password
                  prefix={
                    <LockOutlined
                      className="text-gray-400"
                      style={{ fontSize: 18 }}
                    />
                  }
                  placeholder="Password"
                  size="large"
                  style={{ height: 50 }}
                />
              </Form.Item>

              <Form.Item className="mb-2">
                <Link className="float-right" href="#">
                  Forgot password?
                </Link>
              </Form.Item>

              <Form.Item className="mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="w-full rounded-lg h-14 text-lg"
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Divider plain style={{ margin: "32px 0 24px" }}>
              <Text type="secondary" style={{ fontSize: 16 }}>
                New to HealthCare?
              </Text>
            </Divider>

            <div className="text-center">
              <Button
                type="default"
                size="large"
                className="w-full rounded-lg h-14 text-lg"
                onClick={() => navigate("/register")}
              >
                Create an Account
              </Button>
            </div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
