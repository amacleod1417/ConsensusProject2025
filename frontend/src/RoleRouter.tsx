// src/RoleRouter.tsx
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import ContractorDashboard from './ContractorDashboard';
import EmployerDashboard from './EmployerDashboard';
import { Spin } from 'antd';

export default function RoleRouter() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return;

      const { data, error: roleError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!roleError && data) {
        setRole(data.role);
      }

      setLoading(false);
    };

    fetchRole();
  }, []);

  if (loading) return <Spin fullscreen />;

  return role === 'contractor' ? <ContractorDashboard /> : <EmployerDashboard />;
}
