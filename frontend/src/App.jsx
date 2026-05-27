import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import React from 'react'
import Splash from './Components/Loginin/Signup/Splash'  
import Login from './Components/Loginin/Signup/Login'
import {BrowserRouter as Router,Routes, Route} from 'react-router-dom'
import Signup from './Components/Loginin/Signup/Signup'
import Aboutus from './Components/About us/Aboutus'
import Dashboard from './Components/Dashboard/Dashboard'
import OptionLogin from './Components/Loginin/OptionLogin';
import ForgetPassword from './Components/Loginin/Signup/ForgetPassword'
import CareGiverDash from './Components/Dashboard/CareGiverDash';
import Welcome from './Components/Dashboard/Welcome'
import Profile from  './Components/Dashboard/Profile'
import TermsAndServices from './Components/Dashboard/TermsAndServices'
import Caregivers from './Components/NavBar/Caregivers'
import ProfileUser from './Components/NavBar/ProfileUser'
import Favourites from './Components/NavBar/Favourites'
import AdminLogin from './Components/Loginin/Signup/AdminLogin'
import AdminDashboard from './Components/Dashboard/AdminDashboard'
import Pending from './Components/Dashboard/Pending'
import Verified from './Components/Dashboard/Verified'
import Blocked from './Components/Dashboard/Blocked'
import Reports from './Components/Dashboard/Reports'
import History from  './Components/NavBar/History'
import Connections from './Components/NavBar/Connections'
import ProfileReceiver from './Components/Dashboard/ProfileReceiver'
import CareLogs from './Components/Dashboard/CareLogs'
import Chat from './Components/Chat/Chat';
import ChatPage from './Components/Chat/ChatPage';
import { Navigate } from 'react-router-dom';
import Notifications from './Components/Dashboard/Notifications'
import ErrorBoundary from './Components/ErrorBoundary'
function App() {
  const normalizeRole = (role) => (role || "").toUpperCase().replace(/\s+/g, "");

  const SessionRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("jwtToken");
    const role = normalizeRole(localStorage.getItem("role"));

    if (!token) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(role)) {
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  const UserRoute = ({ children }) => <SessionRoute allowedRoles={["USER"]}>{children}</SessionRoute>;
  const CaregiverRoute = ({ children }) => <SessionRoute allowedRoles={["CAREGIVER"]}>{children}</SessionRoute>;

  // NEW: Specific Protection for Admin
  const AdminRoute = ({ children }) => {
    const adminToken = localStorage.getItem("adminToken");
    // Redirect to /admin (Admin Login) if no admin token is found
    return adminToken ? children : <Navigate to="/admin" replace />;
  };

  return (
    <ErrorBoundary>
      <Router>
      {/* <Routes>
        <Route path='/' element={<Splash/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/signup' element={<Signup/>}></Route>
        <Route path='/aboutUs' element={<Aboutus/>}></Route>
         <Route path='/dash' element={<Dashboard/>}></Route>
         <Route path ='/optionLogin' element={<OptionLogin/>}></Route>
         <Route path ='/forgetPassword' element={<ForgetPassword/>}></Route>
         <Route path ='/CareGiverDash/:id' element={<CareGiverDash/>}></Route>
         <Route path ='/welcome' element={<Welcome/>}></Route>
         <Route path="/profile/:id" element={<Profile />} />
         <Route path ="/terms" element={<TermsAndServices/>}></Route>
         <Route path ="my-caregivers" element={<Caregivers/>}></Route>
         <Route path="/my-profile" element={<ProfileUser />} /> 
         <Route path ="/favourites" element={<Favourites/>}></Route>
        <Route path ="/admin" element={<AdminLogin/>}></Route>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
       <Route path="/admin/pending" element={<Pending/>} />
       <Route path="/admin/verified" element={<Verified />} />
       <Route path="/admin/blocked" element={<Blocked />} />
       <Route path="/admin/reports" element={<Reports />} />
      <Route path ="/history" element={<History/>}></Route>



        

      </Routes> */}
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Splash />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/optionLogin' element={<OptionLogin />} />
        <Route path='/forgetPassword' element={<ForgetPassword />} />
        <Route path='/aboutUs' element={<Aboutus />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/chat" element={<Chat/>} />

        <Route path="/profileReciever/:userId" element={<SessionRoute><ProfileReceiver/></SessionRoute>} />

        {/* Protected User Routes */}
        <Route path='/dash' element={<UserRoute><Dashboard /></UserRoute>} />
        <Route path='/welcome' element={<CaregiverRoute><Welcome /></CaregiverRoute>} />
        <Route path="/profile/:id" element={<UserRoute><Profile /></UserRoute>} />
        <Route path="/my-profile" element={<UserRoute><ProfileUser /></UserRoute>} />
        <Route path="/my-caregivers" element={<UserRoute><Caregivers /></UserRoute>} />
        <Route path="/favourites" element={<UserRoute><Favourites /></UserRoute>} />
        <Route path="/history" element={<UserRoute><History /></UserRoute>} />
        <Route path="/connections" element={<UserRoute><Connections /></UserRoute>} />
        <Route path="/messages" element={<UserRoute><ChatPage /></UserRoute>} />
        <Route path="/terms" element={<UserRoute><TermsAndServices /></UserRoute>} />
        <Route path="/notifications" element={<UserRoute><Notifications /></UserRoute>} />
        <Route path="/care-logs" element={<UserRoute><CareLogs /></UserRoute>} />
        {/* Protected Caregiver Routes */}
        <Route path='/CareGiverDash/:id' element={<CaregiverRoute><CareGiverDash /></CaregiverRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/pending" element={<AdminRoute><Pending /></AdminRoute>} />
        <Route path="/admin/verified" element={<AdminRoute><Verified /></AdminRoute>} />
        <Route path="/admin/blocked" element={<AdminRoute><Blocked /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
      </Routes>
    </Router>
    </ErrorBoundary>
  )
}

export default App
