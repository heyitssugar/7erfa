import Link from 'next/link';
import { useTranslations } from '@/lib/i18n/useTranslations';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Search, Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

export function Header() {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              7erfa
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/search" className="transition-colors hover:text-foreground/80">
              {t('common.findPro')}
            </Link>
            <Link href="/become-pro" className="transition-colors hover:text-foreground/80">
              {t('common.becomePro')}
            </Link>
          </nav>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <nav className="flex flex-col space-y-4">
              <Link href="/search" className="text-sm font-medium">
                {t('common.findPro')}
              </Link>
              <Link href="/become-pro" className="text-sm font-medium">
                {t('common.becomePro')}
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button variant="outline" className="w-full justify-start text-sm font-normal md:w-[240px]">
              <Search className="mr-2 h-4 w-4" />
              {t('common.search')}
            </Button>
          </div>
          <nav className="flex items-center">
            <LanguageSwitcher />
            <Button variant="ghost" asChild className="mx-2">
              <Link href="/auth/login">{t('common.login')}</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">{t('common.signup')}</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
