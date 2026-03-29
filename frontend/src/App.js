import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import WorkerDashboard from "./pages/WorkerDashboard";
import FamilyDashboard from "./pages/FamilyDashboard";
import EnterpriseDashboard from "./pages/EnterpriseDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  // Use sessionStorage to match your dashboards and ProtectedRoute
  const userData = sessionStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  return (
    <Router>
      <div className="bg-[#020617] min-h-screen text-white">
        <Routes>
          {/* Root Path: Redirects based on role if logged in, else shows Auth */}
          <Route
            path="/"
            element={
              user ? (
                user.role === "worker" ? (
                  <Navigate to="/worker" replace />
                ) : user.role === "family" ? (
                  <Navigate to="/family" replace />
                ) : (
                  <Navigate to="/enterprise" replace />
                )
              ) : (
                <AuthPage />
              )
            }
          />

          {/* Protected Routes */}
          <Route
            path="/worker"
            element={
              <ProtectedRoute role="worker">
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/family"
            element={
              <ProtectedRoute role="family">
                <FamilyDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/enterprise"
            element={
              <ProtectedRoute role="enterprise">
                <EnterpriseDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all: Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
