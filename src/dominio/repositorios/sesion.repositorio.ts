import { SesionEntrenamiento } from '../entidades/sesion-entrenamiento.entity';

/**
 * Interfaz que define las operaciones de persistencia para la entidad SesionEntrenamiento.
 */
export interface ISesionRepositorio {
  /**
   * Guarda una nueva sesión de entrenamiento en la base de datos.
   * @param sesion La entidad SesionEntrenamiento a persistir.
   * @returns Una promesa que resuelve a la entidad guardada.
   */
  guardar(sesion: SesionEntrenamiento): Promise<SesionEntrenamiento>;

  /**
   * Busca todas las sesiones de entrenamiento de un atleta específico.
   * @param atletaId El ID del atleta cuyas sesiones se buscan.
   * @returns Una promesa que resuelve a un arreglo de entidades SesionEntrenamiento.
   */
  encontrarPorAtletaId(atletaId: string): Promise<SesionEntrenamiento[]>;
}
