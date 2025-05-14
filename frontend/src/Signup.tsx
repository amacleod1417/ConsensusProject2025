import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Form, Input, Select, Button, Typography, message } from 'antd';

const { Title } = Typography;
const { Option } = Select;

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (values: any) => {
    setLoading(true);
    const { email, password, role } = values;

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      message.error(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id ?? data.session?.user?.id;
    if (!userId) {
    message.error('Sign-up succeeded, but user ID not available yet. Please confirm your email.');
    setLoading(false);
    return;
    }

    const { error: dbError } = await supabase.from('users').insert({
      id: userId,
      email,
      role,
    });

    if (dbError) {
      message.error('Account created, but failed to store user role.');
    } else {
      message.success('Account created! Please check your email to confirm.');
      navigate('/'); // back to login
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <Title level={3} className="text-center mb-6">Create Account</Title>
        <Form layout="vertical" onFinish={handleSignup}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="I am a..." rules={[{ required: true }]}>
            <Select placeholder="Select a role">
              <Option value="contractor">Contractor</Option>
              <Option value="employer">Employer</Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Sign Up
          </Button>
          <Button type="link" onClick={() => navigate('/')}>
            Already have an account? Log in
          </Button>
        </Form>
      </div>
    </div>
  );
}