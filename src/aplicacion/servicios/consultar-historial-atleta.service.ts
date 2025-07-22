import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { ISesionRepositorio } from '../../dominio/repositorios/sesion.repositorio';
import { SesionResumenDto } from '../../infraestructura/dtos/sesion-resumen.dto';
import { IdentidadService } from './identidad.service'; // Se importa el servicio de comunicación
import { PlanificacionService } from './planificacion.service'; // Se importa para enriquecer los nombres

@Injectable()
export class ConsultarHistorialAtletaService {
  constructor(
    @Inject('ISesionRepositorio')
    private readonly sesionRepositorio: ISesionRepositorio,
    // Se inyectan los servicios cliente para la comunicación inter-servicios
    private readonly identidadService: IdentidadService,
    private readonly planificacionService: PlanificacionService,
  ) {}

  /**
   * Ejecuta la lógica completa para obtener el historial de sesiones de un atleta.
   *
   * @param solicitanteId El ID del entrenador autenticado.
   * @param atletaId El ID del atleta cuyo historial se está consultando.
   * @returns Un arreglo de DTOs con el resumen de cada sesión.
   * @throws ForbiddenException si el solicitante no tiene permiso sobre el atleta.
   */
  async ejecutar(
    solicitanteId: string,
    atletaId: string,
  ): Promise<SesionResumenDto[]> {
    // 1. --- Lógica de Autorización de Negocio (Implementación Completa) ---
    // Se delega la validación de la relación al servicio de comunicación.
    const tienePermiso =
      await this.identidadService.verificarRelacionEntrenadorAtleta(
        solicitanteId,
        atletaId,
      );

    if (!tienePermiso) {
      throw new ForbiddenException(
        'No tienes permiso para ver el historial de este atleta.',
      );
    }

    // 2. Obtener los datos de rendimiento si la autorización es exitosa.
    const sesiones =
      await this.sesionRepositorio.encontrarPorAtletaId(atletaId);

    if (!sesiones || sesiones.length === 0) {
      return [];
    }

    // 3. Enriquecer los datos con información del ms-planificacion.
    const idsDeRutinas = [
      ...new Set(
        sesiones
          .map((sesion) => sesion.routineAssignmentId)
          .filter((id): id is string => !!id),
      ),
    ];
    const mapaDeNombresDeRutinas =
      await this.planificacionService.obtenerNombresDeRutinas(idsDeRutinas);

    // 4. Mapear al DTO de respuesta final.
    return sesiones.map((sesion) => {
      const duracionMs = sesion.endTime
        ? sesion.endTime.getTime() - sesion.startTime.getTime()
        : 0;
      const duracionMinutos = Math.round(duracionMs / 60000);

      const nombrePlan = sesion.routineAssignmentId
        ? mapaDeNombresDeRutinas.get(sesion.routineAssignmentId) ||
          'Rutina Desconocida'
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
