import { PlaybackPlayer } from '@/components/PlaybackPlayer';
import { decodeSession } from '@/lib/share-codec';
import Link from 'next/link';

// Next.js 16: params is now async
export default async function PlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = decodeSession(id);

  if (!session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold text-white/60 font-mono mb-4">
          Invalid composition
        </h1>
        <p className="text-white/30 text-sm font-mono mb-8">
          This share link appears to be corrupted or expired.
        </p>
        <Link
          href="/"
          className="text-cyan-400 hover:text-cyan-300 text-sm font-mono transition-colors"
        >
          ← Create your own
        </Link>
      </main>
    );
  }

  return (
    <main>
      <PlaybackPlayer session={session} />
    </main>
  );
}
