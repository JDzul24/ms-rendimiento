import { Inject, Injectable } from '@nestjs/common';
import { ISesionRepositorio } from '../../dominio/repositorios/sesion.repositorio';
import { SesionEntrenamiento } from '../../dominio/entidades/sesion-entrenamiento.entity';
import { MetricaRendimiento } from '../../dominio/entidades/metrica-rendimiento.value-object';
import { RegistrarSesionEntrenamientoDto } from '../../infraestructura/dtos/registrar-sesion-entrenamiento.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RegistrarSesionEntrenamientoService {
  constructor(
    @Inject('ISesionRepositorio')
    private readonly sesionRepositorio: ISesionRepositorio,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async ejecutar(
    dto: RegistrarSesionEntrenamientoDto,
    atletaId: string,
  ): Promise<{
    id: string;
    message: string;
    rachaActualizada?: number;
  }> {
    // Convertir fechas
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(dto.fechaFin);

    // Crear la sesión con los datos del entrenamiento
    const sesion = SesionEntrenamiento.iniciar({
      atletaId: atletaId,
      routineAssignmentId: dto.assignmentId,
      startTime: fechaInicio,
    });

    // Finalizar la sesión con los datos del entrenamiento
    sesion.finalizar({
      endTime: fechaFin,
      rpeScore: this.calcularRPE(dto), // Calcular RPE basado en rendimiento
      metricas: this.convertirSeccionesAMetricas(dto.secciones).map(m => ({
        tipo: m.tipo,
        valor: m.valor,
        unidad: m.unidad
      })),
    });

    // Guardar la sesión
    const sesionGuardada = await this.sesionRepositorio.guardar(sesion);

    // Actualizar la racha del atleta
    let rachaActualizada: number | undefined;
    try {
      rachaActualizada = await this.actualizarRachaAtleta(atletaId);
    } catch (error) {
      console.log('Error actualizando racha:', error.message);
      // No fallar si no se puede actualizar la racha
    }

    return {
      id: sesionGuardada.id,
      message: 'Sesión registrada exitosamente',
      rachaActualizada,
    };
  }

  private calcularRPE(dto: RegistrarSesionEntrenamientoDto): number {
    // Calcular RPE basado en el rendimiento vs objetivo
    const eficienciaGeneral = dto.duracionTotalSegundos / dto.tiempoObjetivoSegundos;
    
    // RPE básico entre 5-8 dependiendo de la eficiencia
    if (eficienciaGeneral <= 0.8) {
      return 5; // Muy eficiente, percepción de esfuerzo baja
    } else if (eficienciaGeneral <= 1.0) {
      return 6; // Eficiente
    } else if (eficienciaGeneral <= 1.2) {
      return 7; // Normal
    } else if (eficienciaGeneral <= 1.5) {
      return 8; // Esfuerzo alto
    } else {
      return 9; // Muy alto esfuerzo
    }
  }

  private convertirSeccionesAMetricas(secciones: any[]): MetricaRendimiento[] {
    const metricas: MetricaRendimiento[] = [];

    for (const seccion of secciones) {
      metricas.push(
        MetricaRendimiento.crear({
          tipo: `tiempo_${seccion.categoria}`,
          valor: seccion.tiempoUsadoSegundos.toString(),
          unidad: 'segundos',
        }),
        MetricaRendimiento.crear({
          tipo: `ejercicios_${seccion.categoria}`,
          valor: seccion.ejerciciosCompletados.toString(),
          unidad: 'ejercicios',
        }),
        MetricaRendimiento.crear({
          tipo: `eficiencia_${seccion.categoria}`,
          valor: (seccion.tiempoUsadoSegundos / seccion.tiempoObjetivoSegundos).toFixed(2),
          unidad: 'ratio',
        })
      );
    }

    // Agregar métricas generales
    metricas.push(MetricaRendimiento.crear({
      tipo: 'total_secciones',
      valor: secciones.length.toString(),
      unidad: 'secciones',
    }));

    return metricas;
  }

  private async actualizarRachaAtleta(atletaId: string): Promise<number> {
    try {
      const identityServiceUrl = this.configService.get<string>('IDENTITY_SERVICE_URL') || 'http://localhost:3000';
      
      // Llamar al endpoint de racha en ms-identidad
      const response = await firstValueFrom(
        this.httpService.get(`${identityServiceUrl}/racha/${atletaId}`)
      );

      if (response.data && response.data.racha_actual !== undefined) {
        return response.data.racha_actual;
      }

      return 0;
    } catch (error) {
      console.log('Error obteniendo racha del atleta:', error.message);
      throw error;
    }
  }
}