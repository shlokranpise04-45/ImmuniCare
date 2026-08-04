import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  useEffect(() => {
    if (!token) {
      setError('This reset link is missing a token. Please request a new one.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || password.length < 6) {
      setError('Please choose a password with at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccess('Password updated. You can sign in with your new password.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password.');
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Link className="text-link" to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          ← Back to login
        </Link>
        <div className="brand-block" style={{ marginBottom: 16 }}>
          <div className="brand-icon">💉</div>
          <div>
            <h3>ImmuniCare</h3>
            <p>Set a new password</p>
          </div>
        </div>
        <h2>Reset your password</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input placeholder="Confirm new password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          {error && <p style={{ color: 'var(--stamp-red)', fontSize: 13 }}>{error}</p>}
          {success && <p style={{ color: 'var(--sea-green)', fontSize: 13 }}>{success}</p>}
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 6 }}>Update Password</button>
        </form>
      </div>
    </div>
  );
}
