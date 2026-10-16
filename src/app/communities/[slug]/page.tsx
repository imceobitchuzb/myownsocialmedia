import { SEED_COMMUNITIES } from '@/lib/seedData';
import CommunityClient from './CommunityClient';

export function generateStaticParams() {
  return SEED_COMMUNITIES.map((c) => ({
    slug: c.slug,
  }));
}

export default function CommunityPage({ params }: { params: { slug: string } }) {
  return <CommunityClient initialSlug={params.slug} />;
}
