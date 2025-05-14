import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Typography, Table, Avatar, Spin } from 'antd';

const { Title } = Typography;

export default function ContractorDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContractorData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: contractor } = await supabase
        .from('contractors')
        .select('*')
        .eq('id', user?.id)
        .single();

      const { data: txs } = await supabase
        .from('transactions')
        .select('*')
        .eq('contractor_id', user?.id)
        .order('created_at', { ascending: false });

      setProfile(contractor);
      setTransactions(txs || []);
      setLoading(false);
    };

    fetchContractorData();
  }, []);

  if (loading) return <Spin fullscreen />;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Avatar src={profile?.profile_image} size={64} />
        <div>
          <Title level={3}>{profile?.first_name} {profile?.last_name}</Title>
          <p>{profile?.email}</p>
        </div>
      </div>

      <Title level={4}>Transactions</Title>
      <Table
        dataSource={transactions}
        rowKey="id"
        columns={[
          { title: 'Status', dataIndex: 'status' },
          { title: 'Amount (USDC)', dataIndex: 'usdc_amount' },
          { title: 'Fiat Equivalent', dataIndex: 'fiat_equivalent' },
          { title: 'Date', dataIndex: 'created_at' },
        ]}
      />
    </div>
  );
}