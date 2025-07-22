import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { IPruebaRepositorio } from '../../dominio/repositorios/prueba.repositorio';
import { RegistrarPruebasDto } from '../../infraestructura/dtos/registrar-pruebas.dto';
import { ResultadoDePrueba } from '../../dominio/entidades/resultado-de-prueba.entity';

@Injectable()
export class RegistrarPruebasService {
  constructor(
    @Inject('IPruebaRepositorio')
    private readonly pruebaRepositorio: IPruebaRepositorio,
    // Podríamos inyectar un servicio de comunicación con 'ms-identidad'
    // para validaciones más complejas.
  ) {}

  /**
   * Ejecuta la lógica para registrar un conjunto de resultados de pruebas para un atleta.
   *
   * @param dto - El DTO con los resultados de las pruebas.
   * @param solicitanteId - El ID del entrenador que realiza el registro (del token JWT).
   * @returns Un objeto de confirmación.
   */
  async ejecutar(
    dto: RegistrarPruebasDto,
    solicitanteId: string, // En el futuro, podríamos usar este ID para validar permisos.
  ): Promise<{ mensaje: string; resultadosRegistrados: number }> {
    // 1. Validación de negocio: Verificar que se proporcionaron resultados.
    if (!dto.resultados || dto.resultados.length === 0) {
      throw new UnprocessableEntityException(
        'Debe proporcionar al menos un resultado de prueba para registrar.',
      );
    }

    // 2. (Validación de autorización avanzada):
    // Aquí se haría una llamada al 'ms-identidad' para confirmar que 'solicitanteId'
    // es el entrenador del 'dto.atletaId'. Por ahora, asumimos que el permiso es válido.
    console.log(
      `[VALIDACIÓN] Entrenador ${solicitanteId} está registrando pruebas para el atleta ${dto.atletaId}.`,
    );

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
