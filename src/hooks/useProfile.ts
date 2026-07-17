import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface UserProfile {
  name: string;
  avatarColor?: string;
  joinedAt?: string;
}

const AVATAR_COLORS = [
  '#B87333', '#C9813A', '#D9A35F', '#8B6914', '#A0522D',
];

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  avatarColor: '#D9A35F',
  joinedAt: new Date().toISOString(),
};

function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function useProfile() {
  const [profile, setProfile] = useLocalStorage<UserProfile>('coffee_journal_profile', DEFAULT_PROFILE);

  useEffect(() => {
    if (profile.avatarColor) return;
    setProfile((current) => ({ ...current, avatarColor: randomAvatarColor() }));
  }, [profile.avatarColor, setProfile]);

  const updateProfile = (patch: Partial<UserProfile>) => {
    setProfile((current) => ({ ...current, ...patch }));
  };

  return { profile, setProfile, updateProfile };
}
