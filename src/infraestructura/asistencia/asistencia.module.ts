import { Module } from '@nestjs/common';
import { AsistenciaController } from '../controladores/asistencia.controller';
import { RegistrarAsistenciaService } from '../../aplicacion/servicios/registrar-asistencia.service';
import { PrismaAsistenciaRepositorio } from '../db/prisma-asistencia.repositorio';
import { ComunicacionModule } from '../../aplicacion/comunicacion/comunicacion.module';

@Module({
  // Se importa ComunicacionModule para que el RegistrarAsistenciaService
  // pueda inyectar el IdentidadService.
  imports: [ComunicacionModule],
  // Se declara el controlador específico de esta funcionalidad.
  controllers: [AsistenciaController],
  // Se declaran los proveedores específicos de esta funcionalidad.
  providers: [
    RegistrarAsistenciaService,
    {
      provide: 'IAsistenciaRepositorio',
      useClass: PrismaAsistenciaRepositorio,
    },
  ],
})
export class AsistenciaModule {}
