import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Typography, Table, Button, Avatar, Spin, Alert } from "antd";
import InviteContractor from "./InviteContractor";

const { Title } = Typography;

interface Transaction {
  id: string;
  contractor_id: string;
  usdc_amount: number;
  status: string;
  created_at: string;
  [key: string]: any;
}

export default function EmployerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchEmployerData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(userError.message);
        }

        setUser(user);

        // Try to get employer data, but don't fail if table doesn't exist yet
        const { data: employer, error: employerError } = await supabase
          .from("employers")
          .select("*")
          .eq("id", user?.id)
          .single();

        if (employerError && !employerError.message.includes("no rows")) {
          console.warn("Employer data fetch error:", employerError);
        }

        // Try to get transactions, but don't fail if table doesn't exist
        const { data: txs, error: txError } = await supabase
          .from("transactions")
          .select("*")
          .eq("company_id", employer?.company_id)
          .order("created_at", { ascending: false });

        if (txError) {
          console.warn("Transactions fetch error:", txError);
        }

        setProfile(employer || { id: user?.id });
        setTransactions(txs || []);
      } catch (err: any) {
        console.error("Error in dashboard:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployerData();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      window.location.reload();
    }
  };

  if (loading) return <Spin fullscreen />;

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Alert
          type="error"
          message="Error loading dashboard"
          description={error}
        />
        <Button danger onClick={handleSignOut} className="mt-4">
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Avatar src={profile?.profile_image} size={64} />
        <div>
          <Title level={3}>{profile?.company_name || user?.email}</Title>
          <p>{profile?.contract_address || "No contract address yet"}</p>
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
          employerId={profile?.id || user?.id}
          companyId={profile?.company_id || ""}
        />
        <Button danger onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>

      {transactions.length > 0 ? (
        <Table
          dataSource={transactions}
          rowKey="id"
          columns={[
            { title: "Contractor ID", dataIndex: "contractor_id" },
            { title: "Amount (USDC)", dataIndex: "usdc_amount" },
            { title: "Status", dataIndex: "status" },
            { title: "Date", dataIndex: "created_at" },
          ]}
        />
      ) : (
        <Alert message="No transactions found" type="info" />
      )}
    </div>
  );
}
