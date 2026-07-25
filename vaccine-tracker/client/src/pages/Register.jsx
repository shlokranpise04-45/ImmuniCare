import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
            <p>Start tracking today</p>
          </div>
        </div>
        <h2>Create your account</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p style={{ color: 'var(--stamp-red)', fontSize: 13 }}>{error}</p>}
          <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: 6 }}>Create Account</button>
        </form>
        <p style={{ marginTop: 12 }}>
          Already have an account? <Link className="auth-link" to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
