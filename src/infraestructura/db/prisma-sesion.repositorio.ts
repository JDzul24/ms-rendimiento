import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TrainingSession, PerformanceMetric } from '@prisma/client';

import { ISesionRepositorio } from '../../dominio/repositorios/sesion.repositorio';
import { SesionEntrenamiento } from '../../dominio/entidades/sesion-entrenamiento.entity';
import { MetricaRendimiento } from '../../dominio/entidades/metrica-rendimiento.value-object';

@Injectable()
export class PrismaSesionRepositorio implements ISesionRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  public async guardar(
    sesion: SesionEntrenamiento,
  ): Promise<SesionEntrenamiento> {
    const sesionGuardada = await this.prisma.trainingSession.create({
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
        metrics: true,
      },
    });

    return this.mapearADominio(sesionGuardada);
  }

  /**
   * Implementación del método para encontrar todas las sesiones de un atleta.
   */
  public async encontrarPorAtletaId(
    atletaId: string,
  ): Promise<SesionEntrenamiento[]> {
    const sesionesDb = await this.prisma.trainingSession.findMany({
      where: {
        athleteId: atletaId,
      },
      orderBy: {
        startTime: 'desc', // Ordenar por fecha de inicio, las más recientes primero
      },
      include: {
        metrics: true, // Incluir métricas por si se necesita en el futuro
      },
    });

    return sesionesDb.map((sesionDb) => this.mapearADominio(sesionDb));
  }

  /**
   * Mapea un objeto de la base de datos (Prisma) a una entidad de dominio.
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
