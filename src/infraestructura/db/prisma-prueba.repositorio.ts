import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  TestResult as PrismaTestResult,
  StandardizedTest,
} from '@prisma/client';

import { IPruebaRepositorio } from '../../dominio/repositorios/prueba.repositorio';
import { ResultadoDePrueba } from '../../dominio/entidades/resultado-de-prueba.entity';

// --- NUEVO TIPO: Definimos una estructura para devolver la entidad y los datos enriquecidos ---
export type ResultadoDePruebaEnriquecido = {
  entidad: ResultadoDePrueba;
  nombrePrueba: string;
  unidadPrueba: string;
};

@Injectable()
export class PrismaPruebaRepositorio implements IPruebaRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  public async guardarMultiples(
    resultados: ResultadoDePrueba[],
  ): Promise<void> {
    const datosParaCrear = resultados.map((resultado) => ({
      id: resultado.id,
      athleteId: resultado.atletaId,
      testId: resultado.testId,
      testDate: resultado.testDate,
      resultValue: resultado.resultValue,
      normalizedScore: resultado.normalizedScore,
    }));

    await this.prisma.testResult.createMany({
      data: datosParaCrear,
      skipDuplicates: true,
    });
  }

  // --- MÉTODO ACTUALIZADO: Ahora devuelve el tipo enriquecido ---
  public async encontrarPorAtletaId(
    atletaId: string,
  ): Promise<ResultadoDePruebaEnriquecido[]> {
    const resultadosDb = await this.prisma.testResult.findMany({
      where: { athleteId: atletaId },
      include: { test: true },
      orderBy: { testDate: 'desc' },
    });

    return resultadosDb.map((resultadoDb) => this.mapearADominio(resultadoDb));
  }

  // --- MÉTODO ACTUALIZADO: Ahora devuelve el tipo enriquecido ---
  private mapearADominio(
    persistencia: PrismaTestResult & { test: StandardizedTest },
  ): ResultadoDePruebaEnriquecido {
    const entidad = ResultadoDePrueba.desdePersistencia({
      id: persistencia.id,
      atletaId: persistencia.athleteId,
      testId: persistencia.testId,
      testDate: persistencia.testDate,
      resultValue: persistencia.resultValue,
      normalizedScore: persistencia.normalizedScore ?? undefined,
    });

    return {
      entidad: entidad,
      nombrePrueba: persistencia.test.name,
      unidadPrueba: persistencia.test.metricUnit,
    };
  }
}
