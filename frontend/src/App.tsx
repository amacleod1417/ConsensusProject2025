import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { useAuth } from "./auth/AuthProvider";
import FreelancerDashboard from "./freelancer/Dashboard";
import Login from "./Login";
import EmployerDashboard from "./employer/Dashboard";
import RoleRouter from "./RoleRouter";
import { useState } from "react";
import { supabase } from "./supabaseClient";
import { useEffect } from "react";

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { session, loading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (!session) return;
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!error && data) {
        setUserRole(data.role);
      }
    };

    fetchRole();
  }, [session]);

  if (loading || !userRole) return null;

  if (!session) {
    return <Navigate to="/" replace />;
  }

  // Check if user has the required role
  if (!allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    return (
      <Navigate
        to={userRole === "freelancer" ? "/freelancer" : "/employer"}
        replace
      />
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/freelancer"
            element={
              <ProtectedRoute allowedRoles={["freelancer"]}>
                <FreelancerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer"
            element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["freelancer", "employer"]}>
                <RoleRouter />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
