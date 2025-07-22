import { Inject, Injectable } from '@nestjs/common';
import { ISesionRepositorio } from '../../dominio/repositorios/sesion.repositorio';
import { SesionResumenDto } from '../../infraestructura/dtos/sesion-resumen.dto';

@Injectable()
export class ConsultarHistorialSesionesService {
  constructor(
    @Inject('ISesionRepositorio')
    private readonly sesionRepositorio: ISesionRepositorio,
    // En el futuro, podríamos inyectar un servicio de comunicación
    // para obtener el nombre de la rutina desde el 'ms-planificacion'.
  ) {}

  /**
   * Ejecuta la lógica para obtener el historial de sesiones de un atleta.
   * @param atletaId El ID del atleta autenticado.
   * @returns Un arreglo de DTOs con el resumen de cada sesión.
   */
  async ejecutar(atletaId: string): Promise<SesionResumenDto[]> {
    const sesiones =
      await this.sesionRepositorio.encontrarPorAtletaId(atletaId);

    // Mapeamos las entidades de dominio a DTOs de respuesta.
    return sesiones.map((sesion) => {
      // Lógica de negocio para calcular la duración.
      // Si la sesión no ha terminado, la duración es 0.
      const duracionMs = sesion.endTime
        ? sesion.endTime.getTime() - sesion.startTime.getTime()
        : 0;
      const duracionMinutos = Math.round(duracionMs / 60000);

      // Lógica para determinar el nombre del plan.
      // Por ahora, es un placeholder. En la implementación final,
      // se haría una llamada RPC/HTTP al 'ms-planificacion' usando
      // 'sesion.routineAssignmentId' para obtener el nombre real de la rutina.
      const nombrePlan = sesion.routineAssignmentId
        ? `Rutina ${sesion.routineAssignmentId.substring(0, 8)}`
        : 'Entrenamiento Libre';

      const sesionDto: SesionResumenDto = {
        id: sesion.id,
        fechaInicio: sesion.startTime,
        duracionMinutos: duracionMinutos,
        nombrePlan: nombrePlan,
        rpe: sesion.rpeScore,
      };

      return sesionDto;
    });
  }
}
