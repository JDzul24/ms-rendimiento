import { Module } from '@nestjs/common';
import { EventosCombateController } from '../controladores/eventos-combate.controller';
import { RegistrarEventoCombateService } from '../../aplicacion/servicios/registrar-evento-combate.service';
import { ConsultarHistorialCombatesService } from '../../aplicacion/servicios/consultar-historial-combates.service';
import { PrismaEventoCombateRepositorio } from '../db/prisma-evento-combate.repositorio';
import { ComunicacionModule } from '../../aplicacion/comunicacion/comunicacion.module';

@Module({
  imports: [ComunicacionModule],
  controllers: [EventosCombateController],
  providers: [
    RegistrarEventoCombateService,
    ConsultarHistorialCombatesService,
    {
      provide: 'IEventoCombateRepositorio',
      useClass: PrismaEventoCombateRepositorio,
    },
  ],
  // --- AÑADIR EXPORTS ---
  exports: [RegistrarEventoCombateService, ConsultarHistorialCombatesService],
})
export class EventosCombateModule {}
