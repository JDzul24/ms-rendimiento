import { EventoCombate } from '../entidades/evento-combate.entity';

/**
 * Interfaz que define las operaciones de persistencia para la entidad EventoCombate.
 */
export interface IEventoCombateRepositorio {
  /**
   * Guarda una nueva entidad EventoCombate en la base de datos.
   * @param evento El objeto de la entidad EventoCombate a persistir.
   * @returns Una promesa que resuelve a la entidad EventoCombate guardada.
   */
  guardar(evento: EventoCombate): Promise<EventoCombate>;

  /**
   * Busca todos los eventos de combate de un atleta específico.
   * @param atletaId El ID del atleta cuyo historial de combates se busca.
   * @returns Una promesa que resuelve a un arreglo de entidades EventoCombate.
   */
  encontrarPorAtletaId(atletaId: string): Promise<EventoCombate[]>;
}
