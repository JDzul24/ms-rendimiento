import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

// DTO para las secciones de entrenamiento por categoría
class SeccionEntrenamientoDto {
  @IsString({ message: 'La categoría debe ser un texto.' })
  @IsNotEmpty({ message: 'La categoría no puede estar vacía.' })
  categoria: 'calentamiento' | 'resistencia' | 'tecnica';

  @IsInt({ message: 'El tiempo usado debe ser un número entero.' })
  @Min(0, { message: 'El tiempo usado no puede ser negativo.' })
  tiempoUsadoSegundos: number;

  @IsInt({ message: 'El tiempo objetivo debe ser un número entero.' })
  @Min(0, { message: 'El tiempo objetivo no puede ser negativo.' })
  tiempoObjetivoSegundos: number;

  @IsInt({ message: 'Los ejercicios completados debe ser un número entero.' })
  @Min(0, { message: 'Los ejercicios completados no puede ser negativo.' })
  ejerciciosCompletados: number;
}

export class RegistrarSesionEntrenamientoDto {
  @IsUUID('4', {
    message: 'El ID de la asignación debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'El ID de la asignación es requerido.' })
  assignmentId: string;

  @IsDateString(
    {},
    {
      message:
        'La fecha de inicio debe ser una fecha válida en formato ISO 8601.',
    },
  )
  @IsNotEmpty({ message: 'La fecha de inicio es requerida.' })
  fechaInicio: string;

  @IsDateString(
    {},
    {
      message:
        'La fecha de fin debe ser una fecha válida en formato ISO 8601.',
    },
  )
  @IsNotEmpty({ message: 'La fecha de fin es requerida.' })
  fechaFin: string;

  @IsInt({ message: 'La duración total debe ser un número entero.' })
  @Min(0, { message: 'La duración total no puede ser negativa.' })
  duracionTotalSegundos: number;

  @IsInt({ message: 'El tiempo objetivo debe ser un número entero.' })
  @Min(0, { message: 'El tiempo objetivo no puede ser negativo.' })
  tiempoObjetivoSegundos: number;

  @IsInt({ message: 'Los ejercicios completados debe ser un número entero.' })
  @Min(0, { message: 'Los ejercicios completados no puede ser negativo.' })
  ejerciciosCompletados: number;

  @IsArray({ message: 'Las secciones deben ser un arreglo.' })
  @ValidateNested({
    each: true,
    message: 'Cada sección en el arreglo debe ser un objeto válido.',
  })
  @Type(() => SeccionEntrenamientoDto)
  @IsNotEmpty({ message: 'Las secciones son requeridas.' })
  secciones: SeccionEntrenamientoDto[];
}