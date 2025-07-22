import { ResultadoCombateEnum } from '../../dominio/entidades/evento-combate.entity';

/**
 * DTO para representar un único evento de combate en una lista del historial.
 * Esta es la estructura que recibirá el frontend.
 */
export class HistorialCombateDto {
  /**
   * El identificador único (UUID) del evento de combate.
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  id: string;

  /**
   * El tipo de evento que se registró.
   * @example "Pelea Amateur"
   */
  tipoEvento: string;

  /**
   * La fecha en que ocurrió el evento, en formato ISO 8601.
   * @example "2024-05-15T20:00:00.000Z"
   */
  fecha: Date;

  /**
   * El nombre del oponente en el combate.
   * Puede ser nulo o indefinido si no se registró.
   * @example "Juan 'El Martillo' Pérez"
   */
  nombreOponente?: string;

  /**
   * El resultado final del combate.
   * Puede ser nulo o indefinido si no aplica (ej. sparring).
   * @example "VICTORIA"
   */
  resultado?: ResultadoCombateEnum;
}
