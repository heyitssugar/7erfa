import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n/useTranslations';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface CraftsmanCardProps {
  id: string;
  name: string;
  avatar: string;
  crafts: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  distance: number;
  nextAvailable?: string;
}

export function CraftsmanCard({
  id,
  name,
  avatar,
  crafts,
  rating,
  reviewCount,
  hourlyRate,
  distance,
  nextAvailable,
}: CraftsmanCardProps) {
  const t = useTranslations();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-square">
          <Image
            src={avatar}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{name}</h3>
              <div className="mt-1 flex flex-wrap gap-1">
                {crafts.map((craft) => (
                  <Badge key={craft} variant="secondary">
                    {craft}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center text-sm">
              <Star className="mr-1 h-4 w-4 fill-current text-yellow-400" />
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span className="ml-1 text-muted-foreground">({reviewCount})</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <span className="font-medium">{hourlyRate} EGP</span>
              <span className="text-muted-foreground">/hour</span>
            </div>
            <div className="text-muted-foreground">
              {distance.toFixed(1)} km away
            </div>
          </div>
          {nextAvailable && (
            <div className="mt-2 text-sm text-muted-foreground">
              Next available: {nextAvailable}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/craftsman/${id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
