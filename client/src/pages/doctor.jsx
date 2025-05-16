
import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Typography,
  Spin,
  Tag,
  message,
  Avatar,
  Statistic,
  Row,
  Col,
  Divider,
  Timeline,
  Badge,
  Space,
  Descriptions,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Popconfirm,
  Tabs,
  Calendar,
  List,
  Empty,
  Alert,
} from "antd";
import { motion } from "framer-motion";
import { api } from "../../api/axios";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  MailOutlined,
  MedicineBoxOutlined,
  ScheduleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FileTextOutlined,
  BellOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useUser } from "../hooks/userUser";
import AppHeader from "./appheader";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientModalVisible, setPatientModalVisible] = useState(false);
  const [newAppointmentModalVisible, setNewAppointmentModalVisible] =
    useState(false);
  const [editAppointmentModalVisible, setEditAppointmentModalVisible] =
    useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [newAppointmentForm] = Form.useForm();
  const [editAppointmentForm] = Form.useForm();

  const { userdata } = useUser();
  const doctorName = userdata?.name || "Doctor";

  const [msg, contextHolder] = message.useMessage();

  useEffect(() => {
    loadAppointments();
    loadPatients();
  }, []);

  console.log(selectedPatient)

  useEffect(() => {
    if (appointments.length > 0) {
      filterAppointments(searchText, activeTab);
    }
  }, [searchText, activeTab, appointments]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/doctor");

      if (response?.data?.success) {
        const appts = response?.data?.data || [];
        setAppointments(appts);
        setFilteredAppointments(appts);
      } else {
        msg.error(response?.data?.message, 3);
      }
    } catch (error) {
      msg.error(error?.response?.data?.message, 3);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await api.get("/patient/all");
      if (response?.data?.success) {
        setPatients(response?.data?.data || []);
      }
    } catch (error) {
      msg.error("Failed to load patients", 3);
    }
  };

  const filterAppointments = (searchValue, tabKey) => {
    let filtered = [...appointments];

    if (searchValue) {
      filtered = filtered.filter(
        (appt) =>
          appt.patient?.name
            ?.toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          appt.reason?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Filter by tab
    switch (tabKey) {
      case "upcoming":
        filtered = filtered.filter(
          (appt) =>
            (appt.status.toLowerCase() === "confirmed" ||
              appt.status.toLowerCase() === "pending") &&
            dayjs(appt.date, "DD-MM-YYYY").isAfter(dayjs())
        );
        break;
      case "completed":
        filtered = filtered.filter(
          (appt) => appt.status.toLowerCase() === "completed"
        );
        break;
      case "pending":
        filtered = filtered.filter(
          (appt) => appt.status.toLowerCase() === "pending"
        );
        break;
      case "cancelled":
        filtered = filtered.filter(
          (appt) =>
            appt.status.toLowerCase() === "cancelled" ||
            appt.status.toLowerCase() === "rejected"
        );
        break;
      case "today":
        filtered = filtered.filter((appt) =>
          dayjs(appt.date, "DD-MM-YYYY").isSame(dayjs(), "day")
        );
        break;
      case "all":
        break;
      default:
        break;
    }

    setFilteredAppointments(filtered);
  };

  const handleViewPatient = async (patientId) => {
    try {
      const response = await api.get(`/patient/${patientId}`);
      setSelectedPatient(response?.data?.data);
      setPatientModalVisible(true);
    } catch (error) {
      msg.error(error?.response?.data?.message, 3);
    }
  };

  const handleCreateAppointment = () => {
    setNewAppointmentModalVisible(true);
  };

  const handleEditAppointment = (record) => {
    setCurrentAppointment(record);
    editAppointmentForm.setFieldsValue({
      status: record.status,
      date: record.date ? dayjs(record.date, "DD-MM-YYYY") : null,
      time: record.time ? dayjs(record.time, "h A") : null,
      reason: record.reason,
    });
    setEditAppointmentModalVisible(true);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const response = await api.delete(`/doctor/${appointmentId}`);
      if (response?.data?.success) {
        msg.success("Appointment deleted successfully", 3);
        loadAppointments();
      } else {
        msg.error(response?.data?.message, 3);
      }
    } catch (error) {
      msg.error(error?.response?.data?.message, 3);
    }
  };

  const submitNewAppointment = async (values) => {
    try {
      const formattedValues = {
        patientId: values.patientId,
        date: values.date.format("DD-MM-YYYY"),
        time: values.time.format("h A"),
        reason: values.reason,
        status: values.status,
      };

      const response = await api.post("/doctor", formattedValues);
      if (response?.data?.success) {
        msg.success("Appointment created successfully", 3);
        setNewAppointmentModalVisible(false);
        newAppointmentForm.resetFields();
        loadAppointments();
      } else {
        msg.error(response?.data?.message, 3);
      }
    } catch (error) {
      msg.error(error?.response?.data?.message, 3);
    }
  };

  const submitEditAppointment = async (values) => {
    try {
      const formattedValues = {
        date: values.date.format("DD-MM-YYYY"),
        time: values.time.format("h A"),
        reason: values.reason,
        status: values.status,
      };

      const response = await api.put(
        `/doctor/${currentAppointment.id}`,
        formattedValues
      );
      if (response?.data?.success) {
        msg.success("Appointment updated successfully", 3);
        setEditAppointmentModalVisible(false);
        loadAppointments();
      } else {
        msg.error(response?.data?.message, 3);
      }
    } catch (error) {
      msg.error(error?.response?.data?.message, 3);
    }
  };

  // Calculate dashboard statistics
  const confirmedAppointments = appointments.filter(
    (a) => a.status.toLowerCase() === "confirmed"
  ).length;
  const pendingAppointments = appointments.filter(
    (a) => a.status.toLowerCase() === "pending"
  ).length;
  const totalAppointments = appointments.length;
  const todayAppointments = appointments.filter((a) =>
    dayjs(a.date, "DD-MM-YYYY").isSame(dayjs(), "day")
  ).length;

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "confirmed") return "success";
    if (statusLower === "pending") return "warning";
    if (statusLower === "cancelled" || statusLower === "rejected")
      return "error";
    if (statusLower === "completed") return "blue";
    return "default";
  };

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "REJECTED", label: "Rejected" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "COMPLETED", label: "Completed" },
  ];

  const columns = [
    {
      title: "Patient",
      dataIndex: ["patient", "name"],
      key: "name",
      render: (name) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: "#1890ff" }}
          />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <Text>{date}</Text>
        </Space>
      ),
      sorter: (a, b) =>
        dayjs(a.date, "DD-MM-YYYY").unix() - dayjs(b.date, "DD-MM-YYYY").unix(),
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      render: (time) => (
        <Space>
          <ClockCircleOutlined style={{ color: "#1890ff" }} />
          <Text>{time}</Text>
        </Space>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (reason) => (
        <Space>
          <MedicineBoxOutlined style={{ color: "#1890ff" }} />
          <Text>{reason}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={getStatusColor(status)}
          text={
            <Text strong style={{ textTransform: "capitalize" }}>
              {status.toLowerCase()}
            </Text>
          }
        />
      ),
      filters: statusOptions.map((option) => ({
        text: option.label,
        value: option.value,
      })),
      onFilter: (value, record) => record.status.toUpperCase() === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewPatient(record.patientId)}
            size="middle"
            shape="circle"
          />
          <Button
            type="default"
            icon={<EditOutlined />}
            onClick={() => handleEditAppointment(record)}
            size="middle"
            shape="circle"
            style={{ backgroundColor: "#faad14", color: "white" }}
          />
          <Popconfirm
            title="Delete Appointment"
            description="Are you sure you want to delete this appointment?"
            onConfirm={() => handleDeleteAppointment(record.id)}
            okText="Yes"
            cancelText="No"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="middle"
              shape="circle"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const getTodaysAppointments = () => {
    return appointments.filter((a) =>
      dayjs(a.date, "DD-MM-YYYY").isSame(dayjs(), "day")
    );
  };

  const getUpcomingAppointments = () => {
    return appointments
      .filter(
        (a) =>
          (a.status.toLowerCase() === "confirmed" ||
            a.status.toLowerCase() === "pending") &&
          dayjs(a.date, "DD-MM-YYYY").isAfter(dayjs())
      )
      .sort(
        (a, b) =>
          dayjs(a.date, "DD-MM-YYYY").unix() -
          dayjs(b.date, "DD-MM-YYYY").unix()
      )
      .slice(0, 5);
  };

  const renderAppointmentItem = (item) => (
    <List.Item>
      <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            />
            <div className="ml-3">
              <Text strong>{item.patient?.name}</Text>
              <div className="text-gray-500 text-sm">
                <CalendarOutlined className="mr-1" /> {item.date}{" "}
                <ClockCircleOutlined className="ml-2 mr-1" /> {item.time}
              </div>
            </div>
          </div>
          <Badge
            status={getStatusColor(item.status)}
            text={
              <Text strong style={{ textTransform: "capitalize" }}>
                {item.status.toLowerCase()}
              </Text>
            }
          />
        </div>
        {item.reason && (
          <div className="mt-2">
            <Text type="secondary">
              <MedicineBoxOutlined className="mr-1" /> {item.reason}
            </Text>
          </div>
        )}
        <div className="mt-3 flex justify-end">
          <Space>
            <Button
              size="small"
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleViewPatient(item.patientId)}
            >
              View
            </Button>
            <Button
              size="small"
              type="default"
              icon={<EditOutlined />}
              onClick={() => handleEditAppointment(item)}
              style={{ backgroundColor: "#faad14", color: "white" }}
            >
              Edit
            </Button>
          </Space>
        </div>
      </Card>
    </List.Item>
  );

  const dateCellRender = (value) => {
    const dateStr = value.format("DD-MM-YYYY");
    const listData = appointments.filter((item) => item.date === dateStr);

    return (
      <ul className="events p-0 m-0 list-none">
        {listData.map((item) => (
          <li key={item.id} className="mb-1">
            <Badge
              status={getStatusColor(item.status)}
              text={
                <Text className="text-xs">
                  {item.time} - {item.patient?.name}
                </Text>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      {contextHolder}
      <AppHeader />
      <div className="pt-4  px-2 md:px-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="rounded-xl shadow-md mb-6 border-0">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div>
                <Title level={3} style={{ margin: 0, color: "#1890ff" }}>
                  Welcome, Dr. {doctorName}
                </Title>
                <Text type="secondary">
                  {dayjs().format("dddd, MMMM D, YYYY")} • You have{" "}
                  {todayAppointments} appointments today
                </Text>
              </div>
              <div className="mt-4 md:mt-0">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateAppointment}
                  size="large"
                  className="rounded-lg"
                >
                  New Appointment
                </Button>
              </div>
            </div>
          </Card>

          <Row gutter={[16, 16]} className="mb-6 mt-4">
            <Col xs={24} sm={12} md={6}>
              <Card className="rounded-xl shadow-sm border-0 h-full">
                <Statistic
                  title={
                    <Text strong style={{ fontSize: 16 }}>
                      Total Appointments
                    </Text>
                  }
                  value={totalAppointments}
                  prefix={<ScheduleOutlined style={{ color: "#1890ff" }} />}
                  valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="rounded-xl shadow-sm border-0 h-full">
                <Statistic
                  title={
                    <Text strong style={{ fontSize: 16 }}>
                      Today
                    </Text>
                  }
                  value={todayAppointments}
                  prefix={<CalendarOutlined style={{ color: "#722ed1" }} />}
                  valueStyle={{ color: "#722ed1", fontWeight: "bold" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="rounded-xl shadow-sm border-0 h-full">
                <Statistic
                  title={
                    <Text strong style={{ fontSize: 16 }}>
                      Confirmed
                    </Text>
                  }
                  value={confirmedAppointments}
                  prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                  valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="rounded-xl shadow-sm border-0 h-full">
                <Statistic
                  title={
                    <Text strong style={{ fontSize: 16 }}>
                      Pending
                    </Text>
                  }
                  value={pendingAppointments}
                  prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
                  valueStyle={{ color: "#faad14", fontWeight: "bold" }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} lg={16}>
              <Card
                title={
                  <div className="flex items-center">
                    <BellOutlined
                      style={{ color: "#1890ff", marginRight: 8 }}
                    />
                    <span>Today's Appointments</span>
                  </div>
                }
                className="rounded-xl shadow-md border-0 h-full"
                extra={
                  <Button type="link" onClick={() => setActiveTab("today")}>
                    View All
                  </Button>
                }
              >
                {loading ? (
                  <div className="text-center py-8">
                    <Spin size="large" />
                  </div>
                ) : getTodaysAppointments().length > 0 ? (
                  <List
                    dataSource={getTodaysAppointments()}
                    renderItem={renderAppointmentItem}
                    itemLayout="vertical"
                    pagination={
                      getTodaysAppointments().length > 3
                        ? { pageSize: 3 }
                        : false
                    }
                  />
                ) : (
                  <Empty description="No appointments scheduled for today" />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card
                title={
                  <div className="flex items-center">
                    <ScheduleOutlined
                      style={{ color: "#1890ff", marginRight: 8 }}
                    />
                    <span>Upcoming Appointments</span>
                  </div>
                }
                className="rounded-xl shadow-md border-0 h-full"
                extra={
                  <Button type="link" onClick={() => setActiveTab("upcoming")}>
                    View All
                  </Button>
                }
              >
                {loading ? (
                  <div className="text-center py-8">
                    <Spin size="large" />
                  </div>
                ) : getUpcomingAppointments().length > 0 ? (
                  <List
                    size="small"
                    dataSource={getUpcomingAppointments()}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              icon={<UserOutlined />}
                              style={{ backgroundColor: "#1890ff" }}
                            />
                          }
                          title={<Text strong>{item.patient?.name}</Text>}
                          description={
                            <Space direction="vertical" size={0}>
                              <Text type="secondary">
                                <CalendarOutlined className="mr-1" />{" "}
                                {item.date} at {item.time}
                              </Text>
                              {item.reason && (
                                <Text type="secondary">
                                  <MedicineBoxOutlined className="mr-1" />{" "}
                                  {item.reason}
                                </Text>
                              )}
                            </Space>
                          }
                        />
                        <Badge status={getStatusColor(item.status)} />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No upcoming appointments" />
                )}
              </Card>
            </Col>
          </Row>

          <Card className="rounded-xl shadow-md border-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <Title level={4} style={{ margin: 0 }}>
                <FileTextOutlined /> Appointment Management
              </Title>
              <div className="mt-3 md:mt-0 w-full md:w-auto">
                <Input
                  placeholder="Search by patient name or reason"
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: "100%", maxWidth: "300px" }}
                  allowClear
                />
              </div>
            </div>

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="mb-4"
            >
              <TabPane
                tab={
                  <span>
                    <CalendarOutlined /> Today
                  </span>
                }
                key="today"
              />
              <TabPane
                tab={
                  <span>
                    <ScheduleOutlined /> Upcoming
                  </span>
                }
                key="upcoming"
              />
              <TabPane
                tab={
                  <span>
                    <CheckCircleOutlined /> Completed
                  </span>
                }
                key="completed"
              />
              <TabPane
                tab={
                  <span>
                    <ClockCircleOutlined /> Pending
                  </span>
                }
                key="pending"
              />
              <TabPane
                tab={
                  <span>
                    <DeleteOutlined /> Cancelled
                  </span>
                }
                key="cancelled"
              />
              <TabPane
                tab={
                  <span>
                    <FilterOutlined /> All
                  </span>
                }
                key="all"
              />
            </Tabs>

            {activeTab === "calendar" ? (
              <Calendar dateCellRender={dateCellRender} />
            ) : loading ? (
              <div className="text-center py-12">
                <Spin size="large" />
              </div>
            ) : filteredAppointments.length > 0 ? (
              <Table
                columns={columns}
                dataSource={filteredAppointments}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                className="overflow-x-auto"
                rowClassName="hover:bg-blue-50 transition-colors"
                bordered={false}
              />
            ) : (
              <Empty description={`No ${activeTab} appointments found`} />
            )}
          </Card>
        </motion.div>

        <Modal
          title={
            <div className="flex items-center gap-2">
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1890ff" }}
                size="large"
              />
              <span>Patient Profile</span>
            </div>
          }
          open={patientModalVisible}
          onCancel={() => setPatientModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setPatientModalVisible(false)}>
              Close
            </Button>,
            <Button
              key="schedule"
              type="primary"
              icon={<ScheduleOutlined />}
              onClick={() => {
                setPatientModalVisible(false);
                if (selectedPatient) {
                  newAppointmentForm.setFieldsValue({
                    patientId: selectedPatient.patient.id,
                  });
                  setNewAppointmentModalVisible(true);
                }
              }}
            >
              Schedule Appointment
            </Button>,
          ]}
          width={700}
        >
          {selectedPatient ? (
            <div className="space-y-6">
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
              >
                <Descriptions.Item
                  label="Name"
                  labelStyle={{ fontWeight: "bold" }}
                >
                  <Space>
                    <UserOutlined style={{ color: "#1890ff" }} />
                    {selectedPatient.patient.name}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item
                  label="Email"
                  labelStyle={{ fontWeight: "bold" }}
                >
                  <Space>
                    <MailOutlined style={{ color: "#1890ff" }} />
                    {selectedPatient.patient.email}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item
                  label="Patient ID"
                  labelStyle={{ fontWeight: "bold" }}
                >
                  {selectedPatient.patient.id}
                </Descriptions.Item>
                <Descriptions.Item
                  label="First Login"
                  labelStyle={{ fontWeight: "bold" }}
                >
                  {selectedPatient.patient.isfirstlogin ? "Yes" : "No"}
                </Descriptions.Item>
              </Descriptions>

              <Divider orientation="left">Appointment History</Divider>

              <Timeline
                mode="left"
                items={selectedPatient.appointments?.map((a) => ({
                  color: getStatusColor(a.status),
                  label: `${a.date} at ${a.time}`,
                  children: (
                    <Card size="small" className="mb-2 shadow-sm">
                      <div>
                        <Text strong>Reason: </Text>
                        <Text>{a.reason}</Text>
                      </div>
                      <div>
                        <Text strong>Doctor: </Text>
                        <Text>Dr. {a.doctorName}</Text>
                      </div>
                      <div>
                        <Text strong>Status: </Text>
                        <Tag color={getStatusColor(a.status)}>
                          {a.status.toUpperCase()}
                        </Tag>
                      </div>
                    </Card>
                  ),
                }))}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <Spin size="large" />
            </div>
          )}
        </Modal>

        <Modal
          title={
            <div className="flex items-center gap-2">
              <ScheduleOutlined style={{ color: "#1890ff", fontSize: 20 }} />
              <span>Create New Appointment</span>
            </div>
          }
          open={newAppointmentModalVisible}
          onCancel={() => {
            setNewAppointmentModalVisible(false);
            newAppointmentForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={newAppointmentForm}
            layout="vertical"
            onFinish={submitNewAppointment}
            className="mt-4"
          >
            <Form.Item
              name="patientId"
              label="Patient"
              rules={[{ required: true, message: "Please select a patient" }]}
            >
              <Select
                placeholder="Select a patient"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {patients.map((patient) => (
                  <Option key={patient.id} value={patient.id}>
                    {patient.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="date"
                  label="Date"
                  rules={[{ required: true, message: "Please select a date" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    format="DD-MM-YYYY"
                    placeholder="Select date"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="time"
                  label="Time"
                  rules={[{ required: true, message: "Please select a time" }]}
                >
                  <TimePicker
                    style={{ width: "100%" }}
                    format="h A"
                    use12Hours
                    placeholder="Select time"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="reason"
              label="Reason"
              rules={[{ required: true, message: "Please enter a reason" }]}
            >
              <Input.TextArea
                placeholder="Enter reason for appointment"
                rows={3}
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              initialValue="PENDING"
              rules={[{ required: true, message: "Please select a status" }]}
            >
              <Select placeholder="Select status">
                {statusOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item className="mb-0 flex justify-end">
              <Space>
                <Button
                  onClick={() => {
                    setNewAppointmentModalVisible(false);
                    newAppointmentForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Create Appointment
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={
            <div className="flex items-center gap-2">
              <EditOutlined style={{ color: "#faad14", fontSize: 20 }} />
              <span>Edit Appointment</span>
            </div>
          }
          open={editAppointmentModalVisible}
          onCancel={() => {
            setEditAppointmentModalVisible(false);
            setCurrentAppointment(null);
          }}
          footer={null}
          width={600}
        >
          {currentAppointment && (
            <Form
              form={editAppointmentForm}
              layout="vertical"
              onFinish={submitEditAppointment}
              className="mt-4"
            >
              <Alert
                message={`Editing appointment for ${currentAppointment.patient?.name}`}
                type="info"
                showIcon
                className="mb-4"
              />

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="date"
                    label="Date"
                    rules={[
                      { required: true, message: "Please select a date" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD-MM-YYYY"
                      placeholder="Select date"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="time"
                    label="Time"
                    rules={[
                      { required: true, message: "Please select a time" },
                    ]}
                  >
                    <TimePicker
                      style={{ width: "100%" }}
                      format="h A"
                      use12Hours
                      placeholder="Select time"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="reason"
                label="Reason"
                rules={[{ required: true, message: "Please enter a reason" }]}
              >
                <Input.TextArea
                  placeholder="Enter reason for appointment"
                  rows={3}
                />
              </Form.Item>

              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select a status" }]}
              >
                <Select placeholder="Select status">
                  {statusOptions.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item className="mb-0 flex justify-end">
                <Space>
                  <Button
                    onClick={() => {
                      setEditAppointmentModalVisible(false);
                      setCurrentAppointment(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Update Appointment
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Modal>
      </div>
    </>
  );
};

export default DoctorDashboard;
