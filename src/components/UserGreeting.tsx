
import { useAuth } from '@/hooks/useAuth';

const UserGreeting = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Get display name from user metadata or fallback to email
  const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name;
  const greeting = displayName ? `Welcome, ${displayName}` : `Welcome, ${user.email}`;

  return (
    <div className="text-sm font-medium font-sans">
      {greeting}
    </div>
  );
};

export default UserGreeting;
