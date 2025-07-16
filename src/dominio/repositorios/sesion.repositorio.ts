import { SesionEntrenamiento } from '../entidades/sesion-entrenamiento.entity';

export interface ISesionRepositorio {
  /**
   * Guarda una nueva sesión de entrenamiento en la base de datos.
   * @param sesion La entidad SesionEntrenamiento a persistir.
   * @returns Una promesa que resuelve a la entidad guardada.
   */
  guardar(sesion: SesionEntrenamiento): Promise<SesionEntrenamiento>;
}
