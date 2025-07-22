import {
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RegistrarSesionDto } from '../../infraestructura/dtos/registrar-sesion.dto';
import { ISesionRepositorio } from '../../dominio/repositorios/sesion.repositorio';
import { SesionEntrenamiento } from '../../dominio/entidades/sesion-entrenamiento.entity';

@Injectable()
export class RegistrarSesionService {
  constructor(
    @Inject('ISesionRepositorio')
    private readonly sesionRepositorio: ISesionRepositorio,
  ) {}

  async ejecutar(dto: RegistrarSesionDto): Promise<{ id: string }> {
    try {
      const sesion = SesionEntrenamiento.iniciar({
        atletaId: dto.atletaId,
        startTime: new Date(dto.startTime),
        routineAssignmentId: dto.routineAssignmentId,
      });

      sesion.finalizar({
        endTime: new Date(dto.endTime),
        rpeScore: dto.rpeScore,
        metricas: dto.metricas,
      });

      const sesionGuardada = await this.sesionRepositorio.guardar(sesion);

      return { id: sesionGuardada.id };
    } catch (error) {
      // Aseguramos que el mensaje del error sea un string antes de pasarlo.
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new UnprocessableEntityException(errorMessage);
    }
  }
}
