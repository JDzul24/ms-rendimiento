import { Module } from '@nestjs/common';
import { SesionesController } from '../controladores/sesiones.controller';
import { RegistrarSesionService } from '../../aplicacion/servicios/registrar-sesion.service';
import { ConsultarHistorialSesionesService } from '../../aplicacion/servicios/consultar-historial-sesiones.service';
import { ConsultarHistorialAtletaService } from '../../aplicacion/servicios/consultar-historial-atleta.service';
import { PrismaSesionRepositorio } from '../db/prisma-sesion.repositorio';
import { ComunicacionModule } from '../../aplicacion/comunicacion/comunicacion.module';

@Module({
  imports: [
    ComunicacionModule, // Importa el módulo que provee IdentidadService y PlanificacionService
  ],
  controllers: [SesionesController],
  providers: [
    RegistrarSesionService,
    ConsultarHistorialSesionesService,
    ConsultarHistorialAtletaService,
    {
      provide: 'ISesionRepositorio',
      useClass: PrismaSesionRepositorio,
    },
  ],
})
export class SesionesModule {}
