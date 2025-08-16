import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/useTranslations';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimeSlot {
  start: string;
  end: string;
}

interface BookingWidgetProps {
  hourlyRate: number;
  baseCalloutFee: number;
  availableSlots: { date: Date; slots: TimeSlot[] }[];
  onBookingConfirm: (date: Date, slot: TimeSlot) => void;
}

export function BookingWidget({
  hourlyRate,
  baseCalloutFee,
  availableSlots,
  onBookingConfirm,
}: BookingWidgetProps) {
  const t = useTranslations();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>();

  const availableDates = availableSlots.map((slot) => slot.date);
  const slotsForSelectedDate = selectedDate
    ? availableSlots.find(
        (slot) => slot.date.toDateString() === selectedDate.toDateString()
      )?.slots || []
    : [];

  const total = baseCalloutFee + (selectedSlot ? hourlyRate : 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('booking.selectDate')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) =>
            !availableDates.some(
              (availableDate) =>
                availableDate.toDateString() === date.toDateString()
            )
          }
        />

        {selectedDate && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t('booking.selectTime')}
            </label>
            <Select
              value={selectedSlot ? `${selectedSlot.start}-${selectedSlot.end}` : undefined}
              onValueChange={(value) => {
                const [start, end] = value.split('-');
                setSelectedSlot({ start, end });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {slotsForSelectedDate.map((slot) => (
                  <SelectItem
                    key={`${slot.start}-${slot.end}`}
                    value={`${slot.start}-${slot.end}`}
                  >
                    {slot.start} - {slot.end}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('booking.price')}</span>
            <span>{hourlyRate} EGP/hour</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Base Fee</span>
            <span>{baseCalloutFee} EGP</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>{t('booking.total')}</span>
            <span>{total} EGP</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!selectedDate || !selectedSlot}
          onClick={() => selectedDate && selectedSlot && onBookingConfirm(selectedDate, selectedSlot)}
        >
          {t('booking.book')}
        </Button>
      </CardFooter>
    </Card>
  );
}
