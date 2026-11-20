import Link from "next/link";
import { getSettings } from "@/app/lib/settings";

export default async function Footer() {
  const settings = await getSettings();
  const wa = `https://wa.me/${settings.whatsappNumber}`;
  return (
    <footer className="bg-[#F4C2C2] text-black py-12 mt-16 border-t border-gray-200">
      <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* اللوجو */}
        <div>
          <h3 className="text-3xl font-serif mb-4">La Béllé</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Elegant fashion for every occasion. Discover the latest trends and timeless pieces.
          </p>
        </div>

        {/* لينكات سريعة */}
        <div>
          <h4 className="font-semibold mb-4 uppercase tracking-widest text-sm">Shop</h4>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li><Link href="/shop" className="hover:text-black transition">All Products</Link></li>
            <li><Link href="/search" className="hover:text-black transition">Search</Link></li>
            <li><Link href="/wishlist" className="hover:text-black transition">Wishlist</Link></li>
          </ul>
        </div>

        {/* خدمات العملاء */}
        <div>
          <h4 className="font-semibold mb-4 uppercase tracking-widest text-sm">Customer Service</h4>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li><a href={wa} target="_blank" rel="noreferrer" className="hover:text-black transition">Contact Us (WhatsApp)</a></li>
            <li><Link href="/track" className="hover:text-black transition">Track Your Order</Link></li>
            <li><Link href="/about" className="hover:text-black transition">About</Link></li>
          </ul>
        </div>

        {/* تواصل اجتماعي */}
        <div>
          <h4 className="font-semibold mb-4 uppercase tracking-widest text-sm">Follow Us</h4>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            {settings.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-black transition">Instagram</a>
            )}
            {settings.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-black transition">Facebook</a>
            )}
            <a href={wa} target="_blank" rel="noreferrer" className="hover:text-black transition">WhatsApp</a>
          </div>
        </div>

      </div>
      
      {/* الجزء السفلي: الحقوق والمصمم */}
      <div className="border-t border-gray-300 mt-12 pt-6 flex flex-col items-center justify-center gap-2 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} La Béllé. All rights reserved.</p>
        <p className="text-center">
          This website was created by Mohamed Ahmed Mahfouz. For inquiries, contact via WhatsApp{" "}
          <a 
            href={wa} 
            target="_blank" 
            rel="noreferrer"
            className="font-semibold text-black hover:underline"
          >
            01227840123
          </a>
        </p>
      </div>
    </footer>
  );
}