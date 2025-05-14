// src/Login.tsx
import { useState } from 'react';
import { supabase } from './supabaseClient';
import { Button, Input, Typography, Divider } from 'antd';
import { GoogleOutlined, GithubOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    // No need to navigate here as the useEffect will handle redirection when session updates
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) alert(error.message);
    // Again, redirection handled by useEffect when session updates
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <Title level={2} className="text-center mb-6">
          Welcome Back
        </Title>
        <Input
          placeholder="Email"
          className="mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input.Password
          placeholder="Password"
          className="mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="primary" block onClick={handleEmailLogin}>
          Sign In
        </Button>
        <Divider>Or</Divider>
        <Button
          icon={<GoogleOutlined />}
          className="mb-2"
          block
          onClick={() => handleOAuthLogin("google")}
        >
          Sign in with Google
        </Button>
        <Button
          icon={<GithubOutlined />}
          block
          onClick={() => handleOAuthLogin("github")}
        >
          Sign in with GitHub
        </Button>
        <Button type="link" onClick={() => navigate('/signup')}>
        Don’t have an account?! Sign up brother
        </Button>
      </div>
    </div>
  );
}
