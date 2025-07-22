import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError, map } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

// DTO que representa la respuesta esperada del endpoint de rutinas del ms-planificacion
interface RutinaResponse {
  id: string;
  nombre: string;
}

@Injectable()
export class PlanificacionService {
  private readonly logger = new Logger(PlanificacionService.name);
  private readonly planificacionServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const url = this.configService.get<string>('PLANIFICACION_SERVICE_URL');
    if (!url) {
      this.logger.error(
        'La variable de entorno PLANIFICACION_SERVICE_URL no está definida.',
      );
      throw new InternalServerErrorException(
        'Configuración de servicio incompleta.',
      );
    }
    this.planificacionServiceUrl = url;
  }

  /**
   * Obtiene los nombres de un conjunto de rutinas a partir de sus IDs.
   *
   * @param rutinaIds Un arreglo de UUIDs de las rutinas a consultar.
   * @returns Un Map donde la clave es el ID de la rutina y el valor es su nombre.
   */
  public async obtenerNombresDeRutinas(
    rutinaIds: string[],
  ): Promise<Map<string, string>> {
    // Si no hay IDs que buscar, devolver un mapa vacío para evitar una llamada innecesaria.
    if (rutinaIds.length === 0) {
      return new Map();
    }

    // Construimos la URL con los IDs como query parameters para una consulta múltiple.
    // ej: /v1/planning/routines?ids=id1,id2,id3
    const url = `${this.planificacionServiceUrl}/v1/planning/routines?ids=${rutinaIds.join(',')}`;

    const rutinas$ = this.httpService.get<RutinaResponse[]>(url).pipe(
      map((response: AxiosResponse<RutinaResponse[]>) => response.data),
      catchError((error: AxiosError) => {
        this.logger.error(
          `Fallo al obtener nombres de rutinas. IDs: [${rutinaIds.join(', ')}]`,
          error.response?.data,
        );
        // Devolvemos un arreglo vacío en caso de error para no romper el flujo principal.
        return [];
      }),
    );

    const rutinas = await firstValueFrom(rutinas$);

    // Convertimos el arreglo de respuesta en un mapa para búsquedas O(1).
    const mapaDeNombres = new Map<string, string>();
    for (const rutina of rutinas) {
      mapaDeNombres.set(rutina.id, rutina.nombre);
    }

    return mapaDeNombres;
  }
}
