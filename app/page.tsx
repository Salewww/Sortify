import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Sortify
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Get client access set up fast. Track it. Remind it. Audit it.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="btn-primary text-lg"
          >
            Sign In
          </Link>
          <Link
            href="/auth/login"
            className="btn-secondary text-lg"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
