import { Module } from '@nestjs/common';
import { SesionesController } from '../controladores/sesiones.controller';
import { RegistrarSesionService } from '../../aplicacion/servicios/registrar-sesion.service';
import { ConsultarHistorialSesionesService } from '../../aplicacion/servicios/consultar-historial-sesiones.service';
import { ConsultarHistorialAtletaService } from '../../aplicacion/servicios/consultar-historial-atleta.service';
import { PrismaSesionRepositorio } from '../db/prisma-sesion.repositorio';
import { ComunicacionModule } from '../../aplicacion/comunicacion/comunicacion.module';
import { PlanificacionService } from '../../aplicacion/servicios/planificacion.service';
import { IdentidadService } from '../../aplicacion/servicios/identidad.service';

@Module({
  imports: [ComunicacionModule],
  controllers: [SesionesController],
  providers: [
    RegistrarSesionService,
    ConsultarHistorialSesionesService,
    ConsultarHistorialAtletaService,
    PlanificacionService, // Añadido para asegurar la visibilidad
    IdentidadService, // Añadido para asegurar la visibilidad
    {
      provide: 'ISesionRepositorio',
      useClass: PrismaSesionRepositorio,
    },
  ],
  exports: [
    RegistrarSesionService,
    ConsultarHistorialSesionesService,
    ConsultarHistorialAtletaService,
  ],
})
export class SesionesModule {}
