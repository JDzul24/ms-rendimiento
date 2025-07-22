import { Inject, Injectable } from '@nestjs/common';
import { IEventoCombateRepositorio } from '../../dominio/repositorios/evento-combate.repositorio';
import { HistorialCombateDto } from '../../infraestructura/dtos/historial-combate.dto';

@Injectable()
export class ConsultarHistorialCombatesService {
  constructor(
    @Inject('IEventoCombateRepositorio')
    private readonly eventoCombateRepositorio: IEventoCombateRepositorio,
  ) {}

  /**
   * Ejecuta la lógica para obtener el historial de eventos de combate de un atleta.
   * @param atletaId El ID del atleta autenticado (obtenido del token JWT).
   * @returns Un arreglo de DTOs con la información del historial de combates.
   */
  async ejecutar(atletaId: string): Promise<HistorialCombateDto[]> {
    const eventos =
      await this.eventoCombateRepositorio.encontrarPorAtletaId(atletaId);

    if (!eventos || eventos.length === 0) {
      // Si el atleta no tiene eventos registrados, se devuelve un arreglo vacío.
      return [];
    }

    // Mapeamos las entidades de dominio a DTOs de respuesta, exponiendo solo
    // la información necesaria y segura para el frontend.
    return eventos.map((evento) => {
      const historialDto: HistorialCombateDto = {
        id: evento.id,
        tipoEvento: evento.tipoEvento,
        fecha: evento.fecha,
        nombreOponente: evento.nombreOponente,
        resultado: evento.resultado,
      };
      return historialDto;
    });
  }
}
