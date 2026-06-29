import { redirect } from 'next/navigation';

// The dashboard (/home) is the front page. Logged-out visitors are sent on to
// /login by the (app) layout's auth guard.
export default function RootPage() {
  redirect('/home');
}
