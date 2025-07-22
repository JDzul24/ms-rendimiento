import { Asistencia } from '../entidades/asistencia.entity';

/**
 * Interfaz que define las operaciones de persistencia para la entidad Asistencia.
 */
export interface IAsistenciaRepositorio {
  /**
   * Guarda múltiples nuevos registros de asistencia en la base de datos.
   * @param asistencias Un arreglo de entidades Asistencia a persistir.
   */
  guardarMultiples(asistencias: Asistencia[]): Promise<void>;
}
