import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../../common/types';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(['customer', 'craftsman'])
  role: UserRole;
}
