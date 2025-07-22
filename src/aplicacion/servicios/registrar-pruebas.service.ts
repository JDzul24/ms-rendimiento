import {
  Inject,
  Injectable,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { IPruebaRepositorio } from '../../dominio/repositorios/prueba.repositorio';
import { RegistrarPruebasDto } from '../../infraestructura/dtos/registrar-pruebas.dto';
import { ResultadoDePrueba } from '../../dominio/entidades/resultado-de-prueba.entity';
import { IdentidadService } from './identidad.service'; // Se importa el servicio de comunicación

@Injectable()
export class RegistrarPruebasService {
  constructor(
    @Inject('IPruebaRepositorio')
    private readonly pruebaRepositorio: IPruebaRepositorio,
    // Se inyecta el servicio cliente para la validación de autorización
    private readonly identidadService: IdentidadService,
  ) {}

  /**
   * Ejecuta la lógica completa para registrar un conjunto de resultados de pruebas para un atleta.
   *
   * @param dto - El DTO con los resultados de las pruebas.
   * @param solicitanteId - El ID del entrenador que realiza el registro (del token JWT).
   * @returns Un objeto de confirmación.
   * @throws ForbiddenException si el entrenador no tiene permiso sobre el atleta.
   */
  async ejecutar(
    dto: RegistrarPruebasDto,
    solicitanteId: string,
  ): Promise<{ mensaje: string; resultadosRegistrados: number }> {
    // 1. --- Lógica de Autorización de Negocio (Implementación Completa) ---
    // Se delega la validación de la relación entrenador-atleta al servicio de comunicación.
    const tienePermiso =
      await this.identidadService.verificarRelacionEntrenadorAtleta(
        solicitanteId,
        dto.atletaId,
      );

    if (!tienePermiso) {
      throw new ForbiddenException(
        'No tienes permiso para registrar pruebas para este atleta.',
      );
    }

    // 2. Validación de negocio: Verificar que se proporcionaron resultados.
    if (!dto.resultados || dto.resultados.length === 0) {
      throw new UnprocessableEntityException(
        'Debe proporcionar al menos un resultado de prueba para registrar.',
      );
    }

    // 3. Crear las entidades de dominio `ResultadoDePrueba` a partir del DTO.
    const nuevosResultados: ResultadoDePrueba[] = dto.resultados.map(
      (resultadoDto) =>
        ResultadoDePrueba.crear({
          atletaId: dto.atletaId,
          testId: resultadoDto.testId,
          valor: resultadoDto.valor,
          puntajeNormalizado: resultadoDto.puntajeNormalizado,
        }),
    );

    // 4. Persistir todas las nuevas entidades en una sola operación transaccional.
    await this.pruebaRepositorio.guardarMultiples(nuevosResultados);

    // 5. Devolver una respuesta de éxito.
    return {
      mensaje: `Se han registrado con éxito ${nuevosResultados.length} resultados de pruebas.`,
      resultadosRegistrados: nuevosResultados.length,
    };
  }
}
