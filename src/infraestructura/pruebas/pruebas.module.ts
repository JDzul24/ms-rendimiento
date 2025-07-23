import { Module } from '@nestjs/common';
import { PruebasController } from '../controladores/pruebas.controller';
import { RegistrarPruebasService } from '../../aplicacion/servicios/registrar-pruebas.service';
import { ConsultarHistorialPruebasService } from '../../aplicacion/servicios/consultar-historial-pruebas.service';
import { PrismaPruebaRepositorio } from '../db/prisma-prueba.repositorio';
import { ComunicacionModule } from '../../aplicacion/comunicacion/comunicacion.module';

@Module({
  imports: [ComunicacionModule],
  controllers: [PruebasController],
  providers: [
    RegistrarPruebasService,
    ConsultarHistorialPruebasService,
    {
      provide: 'IPruebaRepositorio',
      useClass: PrismaPruebaRepositorio,
    },
  ],
  // --- AÑADIR EXPORTS ---
  exports: [RegistrarPruebasService, ConsultarHistorialPruebasService],
})
export class PruebasModule {}
