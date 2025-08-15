import { redirect } from 'next/navigation';

export default function HomePage() {
  // Server-side redirect to the static HTML file
  redirect('/index-new.html');
}