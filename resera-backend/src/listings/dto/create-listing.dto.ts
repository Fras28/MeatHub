import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum, IsNotEmpty, IsNumber, IsOptional,
  IsPositive, IsBoolean, IsDateString, IsArray,
  IsString, MaxLength, Max, Min,
} from 'class-validator';
import { AnimalSpecies, AnimalBreed, ListingType } from '../../common/enums';

export class CreateListingDto {
  @ApiProperty({ enum: ListingType })
  @IsEnum(ListingType)
  type: ListingType;

  @ApiProperty({ enum: AnimalSpecies })
  @IsEnum(AnimalSpecies)
  species: AnimalSpecies;

  @ApiPropertyOptional({ enum: AnimalBreed })
  @IsOptional()
  @IsEnum(AnimalBreed)
  breed?: AnimalBreed;

  @ApiPropertyOptional({ example: 480 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(2000)
  liveWeightKg?: number;

  @ApiProperty({ example: 280 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Max(2000)
  hookWeightKg: number;

  @ApiProperty({ example: 4500 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  pricePerKg: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'La Pampa' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  originProvince?: string;

  @ApiPropertyOptional({ example: 'Establecimiento Los Alamos' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  originFarm?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  slaughterDate?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  pickupAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pickupCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pickupProvince?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  deliveryAvailable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  specialConditions?: string;
}
