import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Spin,
  Empty,
  Modal,
  message,
  Form,
  DatePicker,
  TimePicker,
  Select,
  Input,
  Tabs,
  Typography,
  Row,
  Col,
  Timeline,
  Tag,
  Divider,
  Avatar,
  Space,
  Alert,
  Statistic,
} from "antd";
import { motion } from "framer-motion";
import { format, parse, compareAsc, isAfter } from "date-fns";
import { useUser } from "../hooks/userUser";
import { api } from "../../api/axios";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  ScheduleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
  RightCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import AppHeader from "./appheader";

const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");

  const [msg, contextHolder] = message.useMessage();

  const { userdata } = useUser();
  const patientId = userdata?.id;

  const [bookForm] = Form.useForm();
  const [rescheduleForm] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/patient`);
        const doctorsRes = await api.get("/doctor/all");

        setPatient(userdata);
        setAppointments(response?.data?.data || []);
        setFilteredAppointments(response?.data?.data || []);
        setDoctors(doctorsRes.data.data || []);
      } catch (err) {
        msg.error("Error fetching patient data.", 3);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = appointments.filter((appt) =>
        appt.doctor?.name.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments(appointments);
    }
  }, [searchText, appointments]);

  const getNextAppointment = () => {
    const now = new Date();
    const upcoming = appointments
      .filter(
        (appt) =>
          appt.status.toLowerCase() !== "cancelled" &&
          isAfter(parse(appt.date, "dd-MM-yyyy", new Date()), now)
      )
      .sort((a, b) =>
        compareAsc(
          parse(a.date, "dd-MM-yyyy", new Date()),
          parse(b.date, "dd-MM-yyyy", new Date())
        )
      );

    return upcoming.length > 0 ? upcoming[0] : null;
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    rescheduleForm.setFieldsValue({
      doctorId: appointment.doctorId,
      reason: appointment.reason || "",
    });
    setRescheduleModalOpen(true);
  };

  const submitReschedule = async (values) => {
    try {
      const { date, time, reason } = values;

      const payload = {
        // doctorId: selectedAppointment.doctorId,
        date: date.format("DD-MM-YYYY"),
        time: time.format("h A"),
        reason,
      };

      console.log(payload);

      const response = await api.patch(
        `/patient/${selectedAppointment.id}`,
        payload
      );

      if (response?.data?.success) {
        setAppointments((prev) =>
          prev.map((appt) =>
            appt.id === selectedAppointment.id
              ? {
                  ...appt,
                  date: payload.date,
                  time: payload.time,
                  reason: payload.reason,
                  status: "PENDING",
                }
              : appt
          )
        );

        msg.success("Appointment rescheduled successfully.", 3);
        setRescheduleModalOpen(false);
        rescheduleForm.resetFields();
        setSelectedAppointment(null);
      } else {
        msg.error(response?.data?.message, 3);
      }
    } catch (error) {
      msg.error("Failed to reschedule appointment.", 3);
    }
  };

  const handleBookAppointment = async (values) => {
    try {
      const { doctorId, date, time, reason } = values;

      const payload = {
        patientId,
        doctorId,
        date: date.format("DD-MM-YYYY"),
        time: time.format("h A"),
        reason,
        status: "PENDING",
      };

      const response = await api.post("/patient", payload);

      if (response?.data?.success) {
        const newAppointment = {
          id: response.data.data.id || `temp-${Date.now()}`,
          ...payload,
          doctor: doctors.find((d) => d.id === doctorId),
        };

        setAppointments((prev) => [...prev, newAppointment]);
        msg.success("Appointment booked successfully!", 3);
        setBookModalOpen(false);
        bookForm.resetFields();
      } else {
        msg.error(response?.data?.message || "Failed to book appointment.", 3);
      }
    } catch (error) {
      console.log(error.message);
      msg.error("Failed to book appointment.", 3);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "confirmed") return "success";
    if (statusLower === "pending") return "warning";
    if (statusLower === "cancelled" || statusLower === "rejected")
      return "error";
    return "default";
  };

  const getStatusTag = (status) => {
    const statusLower = status.toLowerCase();
    return (
      <Tag color={getStatusColor(status)}>
        {statusLower.charAt(0).toUpperCase() + statusLower.slice(1)}
      </Tag>
    );
  };

  const renderAppointmentCard = (appointment) => {
    return (
      <Card
        className="rounded-xl shadow-md hover:shadow-lg transition-shadow"
        bordered={false}
      >
        <div className="flex items-start justify-between mb-4">
          <Space>
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
              size="large"
            />
            <div>
              <Text strong className="text-lg">
                Dr. {appointment.doctor?.name || "Unknown"}
              </Text>
              <div className="text-gray-500">
                {appointment.doctor?.specialization || "General Physician"}
              </div>
            </div>
          </Space>
          {getStatusTag(appointment.status)}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <CalendarOutlined className="mr-2 text-blue-500" />
            <Text>
              {format(
                parse(appointment.date, "dd-MM-yyyy", new Date()),
                "MMMM d, yyyy"
              )}
            </Text>
          </div>
          <div className="flex items-center">
            <ClockCircleOutlined className="mr-2 text-blue-500" />
            <Text>{appointment.time}</Text>
          </div>
          {appointment.reason && (
            <div className="flex items-center">
              <MedicineBoxOutlined className="mr-2 text-blue-500" />
              <Text>{appointment.reason}</Text>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {appointment.status.toLowerCase() !== "cancelled" && (
            <>
              <Button
                type="primary"
                ghost
                onClick={() => handleReschedule(appointment)}
                icon={<EditOutlined />}
              >
                Reschedule
              </Button>
            </>
          )}
        </div>
      </Card>
    );
  };

  const renderNextAppointment = () => {
    const nextAppointment = getNextAppointment();

    if (!nextAppointment) {
      return (
        <Alert
          message="No upcoming appointments"
          description="You don't have any upcoming appointments scheduled."
          type="info"
          showIcon
          action={
            <Button
              size="small"
              type="primary"
              onClick={() => setBookModalOpen(true)}
            >
              Book Now
            </Button>
          }
        />
      );
    }

    return (
      <Card
        className="rounded-xl shadow-md border-0 mb-4"
        style={{
          background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
          color: "white",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <Title level={4} style={{ color: "white", margin: 0 }}>
              Your Next Appointment
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.85)" }}>
              {format(
                parse(nextAppointment.date, "dd-MM-yyyy", new Date()),
                "EEEE, MMMM d, yyyy"
              )}{" "}
              at {nextAppointment.time}
            </Text>
          </div>
          <div className="mt-4 md:mt-0">
            <Space>
              <Avatar
                icon={<UserOutlined />}
                style={{ backgroundColor: "white", color: "#1890ff" }}
                size="large"
              />
              <div>
                <Text strong style={{ color: "white" }}>
                  Dr. {nextAppointment.doctor?.name || "Unknown"}
                </Text>
                <div style={{ color: "rgba(255, 255, 255, 0.85)" }}>
                  {nextAppointment.doctor?.specialization ||
                    "General Physician"}
                </div>
              </div>
            </Space>
          </div>
        </div>

        <Divider
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            margin: "16px 0",
          }}
        />

        <div className="flex flex-wrap gap-4">
          {nextAppointment.reason && (
            <div className="flex items-center">
              <MedicineBoxOutlined
                style={{ color: "rgba(255, 255, 255, 0.85)" }}
                className="mr-2"
              />
              <Text style={{ color: "white" }}>{nextAppointment.reason}</Text>
            </div>
          )}
          <div className="flex items-center ml-auto">
            <Button
              type="default"
              ghost
              style={{ borderColor: "white", color: "white" }}
              onClick={() => handleReschedule(nextAppointment)}
              icon={<EditOutlined />}
            >
              Reschedule
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const renderAppointmentTimeline = () => {
    // Sort appointments by date
    const sortedAppointments = [...filteredAppointments].sort((a, b) => {
      const dateA = parse(a.date, "dd-MM-yyyy", new Date());
      const dateB = parse(b.date, "dd-MM-yyyy", new Date());
      return compareAsc(dateA, dateB);
    });

    return (
      <Timeline mode="left">
        {sortedAppointments.map((appointment) => (
          <Timeline.Item
            key={appointment.id}
            color={getStatusColor(appointment.status)}
            label={format(
              parse(appointment.date, "dd-MM-yyyy", new Date()),
              "MMM d, yyyy"
            )}
          >
            <Card size="small" className="mb-2 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <Text strong>
                    Dr. {appointment.doctor?.name || "Unknown"}
                  </Text>
                  <div>
                    <ClockCircleOutlined className="mr-1 text-blue-500" />{" "}
                    {appointment.time}
                  </div>
                  {appointment.reason && (
                    <div>
                      <MedicineBoxOutlined className="mr-1 text-blue-500" />{" "}
                      {appointment.reason}
                    </div>
                  )}
                </div>
                <div>{getStatusTag(appointment.status)}</div>
              </div>

              {appointment.status.toLowerCase() !== "cancelled" && (
                <div className="mt-2 flex gap-2">
                  <Button
                    size="small"
                    type="primary"
                    ghost
                    onClick={() => handleReschedule(appointment)}
                  >
                    Reschedule
                  </Button>
                </div>
              )}
            </Card>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  const renderAppointmentsByStatus = () => {
    const now = new Date();

    const upcomingAppointments = filteredAppointments.filter(
      (appt) =>
        appt.status.toLowerCase() !== "cancelled" &&
        isAfter(parse(appt.date, "dd-MM-yyyy", new Date()), now)
    );

    const pastAppointments = filteredAppointments.filter(
      (appt) => !isAfter(parse(appt.date, "dd-MM-yyyy", new Date()), now)
    );

    const pendingAppointments = filteredAppointments.filter(
      (appt) => appt.status.toLowerCase() === "pending"
    );

    const confirmedAppointments = filteredAppointments.filter(
      (appt) => appt.status.toLowerCase() === "confirmed"
    );

    const cancelledAppointments = filteredAppointments.filter(
      (appt) =>
        appt.status.toLowerCase() === "cancelled" ||
        appt.status.toLowerCase() === "rejected"
    );

    return (
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span>
              <RightCircleOutlined /> Upcoming ({upcomingAppointments.length})
            </span>
          }
          key="upcoming"
        >
          {upcomingAppointments.length === 0 ? (
            <Empty description="No upcoming appointments" />
          ) : (
            <Row gutter={[16, 16]}>
              {upcomingAppointments.map((appointment) => (
                <Col xs={24} md={12} lg={8} key={appointment.id}>
                  {renderAppointmentCard(appointment)}
                </Col>
              ))}
            </Row>
          )}
        </TabPane>

        <TabPane
          tab={
            <span>
              <CheckCircleOutlined /> Confirmed ({confirmedAppointments.length})
            </span>
          }
          key="confirmed"
        >
          {confirmedAppointments.length === 0 ? (
            <Empty description="No confirmed appointments" />
          ) : (
            <Row gutter={[16, 16]}>
              {confirmedAppointments.map((appointment) => (
                <Col xs={24} md={12} lg={8} key={appointment.id}>
                  {renderAppointmentCard(appointment)}
                </Col>
              ))}
            </Row>
          )}
        </TabPane>

        <TabPane
          tab={
            <span>
              <ClockCircleOutlined /> Pending ({pendingAppointments.length})
            </span>
          }
          key="pending"
        >
          {pendingAppointments.length === 0 ? (
            <Empty description="No pending appointments" />
          ) : (
            <Row gutter={[16, 16]}>
              {pendingAppointments.map((appointment) => (
                <Col xs={24} md={12} lg={8} key={appointment.id}>
                  {renderAppointmentCard(appointment)}
                </Col>
              ))}
            </Row>
          )}
        </TabPane>

        <TabPane
          tab={
            <span>
              <HistoryOutlined /> History ({pastAppointments.length})
            </span>
          }
          key="history"
        >
          {pastAppointments.length === 0 ? (
            <Empty description="No appointment history" />
          ) : (
            renderAppointmentTimeline()
          )}
        </TabPane>

        <TabPane
          tab={
            <span>
              <CloseCircleOutlined /> Cancelled ({cancelledAppointments.length})
            </span>
          }
          key="cancelled"
        >
          {cancelledAppointments.length === 0 ? (
            <Empty description="No cancelled appointments" />
          ) : (
            <Row gutter={[16, 16]}>
              {cancelledAppointments.map((appointment) => (
                <Col xs={24} md={12} lg={8} key={appointment.id}>
                  {renderAppointmentCard(appointment)}
                </Col>
              ))}
            </Row>
          )}
        </TabPane>
      </Tabs>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      {contextHolder}
      <AppHeader />
      <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="rounded-xl shadow-md mb-6 border-0">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  Welcome, {patient?.name}
                </Title>
                <Text type="secondary">
                  Manage your appointments and health records
                </Text>
              </div>
              <div className="mt-4 md:mt-0">
                <Button
                  type="primary"
                  size="large"
                  icon={<ScheduleOutlined />}
                  onClick={() => setBookModalOpen(true)}
                >
                  Book Appointment
                </Button>
              </div>
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card className="rounded-xl shadow-sm border-0 h-full">
                  <Statistic
                    title={
                      <Text strong style={{ fontSize: 16 }}>
                        Total Appointments
                      </Text>
                    }
                    value={appointments.length}
                    prefix={<ScheduleOutlined style={{ color: "#1890ff" }} />}
                    valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="rounded-xl shadow-sm border-0 h-full">
                  <Statistic
                    title={
                      <Text strong style={{ fontSize: 16 }}>
                        Upcoming
                      </Text>
                    }
                    value={
                      appointments.filter(
                        (a) =>
                          a.status.toLowerCase() !== "cancelled" &&
                          isAfter(
                            parse(a.date, "dd-MM-yyyy", new Date()),
                            new Date()
                          )
                      ).length
                    }
                    prefix={
                      <RightCircleOutlined style={{ color: "#52c41a" }} />
                    }
                    valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card className="rounded-xl shadow-sm border-0 h-full">
                  <Statistic
                    title={
                      <Text strong style={{ fontSize: 16 }}>
                        Pending
                      </Text>
                    }
                    value={
                      appointments.filter(
                        (a) => a.status.toLowerCase() === "pending"
                      ).length
                    }
                    prefix={
                      <ClockCircleOutlined style={{ color: "#faad14" }} />
                    }
                    valueStyle={{ color: "#faad14", fontWeight: "bold" }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>

          <div className="mb-6">{renderNextAppointment()}</div>

          <Card className="rounded-xl shadow-md mb-6 border-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <Title level={4} style={{ margin: 0 }}>
                <ScheduleOutlined /> Your Appointments
              </Title>
              <Input
                placeholder="Search by doctor name"
                prefix={<SearchOutlined />}
                style={{ width: 250 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="mt-2 md:mt-0"
              />
            </div>

            {renderAppointmentsByStatus()}
          </Card>
        </motion.div>

        {/* Book Appointment Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <ScheduleOutlined style={{ color: "#1890ff", fontSize: 20 }} />
              <span>Book New Appointment</span>
            </div>
          }
          open={bookModalOpen}
          onCancel={() => {
            setBookModalOpen(false);
            bookForm.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={bookForm}
            layout="vertical"
            onFinish={handleBookAppointment}
            className="mt-4"
          >
            <Form.Item
              name="doctorId"
              label="Doctor"
              rules={[{ required: true, message: "Please select a doctor" }]}
            >
              <Select
                placeholder="Select a doctor"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {doctors.map((doctor) => (
                  <Option key={doctor.id} value={doctor.id}>
                    {doctor.name}{" "}
                    {doctor.specialization ? `(${doctor.specialization})` : ""}
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
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
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
                    minuteStep={30}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="reason"
              label="Reason for Visit"
              rules={[{ required: true, message: "Please enter a reason" }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Describe your symptoms or reason for visit"
              />
            </Form.Item>

            <Form.Item className="mb-0 flex justify-end">
              <Space>
                <Button
                  onClick={() => {
                    setBookModalOpen(false);
                    bookForm.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Book Appointment
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Reschedule Appointment Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <EditOutlined style={{ color: "#faad14", fontSize: 20 }} />
              <span>Reschedule Appointment</span>
            </div>
          }
          open={rescheduleModalOpen}
          onCancel={() => {
            setRescheduleModalOpen(false);
            rescheduleForm.resetFields();
            setSelectedAppointment(null);
          }}
          footer={null}
          width={600}
        >
          {selectedAppointment && (
            <Form
              form={rescheduleForm}
              layout="vertical"
              onFinish={submitReschedule}
              className="mt-4"
            >
              <Alert
                message="Reschedule Information"
                description={`You are rescheduling your appointment with Dr. ${
                  selectedAppointment.doctor?.name || "Unknown"
                }`}
                type="info"
                showIcon
                className="mb-4"
              />

              <Form.Item name="doctorId" hidden>
                <Input />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="date"
                    label="New Date"
                    rules={[
                      { required: true, message: "Please select a date" },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      format="DD-MM-YYYY"
                      disabledDate={(current) =>
                        current && current < dayjs().startOf("day")
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="time"
                    label="New Time"
                    rules={[
                      { required: true, message: "Please select a time" },
                    ]}
                  >
                    <TimePicker
                      style={{ width: "100%" }}
                      format="h A"
                      use12Hours
                      minuteStep={30}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="reason"
                label="Reason for Visit"
                rules={[{ required: true, message: "Please enter a reason" }]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Describe your symptoms or reason for visit"
                />
              </Form.Item>

              <Form.Item className="mb-0 flex justify-end">
                <Space>
                  <Button
                    onClick={() => {
                      setRescheduleModalOpen(false);
                      rescheduleForm.resetFields();
                      setSelectedAppointment(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Reschedule
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

export default PatientDashboard;
