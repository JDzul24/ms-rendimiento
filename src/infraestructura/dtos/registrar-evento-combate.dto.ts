import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

// Enum para estandarizar los posibles resultados de un combate.
export enum ResultadoCombateEnum {
  VICTORIA = 'VICTORIA',
  DERROTA = 'DERROTA',
  EMPATE = 'EMPATE',
  NO_APLICA = 'NO_APLICA', // Para sparrings o exhibiciones
}

/**
 * DTO para registrar un nuevo evento de combate.
 */
export class RegistrarEventoCombateDto {
  /**
   * El ID del atleta principal involucrado en el evento.
   */
  @IsUUID('4', { message: 'El ID del atleta debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID del atleta es requerido.' })
  atletaId: string;

  /**
   * El tipo de evento que se está registrando.
   * @example "Sparring", "Pelea Amateur", "Pelea Profesional"
   */
  @IsString()
  @IsNotEmpty({ message: 'El tipo de evento no puede estar vacío.' })
  @MaxLength(100)
  tipoEvento: string;

  /**
   * La fecha en que ocurrió el evento de combate, en formato ISO 8601.
   */
  @IsDateString(
    {},
    { message: 'La fecha del evento debe ser una fecha válida.' },
  )
  @IsNotEmpty({ message: 'La fecha del evento es requerida.' })
  fecha: string;

  /**
   * El nombre del oponente.
   */
  @IsString()
  @IsOptional()
  @MaxLength(255)
  nombreOponente?: string;

  /**
   * El resultado del combate.
   */
  @IsEnum(ResultadoCombateEnum, {
    message: `El resultado debe ser uno de los siguientes valores: ${Object.values(
      ResultadoCombateEnum,
    ).join(', ')}`,
  })
  @IsOptional()
  resultado?: ResultadoCombateEnum;
}
