import { Module } from '@nestjs/common';
import { EventosCombateController } from '../controladores/eventos-combate.controller';
import { RegistrarEventoCombateService } from '../../aplicacion/servicios/registrar-evento-combate.service';
import { ConsultarHistorialCombatesService } from '../../aplicacion/servicios/consultar-historial-combates.service';
import { PrismaEventoCombateRepositorio } from '../db/prisma-evento-combate.repositorio';
import { ComunicacionModule } from '../../aplicacion/comunicacion/comunicacion.module';

@Module({
  // Se importa ComunicacionModule para que los servicios de este módulo
  // puedan inyectar el IdentidadService para las validaciones de autorización.
  imports: [ComunicacionModule],
  // Se declara el controlador específico de esta funcionalidad.
  controllers: [EventosCombateController],
  // Se declaran los proveedores específicos de esta funcionalidad.
  providers: [
    RegistrarEventoCombateService,
    ConsultarHistorialCombatesService,
    {
      provide: 'IEventoCombateRepositorio',
      useClass: PrismaEventoCombateRepositorio,
    },
  ],
})
export class EventosCombateModule {}
