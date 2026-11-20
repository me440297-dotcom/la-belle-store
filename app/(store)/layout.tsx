import Header from "../components/Header";
import Footer from "../components/Footer";

// الصفحات دي بتقرا إعدادات من الداتابيز (Hero والفوتر)، فلازم تتحسب مع كل طلب مش وقت الـ build
export const dynamic = "force-dynamic";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}