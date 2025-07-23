import { Module } from '@nestjs/common';
import { AsistenciaController } from '../controladores/asistencia.controller';
import { RegistrarAsistenciaService } from '../../aplicacion/servicios/registrar-asistencia.service';
import { PrismaAsistenciaRepositorio } from '../db/prisma-asistencia.repositorio';
import { ComunicacionModule } from '../../aplicacion/comunicacion/comunicacion.module';

@Module({
  imports: [ComunicacionModule],
  controllers: [AsistenciaController],
  providers: [
    RegistrarAsistenciaService,
    {
      provide: 'IAsistenciaRepositorio',
      useClass: PrismaAsistenciaRepositorio,
    },
  ],
  // --- AÑADIR EXPORTS ---
  exports: [RegistrarAsistenciaService],
})
export class AsistenciaModule {}
