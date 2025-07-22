import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

// DTO anidado para el resultado de cada prueba individual
class ResultadoPruebaDto {
  @IsUUID('4', {
    message: 'El ID de la prueba estandarizada debe ser un UUID válido.',
  })
  @IsNotEmpty({ message: 'El ID de la prueba es requerido.' })
  testId: string;

  @IsString({ message: 'El valor del resultado debe ser un texto.' })
  @IsNotEmpty({ message: 'El valor del resultado no puede estar vacío.' })
  valor: string; // ej: "45", "120", "2.5"

  @IsNumber({}, { message: 'El puntaje normalizado debe ser un número.' })
  @IsOptional()
  puntajeNormalizado?: number; // ej: 8.5 (de 1 a 10)
}

/**
 * DTO para registrar un conjunto de resultados de pruebas para un atleta.
 */
export class RegistrarPruebasDto {
  /**
   * El ID del atleta que fue evaluado.
   */
  @IsUUID('4', { message: 'El ID del atleta debe ser un UUID válido.' })
  @IsNotEmpty({ message: 'El ID del atleta es requerido.' })
  atletaId: string;

  /**
   * Un arreglo con los resultados de cada una de las pruebas realizadas.
   */
  @IsArray({ message: 'Los resultados de las pruebas deben ser un arreglo.' })
  @IsNotEmpty({ message: 'Debe proporcionar al menos un resultado.' })
  @ValidateNested({ each: true })
  @Type(() => ResultadoPruebaDto)
  resultados: ResultadoPruebaDto[];
}
