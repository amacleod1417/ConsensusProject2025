import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Typography, Table, Button, Avatar, Spin } from 'antd';
import InviteContractor from './InviteContractor';

const { Title } = Typography;

export default function EmployerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false); 

  useEffect(() => {
    const fetchEmployerData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: employer } = await supabase
        .from('employers')
        .select('*')
        .eq('id', user?.id)
        .single();

      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('company_id', employer?.company_id)
        .order('created_at', { ascending: false });

      setProfile(employer);
      setTransactions(txs || []);
      setLoading(false);
    };

    fetchEmployerData();
  }, []);

      const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
  } else {
    window.location.reload(); 
  }
};

  if (loading) return <Spin fullscreen />;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Avatar src={profile?.profile_image} size={64} />
        <div>
          <Title level={3}>{profile?.company_name}</Title>
          <p>{profile?.contract_address}</p>
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <Title level={4}>Transactions</Title>
        <Button type="primary" onClick={() => setInviteOpen(true)}>
          Invite Contractor
        </Button>
        <InviteContractor
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          employerId={profile?.id}
          companyId={profile?.company_id}
        />
       <Button danger onClick={handleSignOut}>
          Sign Out
        </Button>

      </div>

      <Table
        dataSource={transactions}
        rowKey="id"
        columns={[
          { title: 'Contractor ID', dataIndex: 'contractor_id' },
          { title: 'Amount (USDC)', dataIndex: 'usdc_amount' },
          { title: 'Status', dataIndex: 'status' },
          { title: 'Date', dataIndex: 'created_at' },
        ]}
      />
    </div>
  );
}