import { IsNumber, Min, Max } from 'class-validator';

export class CreateTopupOrderDto {
  @IsNumber()
  @Min(100) // Minimum 1 EGP
  @Max(1000000) // Maximum 10,000 EGP
  amountCents: number;
}
