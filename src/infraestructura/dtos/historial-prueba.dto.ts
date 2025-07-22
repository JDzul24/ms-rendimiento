/**
 * DTO para representar un único resultado de prueba en una lista del historial.
 * Esta es la estructura que recibirá el frontend.
 */
export class HistorialPruebaDto {
  /**
   * El identificador único (UUID) del resultado de la prueba.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  idResultado: string;

  /**
   * El nombre de la prueba estandarizada que se realizó.
   * Este es un campo enriquecido.
   * @example "Plancha Abdominal"
   */
  nombrePrueba: string;

  /**
   * La fecha y hora en que se registró la prueba, en formato ISO 8601.
   * @example "2024-07-21T10:00:00.000Z"
   */
  fecha: Date;

  /**
   * El resultado crudo obtenido en la prueba.
   * @example "125"
   */
  valor: string;

  /**
   * La unidad de medida para el resultado.
   * Este es un campo enriquecido.
   * @example "segundos"
   */
  unidad: string;

  /**
   * El puntaje normalizado (ej. de 1 a 10) si fue calculado.
   * @example 9.2
   */
  puntajeNormalizado?: number;
}
