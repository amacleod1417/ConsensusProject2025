// src/Dashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Button, Typography, Spin, Upload, message } from 'antd';
import { LogoutOutlined, UploadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
      } else {
        setUser(user);
        fetchAvatar(user.id);
      }
      setLoading(false);
    };

    const fetchAvatar = async (userId: string) => {
      const { data, error } = await supabase
        .storage
        .from('avatars')
        .getPublicUrl(`${userId}/avatar.png`);
      if (error) {
        console.error('Error fetching avatar:', error);
      } else {
        setAvatarUrl(data.publicUrl);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      message.error('Error signing out');
    } else {
      window.location.reload();
    }
  };

  const handleUpload = async (file: File) => {
    if (!user) return;
    const { error } = await supabase
      .storage
      .from('avatars')
      .upload(`${user.id}/avatar.png`, file, {
        upsert: true,
      });
    if (error) {
      message.error('Error uploading avatar');
    } else {
      message.success('Avatar uploaded successfully');
      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(`${user.id}/avatar.png`);
      setAvatarUrl(data.publicUrl);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-blue-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <Title level={2}>Welcome, {user.email}</Title>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="mx-auto mb-4 w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <Text>No avatar uploaded</Text>
        )}
        <Upload
          showUploadList={false}
          beforeUpload={(file) => {
            handleUpload(file);
            return false;
          }}
        >
          <Button icon={<UploadOutlined />} className="mb-4">
            Upload Avatar
          </Button>
        </Upload>
        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
