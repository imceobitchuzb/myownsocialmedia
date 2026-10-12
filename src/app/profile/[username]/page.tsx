import { SEED_USERS } from '@/lib/seedData';
import ProfileClient from './ProfileClient';

export function generateStaticParams() {
  return SEED_USERS.map((user) => ({
    username: user.username,
  }));
}

export default function ProfilePage({ params }: { params: { username: string } }) {
  return <ProfileClient initialUsername={params.username} />;
}
