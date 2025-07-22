import { IsArray, IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

/**
 * DTO para registrar la asistencia de múltiples atletas en una fecha específica.
 */
export class RegistrarAsistenciaDto {
  /**
   * La fecha para la cual se está registrando la asistencia, en formato ISO 8601 (solo la fecha es relevante).
   * @example "2024-07-25"
   */
  @IsDateString(
    {},
    { message: 'La fecha debe ser una fecha válida en formato ISO.' },
  )
  @IsNotEmpty({ message: 'La fecha de asistencia es requerida.' })
  fecha: string;

  /**
   * Un arreglo con los IDs (UUIDs) de los atletas que asistieron.
   */
  @IsArray({ message: 'La lista de atletas debe ser un arreglo.' })
  @IsNotEmpty({
    message:
      'Debe proporcionar al menos un atleta para registrar la asistencia.',
  })
  @IsUUID('4', {
    each: true,
    message: 'Cada ID de atleta en la lista debe ser un UUID válido.',
  })
  atletaIds: string[];
}
