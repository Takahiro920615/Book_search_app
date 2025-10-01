// Google OAuth認証を行うためのコンポーネント
import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import axios from 'axios';

interface GoogleAuthProps {
  onSuccess: (user: any) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onSuccess }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // clientIdが未定義の場合のエラーハンドリング
  if (!clientId) {
    console.error('Google Client IDが設定されていません。');
    return <div>エラー: Google Client IDが設定されていません</div>;
  }

  const handleSuccess = async (response: CredentialResponse) => {
    const { credential } = response;
    if (!credential) {
      console.error('認証トークンが取得できませんでした');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/auth/google', { token: credential });
      onSuccess(res.data.user);
    } catch (error) {
      console.error('認証エラー:', error);
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.error('ログイン失敗')}
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;