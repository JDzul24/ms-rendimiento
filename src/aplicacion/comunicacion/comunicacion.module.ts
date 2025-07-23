import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { IdentidadService } from '../servicios/identidad.service';
import { PlanificacionService } from '../servicios/planificacion.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [IdentidadService, PlanificacionService],
  exports: [IdentidadService, PlanificacionService],
})
export class ComunicacionModule {}
