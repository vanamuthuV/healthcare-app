import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import Login from "./pages/login";
import RegistrationForm from "./pages/registration";
import DoctorDashboard from "./pages/doctor";
import PatientDashboard from "./pages/patient";
import ProtectedRoute from "./util/protectedRotue";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegistrationForm />} />

        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={["PATIENT"]}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />

        {/* <Route path="/patient" element={<PatientDashboard />} /> */}

        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={["DOCTOR"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        {/* <Route path="/doctor" element={<DoctorDashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
