import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt, IsNotEmpty, IsOptional, IsString,
  IsUUID, Max, Min,
} from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({ description: 'ID del pedido que origina la calificación' })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ description: 'ID del usuario que recibe la calificación' })
  @IsUUID()
  @IsNotEmpty()
  reviewedId: string;

  @ApiProperty({ minimum: 1, maximum: 5, description: 'Estrellas (1–5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  stars: number;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  comment?: string;
}
