import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Typography,
  message,
  Divider,
  Row,
  Col,
  Space,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  UserSwitchOutlined,
  MedicineBoxOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { api } from "../../api/axios";
import { useNavigate } from "react-router-dom";

const { Title, Text, Link } = Typography;
const { Option } = Select;

const RegistrationForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(null);
  const [msg, contextHolder] = message.useMessage();

  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        specialization: values.specialization || null,
      };

      const response = await api.post("/auth/register", payload);
      msg.success(response?.data?.message, 3);
      form.resetFields();
      setLoading(false);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      msg.error("Registration failed. Please try again.", 3);
      setLoading(false);
    }
  };

  const handleRoleChange = (value) => {
    setRole(value);
    if (value !== "DOCTOR") {
      form.setFieldValue("specialization", undefined);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      {contextHolder}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md md:max-w-lg lg:max-w-xl"
      >
        <Card
          className="rounded-xl shadow-lg border-0"
          headStyle={{ borderBottom: 0 }}
          bodyStyle={{ padding: "32px" }}
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <MedicineBoxOutlined style={{ fontSize: 64, color: "#1890ff" }} />
            </div>
            <Title level={1} style={{ margin: 0, color: "#1890ff" }}>
              HealthCare
            </Title>
            <Text type="secondary" style={{ fontSize: 18 }}>
              Create your account
            </Text>
          </div>

          <Form
            form={form}
            name="register"
            layout="vertical"
            onFinish={onFinish}
            scrollToFirstError
            size="large"
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[
                {
                  required: true,
                  message: "Please enter your full name",
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
                size="large"
                placeholder="John Doe"
                style={{ height: 50 }}
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                {
                  required: true,
                  message: "Please enter your email",
                },
                {
                  type: "email",
                  message: "Please enter a valid email",
                },
              ]}
            >
              <Input
                prefix={
                  <MailOutlined
                    className="text-gray-400"
                    style={{ fontSize: 18 }}
                  />
                }
                size="large"
                placeholder="example@email.com"
                style={{ height: 50 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: "Please enter your password",
                },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={
                  <LockOutlined
                    className="text-gray-400"
                    style={{ fontSize: 18 }}
                  />
                }
                size="large"
                placeholder="Password"
                style={{ height: 50 }}
              />
            </Form.Item>

            <Form.Item
              name="role"
              label="I am a"
              rules={[
                {
                  required: true,
                  message: "Please select your role",
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Select your role"
                onChange={handleRoleChange}
                suffixIcon={
                  <UserSwitchOutlined
                    className="text-gray-400"
                    style={{ fontSize: 18 }}
                  />
                }
                style={{ height: 50 }}
              >
                <Option value="PATIENT">Patient</Option>
                <Option value="DOCTOR">Doctor</Option>
              </Select>
            </Form.Item>

            {role === "DOCTOR" && (
              <Form.Item
                name="specialization"
                label="Specialization"
                rules={[
                  {
                    required: true,
                    message: "Please enter your specialization",
                  },
                ]}
              >
                <Input
                  prefix={<IdcardOutlined className="text-gray-400" />}
                  size="large"
                  placeholder="e.g. Cardiology, Neurology"
                />
              </Form.Item>
            )}

            <Form.Item style={{ marginTop: 36 }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="rounded-lg h-14 text-lg"
              >
                Register
              </Button>
            </Form.Item>
          </Form>

          <Divider plain style={{ margin: "32px 0 24px" }}>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Already have an account?
            </Text>
          </Divider>

          <div className="text-center">
            <Link href="/login" style={{ fontSize: 18 }}>
              Log in instead
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegistrationForm;
