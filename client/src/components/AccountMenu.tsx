import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <NavLink to="/login" className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-ink-soft hover:border-ink-mute hover:text-ink">
        Log in
      </NavLink>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[160px] truncate text-[13px] text-ink-mute md:inline" title={user.email}>
        {user.email}
      </span>
      <button
        type="button"
        onClick={() => {
          logout();
          navigate('/login', { replace: true, state: { notice: 'You have been logged out.' } });
        }}
        className="rounded-lg border border-line px-3 py-1.5 text-[13px] text-ink-soft hover:border-ink-mute hover:text-ink"
      >
        Log out
      </button>
    </div>
  );
}
