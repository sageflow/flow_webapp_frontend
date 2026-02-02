// React import removed as it's not needed in React 18+ with JSX transform
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import StudentSignup from './pages/StudentSignup'
import TeacherSignup from './pages/TeacherSignup'
import GuardianSignup from './pages/GuardianSignup'
import PsychologistSignup from './pages/PsychologistSignup'
import SignIn from './pages/SignIn'
import StudentLogin from './pages/StudentLogin'
import ParentLogin from './pages/ParentLogin'
import TeacherLogin from './pages/TeacherLogin'
import PsychologistLogin from './pages/PsychologistLogin'
import HolisticProfile from './pages/HolisticProfile'
import Dashboard from './pages/Dashboard'
import AssessmentSuite from './pages/AssessmentSuite'
import Assessment from './pages/Assessment'
import TherapistMarketplace from './pages/TherapistMarketplace'
import TherapistProfile from './pages/TherapistProfile'
import ScheduleSession from './pages/ScheduleSession'
import AnonymousComplaint from './pages/AnonymousComplaint'
import ComplaintsList from './pages/ComplaintsList'
import WeeklyPulseCheck from './pages/WeeklyPulseCheck'
import Wellness from './pages/Wellness'
import DailyRoutine from './pages/DailyRoutine'
import OceanTest from './pages/OceanTest'
import PsychologistDashboard from './pages/PsychologistDashboard'
import ParentDashboard from './pages/ParentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/login/student" element={<StudentLogin />} />
            <Route path="/login/parent" element={<ParentLogin />} />
            <Route path="/login/teacher" element={<TeacherLogin />} />
            <Route path="/login/psychologist" element={<PsychologistLogin />} />
            <Route path="/signup/student" element={<StudentSignup />} />
            <Route path="/signup/teacher" element={<TeacherSignup />} />
            <Route path="/signup/guardian" element={<GuardianSignup />} />
            <Route path="/signup/psychologist" element={<PsychologistSignup />} />
            <Route
              path="/holistic-profile"
              element={
                <ProtectedRoute>
                  <HolisticProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessment-suite"
              element={
                <ProtectedRoute>
                  <AssessmentSuite />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assessment/:testType/:testId"
              element={
                <ProtectedRoute>
                  <Assessment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/therapist-marketplace"
              element={
                <ProtectedRoute>
                  <TherapistMarketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/therapist/:therapistId"
              element={
                <ProtectedRoute>
                  <TherapistProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule-session/:therapistId"
              element={
                <ProtectedRoute>
                  <ScheduleSession />
                </ProtectedRoute>
              }
            />
            <Route
              path="/anonymous-complaint"
              element={
                <ProtectedRoute>
                  <AnonymousComplaint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints"
              element={
                <ProtectedRoute>
                  <ComplaintsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/weekly-pulse-check"
              element={
                <ProtectedRoute>
                  <WeeklyPulseCheck />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wellness"
              element={
                <ProtectedRoute>
                  <Wellness />
                </ProtectedRoute>
              }
            />
            <Route
              path="/daily-routine"
              element={
                <ProtectedRoute>
                  <DailyRoutine />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ocean-test/:testId"
              element={
                <ProtectedRoute>
                  <OceanTest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/psychologist-dashboard"
              element={
                <ProtectedRoute>
                  <PsychologistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent-dashboard"
              element={
                <ProtectedRoute>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher-dashboard"
              element={
                <ProtectedRoute>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
