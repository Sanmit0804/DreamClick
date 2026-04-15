import type { Metadata } from 'next';
import VideoTemplates from '@/components/pages/Templates/VideoTemplates';

export const metadata: Metadata = {
  title: 'Video Templates — DreamClick',
  description: 'Browse and purchase professional VN-style video editing templates for creators.',
};

export default function VideoTemplatesPage() {
  return <VideoTemplates />;
}
