import { Inject, Injectable, ForbiddenException } from '@nestjs/common';
import { IPruebaRepositorio } from '../../dominio/repositorios/prueba.repositorio';
import { HistorialPruebaDto } from '../../infraestructura/dtos/historial-prueba.dto';

@Injectable()
export class ConsultarHistorialPruebasService {
  constructor(
    @Inject('IPruebaRepositorio')
    private readonly pruebaRepositorio: IPruebaRepositorio,
  ) {}

  async ejecutar(
    solicitanteId: string,
    rolSolicitante: string,
    atletaId: string,
  ): Promise<HistorialPruebaDto[]> {
    if (rolSolicitante === 'Atleta' && solicitanteId !== atletaId) {
      throw new ForbiddenException(
        'No tienes permiso para ver el historial de otros atletas.',
      );
    }

    const resultados =
      await this.pruebaRepositorio.encontrarPorAtletaId(atletaId);

    if (!resultados || resultados.length === 0) {
      return [];
    }

    // --- CORRECCIÓN: Accedemos a las propiedades del objeto enriquecido de forma segura ---
    return resultados.map((resultado) => {
      const historialDto: HistorialPruebaDto = {
        idResultado: resultado.entidad.id,
        nombrePrueba: resultado.nombrePrueba,
        fecha: resultado.entidad.testDate,
        valor: resultado.entidad.resultValue,
        unidad: resultado.unidadPrueba,
        puntajeNormalizado: resultado.entidad.normalizedScore,
      };
      return historialDto;
    });
  }
}
