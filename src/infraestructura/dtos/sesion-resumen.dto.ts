/**
 * DTO para representar la información de resumen de una sesión de entrenamiento
 * en una lista del historial.
 */
export class SesionResumenDto {
  /**
   * El identificador único (UUID) de la sesión de entrenamiento.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  id: string;

  /**
   * La fecha y hora en que comenzó la sesión, en formato ISO 8601.
   * @example "2024-07-20T18:30:00.000Z"
   */
  fechaInicio: Date;

  /**
   * La duración total de la sesión en minutos.
   * Este es un campo calculado.
   * @example 60
   */
  duracionMinutos: number;

  /**
   * El nombre de la rutina que se siguió durante la sesión.
   * Puede ser "Entrenamiento Libre" si no se siguió una rutina específica.
   * @example "Rutina de Potencia"
   */
  nombrePlan: string;

  /**
   * El puntaje de Esfuerzo Percibido (RPE) reportado por el atleta (1-10).
   * Puede ser nulo si no se reportó.
   * @example 8
   */
  rpe?: number;
}
