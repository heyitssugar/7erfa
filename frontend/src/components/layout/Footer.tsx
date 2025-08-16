import Link from 'next/link';
import { useTranslations } from '@/lib/i18n/useTranslations';

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">7erfa</h3>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link href="/about" className="hover:underline">About Us</Link>
              <Link href="/careers" className="hover:underline">Careers</Link>
              <Link href="/press" className="hover:underline">Press</Link>
              <Link href="/blog" className="hover:underline">Blog</Link>
            </nav>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Customers</h3>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link href="/how-it-works" className="hover:underline">How It Works</Link>
              <Link href="/safety" className="hover:underline">Safety</Link>
              <Link href="/services" className="hover:underline">Services</Link>
              <Link href="/pricing" className="hover:underline">Pricing</Link>
            </nav>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Craftsmen</h3>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link href="/become-pro" className="hover:underline">Become a Pro</Link>
              <Link href="/resources" className="hover:underline">Resources</Link>
              <Link href="/success-stories" className="hover:underline">Success Stories</Link>
              <Link href="/pro-support" className="hover:underline">Pro Support</Link>
            </nav>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-semibold">Support</h3>
            <nav className="flex flex-col space-y-2 text-sm">
              <Link href="/help" className="hover:underline">Help Center</Link>
              <Link href="/contact" className="hover:underline">Contact Us</Link>
              <Link href="/terms" className="hover:underline">Terms of Service</Link>
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            </nav>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} 7erfa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
