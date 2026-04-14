import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail, IsEnum, IsNotEmpty, IsOptional,
  IsString, MinLength, MaxLength, Matches, IsNumber, Min, Max,
} from 'class-validator';
import { UserRole } from '../../common/enums';

export class CreateUserDto {
  @ApiProperty({ example: 'Carnicería El Gaucho' })
  @IsNotEmpty({ message: 'El nombre del negocio es requerido.' })
  @IsString()
  @MaxLength(150)
  businessName: string;

  @ApiProperty({ example: '20-12345678-9', description: 'CUIT con formato XX-XXXXXXXX-X' })
  @IsNotEmpty({ message: 'El CUIT es requerido.' })
  @Matches(/^\d{2}-\d{7,8}-\d{1}$/, { message: 'El CUIT debe tener formato XX-XXXXXXXX-X.' })
  cuit: string;

  @ApiProperty({ example: 'carniceria@ejemplo.com' })
  @IsNotEmpty({ message: 'El email es requerido.' })
  @IsEmail({}, { message: 'Ingresá un email válido.' })
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'Contraseña123!', minLength: 8 })
  @IsNotEmpty({ message: 'La contraseña es requerida.' })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'La contraseña debe tener al menos una mayúscula, una minúscula y un número.',
  })
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.BUYER })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: 'Carnicería minorista' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  rubro?: string;

  @ApiPropertyOptional({ example: '+54 11 1234-5678' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'Juan García' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactName?: string;

  @ApiPropertyOptional({ example: 'Av. Corrientes 1234' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ example: 'Buenos Aires' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'Buenos Aires' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  province?: string;

  // Vendor-specific
  @ApiPropertyOptional({ example: 'SENASA-2024-001' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  senasaLicense?: string;

  @ApiPropertyOptional({ example: 'MUNI-2024-001' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  municipalLicense?: string;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999999)
  weeklyCapacityKg?: number;
}
