import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { IdentidadService } from '../servicios/identidad.service';
import { PlanificacionService } from '../servicios/planificacion.service';

@Module({
  imports: [
    // Se importa HttpModule para que esté disponible para los servicios de este módulo.
    HttpModule,
    // Se importa ConfigModule para que los servicios puedan acceder a las variables de entorno.
    ConfigModule,
  ],
  providers: [
    // Se declaran los servicios cliente como proveedores.
    IdentidadService,
    PlanificacionService,
  ],
  // Se exportan los servicios para que otros módulos que importen ComunicacionModule
  // puedan inyectarlos y utilizarlos.
  exports: [IdentidadService, PlanificacionService],
})
export class ComunicacionModule {}
