// src/RoleRouter.tsx
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import FreelancerDashboard from "./freelancer/Dashboard";
import EmployerDashboard from "./employer/Dashboard";
import { Spin, Alert, Button } from "antd";

export default function RoleRouter() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(userError.message);
        }

        if (!user) {
          throw new Error("No user found");
        }

        setUser(user);

        const { data, error: roleError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (roleError) {
          // Check if it's just because there's no row
          if (roleError.message.includes("no rows")) {
            console.warn("No role found for user. Defaulting to freelancer.");
            setRole("freelancer");
          } else {
            throw new Error(`Role fetch error: ${roleError.message}`);
          }
        } else if (data) {
          setRole(data.role);
        } else {
          // Default role if no role is found
          setRole("freelancer");
        }
      } catch (err: any) {
        console.error("Error in RoleRouter:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) return <Spin fullscreen />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <Alert
            type="error"
            message="Error determining user role"
            description={error}
            className="mb-4"
          />
          <Button danger onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return role === "freelancer" ? (
    <FreelancerDashboard />
  ) : (
    <EmployerDashboard />
  );
}
