import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/AuthLayout';
import { PhoneOtpFlow } from '../../components/PhoneOtpFlow';
import { KalpXButton } from '../../components/ui';

export function ForgotPasswordPhonePage() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <AuthLayout title="Password reset">
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--kalpx-text-soft)', marginBottom: 24, lineHeight: 1.6 }}>
            Your password has been reset successfully.
          </p>
          <KalpXButton onClick={() => navigate('/login')}>
            Sign in
          </KalpXButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset password">
      <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, margin: '0 0 16px', lineHeight: 1.6 }}>
        Enter your phone number and we'll send you a reset code.
      </p>
      <PhoneOtpFlow
        purpose="password_reset_phone"
        onSuccess={() => setDone(true)}
      />
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14 }}>
        <Link to="/login" style={{ color: 'var(--kalpx-cta)' }}>← Back to sign in</Link>
      </div>
    </AuthLayout>
  );
}
