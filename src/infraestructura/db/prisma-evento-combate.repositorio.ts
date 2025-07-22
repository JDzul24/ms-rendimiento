import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CombatEvent as PrismaEventoCombate } from '@prisma/client';

import { IEventoCombateRepositorio } from '../../dominio/repositorios/evento-combate.repositorio';
import {
  EventoCombate,
  ResultadoCombateEnum,
} from '../../dominio/entidades/evento-combate.entity';

@Injectable()
export class PrismaEventoCombateRepositorio
  implements IEventoCombateRepositorio
{
  constructor(private readonly prisma: PrismaService) {}

  public async guardar(evento: EventoCombate): Promise<EventoCombate> {
    const eventoGuardadoDb = await this.prisma.combatEvent.create({
      data: {
        id: evento.id,
        athleteId: evento.atletaId,
        eventType: evento.tipoEvento,
        eventDate: evento.fecha,
        opponentName: evento.nombreOponente,
        result: evento.resultado,
      },
    });

    return this.mapearADominio(eventoGuardadoDb);
  }

  /**
   * Implementación del método para encontrar todos los eventos de combate de un atleta.
   */
  public async encontrarPorAtletaId(
    atletaId: string,
  ): Promise<EventoCombate[]> {
    const eventosDb = await this.prisma.combatEvent.findMany({
      where: {
        athleteId: atletaId,
      },
      orderBy: {
        eventDate: 'desc', // Ordenar por fecha, los más recientes primero
      },
    });

    return eventosDb.map((eventoDb) => this.mapearADominio(eventoDb));
  }

  /**
   * Mapea un objeto de la base de datos (Prisma) a una entidad de dominio.
   */
  private mapearADominio(persistencia: PrismaEventoCombate): EventoCombate {
    return EventoCombate.desdePersistencia({
      id: persistencia.id,
      atletaId: persistencia.athleteId,
      tipoEvento: persistencia.eventType,
      fecha: persistencia.eventDate,
      nombreOponente: persistencia.opponentName ?? undefined,
      resultado: persistencia.result
        ? (persistencia.result as ResultadoCombateEnum)
        : undefined,
    });
  }
}
