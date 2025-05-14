import { useAuth } from "./AuthProvider";
import Login from "../Login";
import { Spin } from "antd";
import type { ReactNode } from "react";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const { session, loading } = useAuth();

  if (loading) return <Spin fullscreen />;
  return session ? <>{children}</> : <Login />;
}
