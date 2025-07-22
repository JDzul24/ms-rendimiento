import { Inject, Injectable } from '@nestjs/common';
import { ISesionRepositorio } from '../../dominio/repositorios/sesion.repositorio';
import { SesionResumenDto } from '../../infraestructura/dtos/sesion-resumen.dto';
// En una arquitectura más avanzada, inyectaríamos un servicio de comunicación
// para validar la relación Entrenador-Atleta.
// import { IIdentidadService } from '../servicios/identidad.service';

@Injectable()
export class ConsultarHistorialAtletaService {
  constructor(
    @Inject('ISesionRepositorio')
    private readonly sesionRepositorio: ISesionRepositorio,
    // @Inject('IIdentidadService')
    // private readonly identidadService: IIdentidadService,
  ) {}

  /**
   * Ejecuta la lógica para obtener el historial de sesiones de un atleta específico.
   * @param solicitanteId El ID del entrenador autenticado.
   * @param atletaId El ID del atleta cuyo historial se está consultando.
   * @returns Un arreglo de DTOs con el resumen de cada sesión.
   */
  async ejecutar(
    solicitanteId: string,
    atletaId: string,
  ): Promise<SesionResumenDto[]> {
    // --- Lógica de Autorización de Negocio ---
    // En esta fase, implementamos una validación simplificada.
    // En producción, este paso haría una llamada al 'ms-identidad' para verificar
    // si el 'atletaId' es un alumno del 'solicitanteId'.
    // const esSuAlumno = await this.identidadService.verificarRelacionEntrenadorAtleta(solicitanteId, atletaId);
    // if (!esSuAlumno) {
    //   throw new ForbiddenException('No tienes permiso para ver el historial de este atleta.');
    // }
    console.log(
      `[VALIDACIÓN] Verificando si el entrenador ${solicitanteId} puede ver al atleta ${atletaId}. Asumiendo que sí.`,
    );

    const sesiones =
      await this.sesionRepositorio.encontrarPorAtletaId(atletaId);

    if (!sesiones || sesiones.length === 0) {
      // Es importante devolver un arreglo vacío si no hay sesiones,
      // para que el frontend pueda manejarlo correctamente.
      return [];
    }

    return sesiones.map((sesion) => {
      const duracionMs = sesion.endTime
        ? sesion.endTime.getTime() - sesion.startTime.getTime()
        : 0;
      const duracionMinutos = Math.round(duracionMs / 60000);

      const nombrePlan = sesion.routineAssignmentId
        ? `Rutina Asignada` // Placeholder hasta la comunicación entre servicios
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
