import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'carniceria@ejemplo.com' })
  @IsNotEmpty({ message: 'El email es requerido.' })
  @IsEmail({}, { message: 'Ingresá un email válido.' })
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'MiContraseña123' })
  @IsNotEmpty({ message: 'La contraseña es requerida.' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password: string;
}
