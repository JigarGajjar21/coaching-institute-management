import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css';
import Logo from '../components/Logo';

const ForgotPassword = () => {
  const [email, setEmail]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Logo size={44} />
          </div>
          <h2>Forgot Password</h2>
          <p>Enter your email to receive a reset link</p>
        </div>

        {error && <div className="error-message shake">{error}</div>}

        {sent ? (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', padding: '1.25rem', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
              Reset link sent to <strong>{email}</strong>.<br />
              Check your inbox and click the link to reset your password.
            </p>
            <Link to="/login" className="forgot-password">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required className="form-control" />
            </div>

            <button type="submit" className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || !email}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="form-actions" style={{ justifyContent: 'center', marginTop: '1.25rem', marginBottom: 0 }}>
              <Link to="/login" className="forgot-password">Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
