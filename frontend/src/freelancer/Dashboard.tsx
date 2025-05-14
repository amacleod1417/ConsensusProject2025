// src/Dashboard.tsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Button, Typography, Spin, Upload, message, Alert } from "antd";
import { LogoutOutlined, UploadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw new Error(error.message);
        }

        if (user) {
          setUser(user);
          //fetchAvatar(user.id);
        }
      } catch (err: any) {
        console.error("Error fetching user:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    // const fetchAvatar = async (userId: string) => {
    //   const { data } = await supabase.storage
    //     .from("avatars")
    //     .getPublicUrl(`${userId}/avatar.png`);
    //   if (!data) {
    //     console.error("Error fetching avatar: no data returned");
    //   } else {
    //     setAvatarUrl(data.publicUrl);
    //   }
    // };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      message.error("Error signing out");
    } else {
      window.location.reload();
    }
  };

  const handleUpload = async (file: File) => {
    if (!user) return;
    try {
      const { error } = await supabase.storage
        .from("avatars")
        .upload(`${user.id}/avatar.png`, file, {
          upsert: true,
        });
      if (error) {
        throw new Error(error.message);
      }

      message.success("Avatar uploaded successfully");
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(`${user.id}/avatar.png`);
      setAvatarUrl(data.publicUrl);
    } catch (err: any) {
      message.error(`Error uploading avatar: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <Alert
            type="error"
            message="Error loading dashboard"
            description={error}
            className="mb-4"
          />
          <Button danger onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 to-blue-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <Title level={2}>Welcome, {user?.email}</Title>
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
