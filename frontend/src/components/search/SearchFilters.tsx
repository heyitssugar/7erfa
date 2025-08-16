import { useTranslations } from '@/lib/i18n/useTranslations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface SearchFiltersProps {
  onFilterChange: (filters: any) => void;
}

export function SearchFilters({ onFilterChange }: SearchFiltersProps) {
  const t = useTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('search.filters.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>{t('search.filters.price')}</Label>
          <div className="flex items-center space-x-4">
            <Input
              type="number"
              placeholder="Min"
              className="w-24"
              onChange={(e) =>
                onFilterChange({ minPrice: parseInt(e.target.value) })
              }
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              className="w-24"
              onChange={(e) =>
                onFilterChange({ maxPrice: parseInt(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('search.filters.rating')}</Label>
          <Select
            onValueChange={(value) => onFilterChange({ minRating: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any rating</SelectItem>
              <SelectItem value="4">4+ stars</SelectItem>
              <SelectItem value="4.5">4.5+ stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('search.filters.distance')}</Label>
          <div className="pt-2">
            <Slider
              defaultValue={[10]}
              max={50}
              step={1}
              onValueChange={(value) => onFilterChange({ maxDistance: value[0] })}
            />
            <div className="mt-1 text-right text-sm text-muted-foreground">
              Within {10} km
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('search.sort.title')}</Label>
          <Select
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">{t('search.sort.rating')}</SelectItem>
              <SelectItem value="price">{t('search.sort.price')}</SelectItem>
              <SelectItem value="availability">
                {t('search.sort.availability')}
              </SelectItem>
              <SelectItem value="bookings">
                {t('search.sort.bookings')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
