import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ISesionRepositorio } from '../../dominio/repositorios/sesion.repositorio';
import { SesionEntrenamiento } from '../../dominio/entidades/sesion-entrenamiento.entity';
import { MetricaRendimiento } from '../../dominio/entidades/metrica-rendimiento.value-object';
// Importamos los tipos generados por Prisma para usarlos explícitamente
import { TrainingSession, PerformanceMetric } from '@prisma/client';

@Injectable()
export class PrismaSesionRepositorio implements ISesionRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  async guardar(sesion: SesionEntrenamiento): Promise<SesionEntrenamiento> {
    // El tipo de 'sesionGuardadaEnDb' se infiere correctamente como
    // TrainingSession & { metrics: PerformanceMetric[] } gracias al 'include'.
    const sesionGuardadaEnDb = await this.prisma.trainingSession.create({
      data: {
        id: sesion.id,
        athleteId: sesion.atletaId,
        routineAssignmentId: sesion.routineAssignmentId,
        startTime: sesion.startTime,
        endTime: sesion.endTime,
        rpeScore: sesion.rpeScore,
        metrics: {
          create: sesion.metricas.map((metrica) => ({
            id: metrica.id,
            metricType: metrica.tipo,
            value: metrica.valor,
            unit: metrica.unidad,
            measuredAt: metrica.medidoEn,
          })),
        },
      },
      include: {
        metrics: true, // Incluimos las métricas en la respuesta de la BD
      },
    });

    // Mapeamos el objeto de la base de datos de vuelta a nuestra entidad de dominio
    return this.mapearADominio(sesionGuardadaEnDb);
  }

  /**
   * Método privado y tipado para mapear de la persistencia al dominio.
   * Mejora la legibilidad y centraliza la lógica de mapeo.
   * @param persistencia Objeto recuperado de la base de datos.
   * @returns Una instancia de la entidad de dominio SesionEntrenamiento.
   */
  private mapearADominio(
    persistencia: TrainingSession & { metrics: PerformanceMetric[] },
  ): SesionEntrenamiento {
    return SesionEntrenamiento.desdePersistencia({
      id: persistencia.id,
      atletaId: persistencia.athleteId,
      routineAssignmentId: persistencia.routineAssignmentId ?? undefined,
      startTime: persistencia.startTime,
      endTime: persistencia.endTime ?? undefined,
      rpeScore: persistencia.rpeScore ?? undefined,
      metricas: persistencia.metrics.map((m) =>
        MetricaRendimiento.desdePersistencia({
          id: m.id,
          tipo: m.metricType,
          valor: m.value,
          unidad: m.unit,
          medidoEn: m.measuredAt,
        }),
      ),
    });
  }
}
