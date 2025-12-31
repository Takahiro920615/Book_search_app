// src/auth/GoogleAuth.tsx
import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import axios from 'axios';

interface GoogleAuthProps {
  onSuccess: (user: any) => void;
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onSuccess }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    console.error('Google Client IDが設定されていません。');
    return <div>エラー: Google Client IDが設定されていません</div>;
  }

  // ← ここを追加！バックエンドのベースURLを環境変数から取得
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://your-rails-app.onrender.com'; // デフォルトは自分のRender URL

  const handleSuccess = async (response: CredentialResponse) => {
    const { credential } = response;
    if (!credential) {
      console.error('認証トークンが取得できませんでした');
      return;
    }
    try {
      // ← ここを修正！localhost → 環境変数
      const res = await axios.post(`${backendUrl}/api/auth/google`, { token: credential });
      onSuccess(res.data.user);

      // 成功したらトークンをlocalStorageに保存（Books.tsxで使ってる場合）
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
    } catch (error: any) {
      console.error('認証エラー:', error);
      // エラーをユーザーに表示したい場合、stateで扱うなど
      alert('バックエンド認証に失敗しました。コンソールを確認してください。');
    }
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.error('ログイン失敗')}
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        logo_alignment="left"
      />
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;