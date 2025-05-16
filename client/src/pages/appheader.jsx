import { useState, useEffect } from "react";
import {
  Layout,
  Typography,
  Dropdown,
  Space,
  Avatar,
  Modal,
  Button,
  Descriptions,
  Divider,
  Row,
  Col,
  message,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
  MedicineBoxOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useUser } from "../hooks/userUser"; // Assuming this is your user hook
import { api } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Menu } from "antd"; // Add this import

const { Header } = Layout;
const { Title, Text } = Typography;

const AppHeader = () => {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { userdata, setUserData } = useUser();
  const [msg, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const response = await api.get("/auth/me");
        if (response?.data?.success) {
          setUserData(response?.data?.data);
        } else {
          navigate("/login");
        }
      } catch (error) {
        msg.error("Error fetching user session", 3);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await api.get("/auth/logout");
      if (response?.data?.success) {
        setUserData({});
        navigate("/login");
        msg.success("Successfully logged out", 2);
        setLogoutModalOpen(false);
      } else {
        msgApi.error("Logout failed. Try again.");
      }
    } catch (error) {
      msgApi.error("Logout failed. Try again.");
    }
  };

  const profileMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Profile",
        onClick: () => setProfileModalOpen(true),
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        onClick: () => setLogoutModalOpen(true),
      },
    ],
  };

  return (
    <>
      {contextHolder}
      <Header
        style={{
          background: "white",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: "0 16px",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 64,
        }}
        className="mx-2"
      >
        {/* Logo and Brand */}
        <div className="flex items-center">
          <MedicineBoxOutlined
            style={{ fontSize: 24, color: "#1890ff", marginRight: 12 }}
          />
          <Title
            level={3}
            style={{
              margin: 0,
              color: "#1890ff",
              display: "flex",
              alignItems: "center",
              letterSpacing: "2px",
            }}
          >
            <span className="hidden sm:inline">HealthCare</span>
            <span className="sm:hidden">HC</span>
          </Title>
        </div>

        <div>
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Dropdown menu={profileMenu} trigger={["click"]}>
              <a
                onClick={(e) => e.preventDefault()}
                style={{ color: "rgba(0, 0, 0, 0.65)" }}
              >
                <Space>
                  <Avatar
                    style={{ backgroundColor: "#1890ff" }}
                    icon={<UserOutlined />}
                  />
                  <span className="hidden sm:inline">
                    {userdata?.name || "User"}
                  </span>
                  <DownOutlined />
                </Space>
              </a>
            </Dropdown>
          )}
        </div>
      </Header>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserOutlined style={{ color: "#1890ff", fontSize: 20 }} />
            <span>User Profile</span>
          </div>
        }
        open={profileModalOpen}
        onCancel={() => setProfileModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setProfileModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        <div className="py-4">
          <Row gutter={[16, 24]} align="middle" justify="center">
            <Col xs={24} md={8} className="text-center">
              <Avatar
                size={100}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              />
              <Title level={4} style={{ marginTop: 16, marginBottom: 0 }}>
                {userdata?.name || "User Name"}
              </Title>
              <Text type="secondary">{userdata?.role || "Patient"}</Text>
            </Col>
            <Col xs={24} md={16}>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Name">
                  {userdata?.name || "Not Available"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {userdata?.email || "Not Available"}
                </Descriptions.Item>
                {userdata?.specialization && (
                  <Descriptions.Item label="Specialization">
                    {userdata.specialization}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Col>
          </Row>

          <Divider />

          {/* <div className="flex justify-center">
            <Button
              type="primary"
              icon={<UserOutlined />}
              onClick={() => {
                msg.info(
                  "Edit Profile functionality will be implemented soon",
                  3
                );
              }}
            >
              Edit Profile
            </Button>
          </div> */}
        </div>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <LogoutOutlined style={{ color: "#ff4d4f", fontSize: 20 }} />
            <span>Confirm Logout</span>
          </div>
        }
        open={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setLogoutModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="logout" danger type="primary" onClick={handleLogout}>
            Logout
          </Button>,
        ]}
      >
        <div className="py-4 flex items-center gap-3">
          <QuestionCircleOutlined style={{ fontSize: 24, color: "#faad14" }} />
          <Text>Are you sure you want to logout from your account?</Text>
        </div>
      </Modal>
    </>
  );
};

export default AppHeader;
