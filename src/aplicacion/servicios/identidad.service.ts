import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError, map } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

interface PerfilUsuarioResponse {
  gymId: string | null;
}

interface MiembroGimnasioResponse {
  id: string;
  nombre: string;
  rol: string;
}

@Injectable()
export class IdentidadService {
  private readonly logger = new Logger(IdentidadService.name);
  private readonly identidadServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('IDENTIDAD_SERVICE_URL');
    if (!url) {
      this.logger.error(
        'La variable de entorno IDENTIDAD_SERVICE_URL no está definida.',
      );
      throw new InternalServerErrorException(
        'Configuración de servicio incompleta.',
      );
    }
    this.identidadServiceUrl = url;
  }

  public async verificarRelacionEntrenadorAtleta(
    entrenadorId: string,
    atletaId: string,
  ): Promise<boolean> {
    const urlPerfil = `${this.identidadServiceUrl}/v1/users/${entrenadorId}`;
    const perfilEntrenador$ = this.httpService
      .get<PerfilUsuarioResponse>(urlPerfil)
      .pipe(
        map((response: AxiosResponse<PerfilUsuarioResponse>) => response.data),
        catchError((error: AxiosError) => {
          this.logger.error(
            `Fallo al obtener perfil del entrenador ${entrenadorId}`,
            error.response?.data,
          );
          throw new InternalServerErrorException(
            'Error de comunicación con el servicio de identidad.',
          );
        }),
      );
    const perfilEntrenador = await firstValueFrom(perfilEntrenador$);

    const gymId = perfilEntrenador.gymId;
    if (!gymId) {
      this.logger.warn(
        `El entrenador ${entrenadorId} no pertenece a ningún gimnasio.`,
      );
      return false;
    }

    const urlMiembros = `${this.identidadServiceUrl}/v1/gyms/${gymId}/members`;
    const miembros$ = this.httpService
      .get<MiembroGimnasioResponse[]>(urlMiembros)
      .pipe(
        map(
          (response: AxiosResponse<MiembroGimnasioResponse[]>) => response.data,
        ),
        catchError((error: AxiosError) => {
          this.logger.error(
            `Fallo al obtener miembros del gimnasio ${gymId}`,
            error.response?.data,
          );
          throw new InternalServerErrorException(
            'Error de comunicación con el servicio de identidad.',
          );
        }),
      );
    const miembros = await firstValueFrom(miembros$);

    const esMiembro = miembros.some((miembro) => miembro.id === atletaId);
    return esMiembro;
  }

  /**
   * Verifica si una lista de atletas pertenece al mismo gimnasio que un entrenador.
   *
   * @param entrenadorId El ID del entrenador.
   * @param atletaIds Un arreglo de IDs de atletas a verificar.
   * @returns `true` si TODOS los atletas pertenecen al gimnasio del entrenador, `false` en caso contrario.
   */
  public async verificarPertenenciaDeAtletas(
    entrenadorId: string,
    atletaIds: string[],
  ): Promise<boolean> {
    const urlPerfil = `${this.identidadServiceUrl}/v1/users/${entrenadorId}`;
    const perfilEntrenador$ = this.httpService
      .get<PerfilUsuarioResponse>(urlPerfil)
      .pipe(
        map((response) => response.data),
        catchError((error: AxiosError) => {
          this.logger.error(
            `Fallo al obtener perfil del entrenador ${entrenadorId}`,
            error.response?.data,
          );
          throw new InternalServerErrorException(
            'Error de comunicación con el servicio de identidad.',
          );
        }),
      );
    const perfilEntrenador = await firstValueFrom(perfilEntrenador$);

    const gymId = perfilEntrenador.gymId;
    if (!gymId) {
      this.logger.warn(
        `El entrenador ${entrenadorId} no pertenece a ningún gimnasio.`,
      );
      return false;
    }

    const urlMiembros = `${this.identidadServiceUrl}/v1/gyms/${gymId}/members`;
    const miembros$ = this.httpService
      .get<MiembroGimnasioResponse[]>(urlMiembros)
      .pipe(
        map((response) => response.data),
        catchError((error: AxiosError) => {
          this.logger.error(
            `Fallo al obtener miembros del gimnasio ${gymId}`,
            error.response?.data,
          );
          throw new InternalServerErrorException(
            'Error de comunicación con el servicio de identidad.',
          );
        }),
      );
    const miembros = await firstValueFrom(miembros$);

    // Convertimos la lista de miembros en un Set para búsquedas ultra rápidas (O(1))
    const setDeMiembros = new Set(miembros.map((miembro) => miembro.id));

    // Usamos el método 'every' para asegurar que CADA atleta en la lista de entrada
    // exista en nuestro Set de miembros del gimnasio.
    return atletaIds.every((atletaId) => setDeMiembros.has(atletaId));
  }
}
