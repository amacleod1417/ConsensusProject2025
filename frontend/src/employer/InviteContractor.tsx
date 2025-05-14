import { useState } from "react";
import { Modal, Button, Form, Input, message } from "antd";
import { supabase } from "../supabaseClient";

export default function InviteContractor({
  open,
  onClose,
  employerId,
  companyId,
}: {
  open: boolean;
  onClose: () => void;
  employerId: string;
  companyId: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values: any) => {
    setLoading(true);
    const { email } = values;
    const { error } = await supabase.from("invitations").insert({
      email,
      token: crypto.randomUUID(),
      employer_id: employerId,
      company_id: companyId,
      status: "pending",
    });
    setLoading(false);
    if (error) {
      message.error("Failed to send invite");
    } else {
      message.success("Invitation sent");
      onClose();
    }
  };

  return (
    <Modal
      title="Invite Contractor"
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Form layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="email"
          label="Contractor Email"
          rules={[{ required: true, type: "email" }]}
        >
          <Input placeholder="contractor@example.com" />
        </Form.Item>
        <Button htmlType="submit" type="primary" loading={loading}>
          Send Invite
        </Button>
      </Form>
    </Modal>
  );
}
