import { Inject, Injectable } from '@nestjs/common';
import { ISesionRepositorio } from '../../dominio/repositorios/sesion.repositorio';
import { SesionResumenDto } from '../../infraestructura/dtos/sesion-resumen.dto';
import { PlanificacionService } from './planificacion.service';

@Injectable()
export class ConsultarHistorialSesionesService {
  constructor(
    @Inject('ISesionRepositorio')
    private readonly sesionRepositorio: ISesionRepositorio,
    // Se inyecta el nuevo servicio de comunicación
    private readonly planificacionService: PlanificacionService,
  ) {}

  /**
   * Ejecuta la lógica completa para obtener el historial de sesiones de un atleta.
   * @param atletaId El ID del atleta autenticado.
   * @returns Un arreglo de DTOs con el resumen de cada sesión, enriquecido con el nombre del plan.
   */
  async ejecutar(atletaId: string): Promise<SesionResumenDto[]> {
    // 1. Obtener todas las sesiones del atleta desde la base de datos.
    const sesiones =
      await this.sesionRepositorio.encontrarPorAtletaId(atletaId);

    // 2. Recolectar los IDs únicos de las rutinas para una consulta optimizada.
    const idsDeRutinas = [
      ...new Set( // Usamos un Set para eliminar duplicados
        sesiones
          .map((sesion) => sesion.routineAssignmentId)
          .filter((id): id is string => !!id), // Filtramos los nulos/undefined
      ),
    ];

    // 3. Obtener los nombres de todas las rutinas necesarias en una sola llamada de red.
    const mapaDeNombresDeRutinas =
      await this.planificacionService.obtenerNombresDeRutinas(idsDeRutinas);

    // 4. Mapear las entidades de dominio a DTOs de respuesta enriquecidos.
    return sesiones.map((sesion) => {
      const duracionMs = sesion.endTime
        ? sesion.endTime.getTime() - sesion.startTime.getTime()
        : 0;
      const duracionMinutos = Math.round(duracionMs / 60000);

      // Obtenemos el nombre real del mapa, o usamos 'Entrenamiento Libre' como fallback.
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
