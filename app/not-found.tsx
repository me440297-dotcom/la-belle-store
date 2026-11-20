import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl md:text-9xl font-serif text-brand-black mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-serif mb-4">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved. 
        Let's get you back to shopping.
      </p>
      <Link 
        href="/"
        className="bg-brand-black text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}