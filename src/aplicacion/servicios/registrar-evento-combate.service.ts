import {
  Inject,
  Injectable,
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { IEventoCombateRepositorio } from '../../dominio/repositorios/evento-combate.repositorio';
import { RegistrarEventoCombateDto } from '../../infraestructura/dtos/registrar-evento-combate.dto';
import { EventoCombate } from '../../dominio/entidades/evento-combate.entity';
import { IdentidadService } from './identidad.service';

@Injectable()
export class RegistrarEventoCombateService {
  constructor(
    @Inject('IEventoCombateRepositorio')
    private readonly eventoCombateRepositorio: IEventoCombateRepositorio,
    private readonly identidadService: IdentidadService,
  ) {}

  public async ejecutar(
    dto: RegistrarEventoCombateDto,
    solicitanteId: string,
    rolSolicitante: string,
  ): Promise<{ id: string }> {
    if (rolSolicitante === 'Atleta') {
      if (solicitanteId !== dto.atletaId) {
        throw new ForbiddenException(
          'No tienes permiso para registrar eventos para otros atletas.',
        );
      }
    } else if (rolSolicitante === 'Entrenador') {
      const esSuAlumno =
        await this.identidadService.verificarRelacionEntrenadorAtleta(
          solicitanteId,
          dto.atletaId,
        );
      if (!esSuAlumno) {
        throw new ForbiddenException(
          'No tienes permiso para registrar eventos para este atleta.',
        );
      }
    } else {
      throw new ForbiddenException(
        'Tu rol no permite registrar eventos de combate.',
      );
    }

    try {
      const nuevoEvento = EventoCombate.crear({
        atletaId: dto.atletaId,
        tipoEvento: dto.tipoEvento,
        fecha: new Date(dto.fecha),
        nombreOponente: dto.nombreOponente,
        resultado: dto.resultado,
      });

      const eventoGuardado =
        await this.eventoCombateRepositorio.guardar(nuevoEvento);

      return { id: eventoGuardado.id };
    } catch (error) {
      // --- CORRECCIÓN DE TIPADO SEGURO ---
      const mensajeError =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error de validación desconocido.';
      throw new UnprocessableEntityException(mensajeError);
    }
  }
}
