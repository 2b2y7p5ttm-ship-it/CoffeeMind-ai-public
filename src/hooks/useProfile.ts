import { useLocalStorage } from './useLocalStorage';

export interface UserProfile {
  name: string;
  avatarColor?: string;
  joinedAt?: string;
}

const AVATAR_COLORS = [
  '#B87333', '#C9813A', '#D9A35F', '#8B6914', '#A0522D',
];

function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function useProfile() {
  const [profile, setProfile] = useLocalStorage<UserProfile>('coffee_journal_profile', {
    name: 'Роман',
    avatarColor: '#D9A35F',
    joinedAt: new Date().toISOString(),
  });

  const updateProfile = (patch: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  };

  // Ensure avatarColor is always set
  if (!profile.avatarColor) {
    setProfile({ ...profile, avatarColor: randomAvatarColor() });
  }

  return { profile, setProfile, updateProfile };
}
