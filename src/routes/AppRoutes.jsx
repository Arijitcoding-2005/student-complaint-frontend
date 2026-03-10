import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/student/Login";
import Register from "../pages/student/Register";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentComplaints from "../pages/student/StudentComplaints";
import SubmitComplaint from "../pages/student/SubmitComplaint";
import CreateComplaint from "../pages/student/CreateComplaint";

import AdminDashboard from "../pages/admin/AdminDashboard";
import ManageComplaints from "../pages/admin/ManageComplaints";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import { NightModeProvider } from '../context/NightModeContext';
import StudentLayout from "../layouts/StudentLayout";
import ProtectedRoute from "./ProtectedRoute";
// make sure this is imported
import TrackStatus from "../pages/student/TrackStatus";
import Profile from "../pages/student/Profile";
import Creator from "../pages/student/Creator";
import StudentAnalytics from "../pages/student/StudentAnalytics";
import ComplaintDetail from "../pages/student/ComplaintDetail";


const AppRoutes = () => (
  <NightModeProvider>

    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/student"
        element={
          <ProtectedRoute role="STUDENT">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="complaints" element={<StudentComplaints />} />
        <Route path="new" element={<CreateComplaint />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/admin/complaints" element={<ManageComplaints />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/student/track" element={<TrackStatus />} />
      <Route path="/student/profile" element={<Profile />} />
      <Route path="/creator" element={<Creator />} />
      <Route path="/student/analytics" element={<StudentAnalytics />} />
      <Route path="/student/complaints/:id" element={<ComplaintDetail />} />


    </Routes>

  </NightModeProvider>
);
export default AppRoutes;