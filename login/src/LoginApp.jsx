import { useState } from 'react';
import { faker } from '@faker-js/faker/locale/en';
import { emit, EVENTS } from './events';
import './login.css';

/**
 * Pretends to call an auth API. Any email and password work, the user details are mock data.
 */
function fakeLogin(email) {
  return { email, name: 'Bache Kiko', avatar: faker.image.avatar() };
}

export default function LoginApp() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('demo@shop.com');
  const [password, setPassword] = useState('demo');

  const handleSubmit = (event) => {
    event.preventDefault();
    const loggedIn = fakeLogin(email);
    setUser(loggedIn);
    // We do not know who cares about the login (header, cart...). We just broadcast it.
    emit(EVENTS.LOGIN, loggedIn);
  };

  const handleLogout = () => {
    setUser(null);
    emit(EVENTS.LOGOUT);
  };

  if (user) {
    return (
      <div className="login-box">
        <div className="login-user">
          <img src={user.avatar} alt="" className="login-avatar" />
          <div>
            <strong>{user.name}</strong>
            <div className="login-muted">{user.email}</div>
          </div>
        </div>
        <button className="login-button" onClick={handleLogout}>Log out</button>
      </div>
    );
  }

  return (
    <form className="login-box" onSubmit={handleSubmit}>
      <h3 className="login-title">Sign in</h3>
      <input className="login-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="login-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button className="login-button" type="submit">Log in</button>
    </form>
  );
}
