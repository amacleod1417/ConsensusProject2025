
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Form, Input, Button, Upload, message, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function EmployerSetup() {
  const [form] = Form.useForm();
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        message.error('You must be logged in.');
        navigate('/');
        return;
      }
      setUserId(user.id);
    };
    getUser();
  }, []);

  const handleSubmit = async (values: any) => {
    if (!userId) return;
    const { company_name, contract_address } = values;

    const profile_image = form.getFieldValue('profile_image_url');

    const { error } = await supabase.from('employers').insert({
      id: userId,
      company_name,
      contract_address,
      profile_image,
    });

    if (error) {
      message.error('Failed to save employer info');
    } else {
      message.success('Employer profile created!');
      navigate('/dashboard');
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const filePath = `${userId}/avatar-${Date.now()}`;
    const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });

    if (error) {
      message.error('Upload failed');
    } else {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      form.setFieldValue('profile_image_url', data.publicUrl);
      message.success('Image uploaded');
    }

    setUploading(false);
    return false;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <Title level={3} className="text-center mb-6">Complete Your Employer Profile</Title>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="company_name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="contract_address"
            label="Wallet Address"
            rules={[{ required: true, message: 'Enter your Aptos address' }]}
          >
            <Input placeholder="0x..." />
          </Form.Item>

          <Form.Item label="Upload Profile Picture">
            <Upload
              beforeUpload={handleUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                Upload Image
              </Button>
            </Upload>
            <Form.Item name="profile_image_url" hidden>
              <Input />
            </Form.Item>
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            Save and Continue
          </Button>
        </Form>
      </div>
    </div>
  );
}
