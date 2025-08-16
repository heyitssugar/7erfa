import {
  IsNumber,
  IsString,
  IsEmail,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';

export class CreatePaymentOrderDto {
  @IsNumber()
  @Min(100) // Minimum 1 EGP
  amountCents: number;

  @IsEnum(['EGP'])
  currency: string;

  @IsString()
  userId: string;

  @IsEmail()
  userEmail: string;

  @IsString()
  userFirstName: string;

  @IsString()
  userLastName: string;

  @IsOptional()
  @IsString()
  userPhone?: string;
}
