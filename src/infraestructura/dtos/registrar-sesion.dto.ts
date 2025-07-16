import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// DTO anidado para las métricas individuales de la sesión
class MetricaDto {
  @IsString({ message: 'El tipo de métrica debe ser un texto.' })
  @IsNotEmpty({ message: 'El tipo de métrica no puede estar vacío.' })
  tipo: string; // ej: "distancia_corrida", "golpes_saco"

  @IsString({ message: 'El valor de la métrica debe ser un texto.' })
  @IsNotEmpty({ message: 'El valor de la métrica no puede estar vacío.' })
  valor: string; // ej: "5", "150"

  @IsString({ message: 'La unidad de la métrica debe ser un texto.' })
  @IsNotEmpty({ message: 'La unidad de la métrica no puede estar vacía.' })
  unidad: string; // ej: "km", "golpes"
}

export class RegistrarSesionDto {
  @IsUUID('4', { message: 'El ID del atleta debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID del atleta es requerido.' })
  atletaId: string; // En un sistema real, esto se obtendría del token OAuth2

  @IsUUID('4', {
    message: 'El ID de la asignación de rutina debe ser un UUID válido.',
  })
  @IsOptional() // Una sesión puede ser libre, sin rutina asignada
  routineAssignmentId?: string;

  @IsDateString(
    {},
    {
      message:
        'La fecha de inicio debe ser una fecha válida en formato ISO 8601.',
    },
  )
  @IsNotEmpty({ message: 'La fecha de inicio es requerida.' })
  startTime: string;

  @IsDateString(
    {},
    {
      message:
        'La fecha de finalización debe ser una fecha válida en formato ISO 8601.',
    },
  )
  @IsNotEmpty({ message: 'La fecha de finalización es requerida.' })
  endTime: string;

  @IsInt({ message: 'El RPE debe ser un número entero.' })
  @Min(1, { message: 'El RPE mínimo es 1.' })
  @Max(10, { message: 'El RPE máximo es 10.' })
  @IsOptional()
  rpeScore?: number; // Rating of Perceived Exertion (1-10)

  @IsArray({ message: 'Las métricas deben ser un arreglo.' })
  @ValidateNested({
    each: true,
    message: 'Cada métrica en el arreglo debe ser un objeto válido.',
  })
  @Type(() => MetricaDto) // Importante para que class-validator sepa qué clase anidada validar
  @IsOptional()
  metricas?: MetricaDto[];
}
