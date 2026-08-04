import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const { login, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address first so we can send the reset link.');
      return;
    }

    setError('');
    setInfo('');
    setIsResetting(true);
    try {
      const data = await forgotPassword(email);
      setInfo(data.message || 'If an account exists for that email, a reset link has been sent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send reset link.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Link className="text-link" to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          ← Back to landing
        </Link>
        <div className="brand-block" style={{ marginBottom: 16 }}>
          <div className="brand-icon">💉</div>
          <div>
            <h3>ImmuniCare</h3>
            <p>Welcome back</p>
          </div>
        </div>
        <h2>Sign in to your account</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p style={{ color: 'var(--stamp-red)', fontSize: 13 }}>{error}</p>}
          {info && <p style={{ color: 'var(--sea-green)', fontSize: 13 }}>{info}</p>}
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 6 }}>Login</button>
        </form>
        <p style={{ marginTop: 10 }}>
          <button type="button" className="text-link" onClick={handleForgotPassword} disabled={isResetting} style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
            {isResetting ? 'Sending…' : 'Forgot password?'}
          </button>
        </p>
        <p style={{ marginTop: 12 }}>
          No account? <Link className="auth-link" to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
