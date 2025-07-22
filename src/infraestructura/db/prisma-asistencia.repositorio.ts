import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IAsistenciaRepositorio } from '../../dominio/repositorios/asistencia.repositorio';
import { Asistencia } from '../../dominio/entidades/asistencia.entity';

@Injectable()
export class PrismaAsistenciaRepositorio implements IAsistenciaRepositorio {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Implementación del método para guardar múltiples registros de asistencia
   * en una sola transacción a la base de datos.
   *
   * @param asistencias Un arreglo de entidades de dominio `Asistencia`.
   */
  public async guardarMultiples(asistencias: Asistencia[]): Promise<void> {
    // 1. Mapeamos el arreglo de entidades de dominio al formato de datos
    //    que el método `createMany` de Prisma espera.
    const datosParaCrear = asistencias.map((asistencia) => ({
      id: asistencia.id,
      athleteId: asistencia.atletaId,
      attendanceDate: asistencia.fecha,
      registeredById: asistencia.registradoPorId,
    }));

    // 2. Ejecutamos la operación `createMany` de Prisma.
    //    Esta operación es altamente eficiente para inserciones masivas.
    await this.prisma.attendance.createMany({
      data: datosParaCrear,
      skipDuplicates: true,
    });
  }
}
