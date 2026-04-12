import type { Metadata } from 'next';
import Contact from '@/components/pages/Contact';

export const metadata: Metadata = {
  title: 'Contact — DreamClick',
  description: 'Get in touch with the DreamClick team.',
};

export default function ContactPage() {
  return <Contact />;
}
