import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next-intl/client';
import { Button } from './button';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLocale}
      className="relative"
      title={locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">
        {locale === 'en' ? 'Switch to Arabic' : 'Switch to English'}
      </span>
    </Button>
  );
}
