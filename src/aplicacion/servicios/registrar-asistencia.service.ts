import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { IAsistenciaRepositorio } from '../../dominio/repositorios/asistencia.repositorio';
import { RegistrarAsistenciaDto } from '../../infraestructura/dtos/registrar-asistencia.dto';
import { Asistencia } from '../../dominio/entidades/asistencia.entity';
import { IdentidadService } from './identidad.service';

@Injectable()
export class RegistrarAsistenciaService {
  constructor(
    @Inject('IAsistenciaRepositorio')
    private readonly asistenciaRepositorio: IAsistenciaRepositorio,
    // Inyectamos el servicio de comunicación para la autorización
    private readonly identidadService: IdentidadService,
  ) {}

  /**
   * Ejecuta la lógica robusta para registrar la asistencia de múltiples atletas.
   *
   * @param dto - El DTO con la fecha y la lista de atletas.
   * @param entrenadorId - El ID del entrenador que realiza el registro (del token JWT).
   * @returns Un objeto de confirmación.
   */
  async ejecutar(
    dto: RegistrarAsistenciaDto,
    entrenadorId: string,
  ): Promise<{ mensaje: string; asistenciasRegistradas: number }> {
    // 1. Lógica de Autorización de Negocio:
    //    Verificar que todos los atletas en la lista pertenecen al entrenador.
    const validacionExitosa =
      await this.identidadService.verificarPertenenciaDeAtletas(
        entrenadorId,
        dto.atletaIds,
      );

    if (!validacionExitosa) {
      throw new ForbiddenException(
        'No tienes permiso para registrar asistencia para uno o más de los atletas seleccionados.',
      );
    }

    // 2. Crear las entidades de dominio `Asistencia` para cada atleta.
    const fechaAsistencia = new Date(dto.fecha);
    const nuevasAsistencias: Asistencia[] = dto.atletaIds.map((atletaId) =>
      Asistencia.crear({
        atletaId: atletaId,
        fecha: fechaAsistencia,
        registradoPorId: entrenadorId,
      }),
    );

    // 3. Persistir todas las nuevas entidades en una sola operación transaccional.
    await this.asistenciaRepositorio.guardarMultiples(nuevasAsistencias);

    // 4. Devolver una respuesta de éxito.
    return {
      mensaje: `Se ha registrado la asistencia para ${nuevasAsistencias.length} atleta(s) en la fecha ${dto.fecha}.`,
      asistenciasRegistradas: nuevasAsistencias.length,
    };
  }
}
