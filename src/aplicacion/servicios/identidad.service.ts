import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError, map } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

// --- DTOs para los contratos de la API de ms-identidad ---
interface PerfilUsuarioResponse {
  id: string;
  gimnasio: {
    id: string;
    nombre: string;
  } | null;
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

  /**
   * Verifica si un atleta específico es miembro del mismo gimnasio que un entrenador.
   *
   * @param entrenadorId El ID del entrenador que realiza la petición.
   * @param atletaId El ID del atleta que se quiere validar.
   * @returns `true` si el atleta es miembro del gimnasio del entrenador, `false` en caso contrario.
   */
  public async verificarRelacionEntrenadorAtleta(
    entrenadorId: string,
    atletaId: string,
  ): Promise<boolean> {
    // 1. Obtener el perfil del entrenador para saber su gimnasio.
    // Usamos el endpoint GET /users/me que ya implementamos, pero necesitaríamos uno
    // que acepte un ID para ser llamado por otro servicio. Asumimos GET /users/{id}
    const urlPerfil = `${this.identidadServiceUrl}/v1/users/${entrenadorId}`;

    const perfilEntrenador$ = this.httpService
      .get<PerfilUsuarioResponse>(urlPerfil)
      .pipe(
        map((response: AxiosResponse<PerfilUsuarioResponse>) => response.data),
        catchError((error: AxiosError) => {
          this.logger.error(
            `Fallo al obtener perfil del entrenador ${entrenadorId} desde ms-identidad`,
            error.response?.data,
          );
          throw new InternalServerErrorException(
            'Error de comunicación al verificar perfil de entrenador.',
          );
        }),
      );
    const perfilEntrenador = await firstValueFrom(perfilEntrenador$);

    const gymId = perfilEntrenador.gimnasio?.id;
    if (!gymId) {
      this.logger.warn(
        `El entrenador ${entrenadorId} no está asociado a ningún gimnasio.`,
      );
      return false; // Si el entrenador no tiene gimnasio, no puede tener alumnos.
    }

    // 2. Obtener la lista de miembros de ese gimnasio.
    const urlMiembros = `${this.identidadServiceUrl}/v1/gyms/${gymId}/members`;
    const miembros$ = this.httpService
      .get<MiembroGimnasioResponse[]>(urlMiembros)
      .pipe(
        map(
          (response: AxiosResponse<MiembroGimnasioResponse[]>) => response.data,
        ),
        catchError((error: AxiosError) => {
          this.logger.error(
            `Fallo al obtener miembros del gimnasio ${gymId} desde ms-identidad`,
            error.response?.data,
          );
          throw new InternalServerErrorException(
            'Error de comunicación al verificar miembros del gimnasio.',
          );
        }),
      );
    const miembros = await firstValueFrom(miembros$);

    // 3. Verificar si el atletaId está en la lista de miembros.
    const esMiembro = miembros.some((miembro) => miembro.id === atletaId);
    return esMiembro;
  }

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

    const gymId = perfilEntrenador.gimnasio?.id;
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

    const setDeMiembros = new Set(miembros.map((miembro) => miembro.id));
    return atletaIds.every((atletaId) => setDeMiembros.has(atletaId));
  }
}
