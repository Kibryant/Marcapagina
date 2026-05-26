import { redirect } from 'next/navigation';

export default function YearStoryIndexPage() {
  const currentYear = new Date().getFullYear();
  redirect(`/app/story/year/${currentYear}`);
}
