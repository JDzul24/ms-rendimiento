import { Module } from '@nestjs/common';
import { PruebasController } from '../controladores/pruebas.controller';
import { RegistrarPruebasService } from '../../aplicacion/servicios/registrar-pruebas.service';
import { ConsultarHistorialPruebasService } from '../../aplicacion/servicios/consultar-historial-pruebas.service';
import { PrismaPruebaRepositorio } from '../db/prisma-prueba.repositorio';
import { ComunicacionModule } from '../../aplicacion/comunicacion/comunicacion.module';

@Module({
  // Se importa ComunicacionModule para que los servicios de este módulo
  // puedan inyectar el IdentidadService para las validaciones.
  imports: [ComunicacionModule],
  // Se declara el controlador específico de esta funcionalidad.
  controllers: [PruebasController],
  // Se declaran los proveedores específicos de esta funcionalidad.
  providers: [
    RegistrarPruebasService,
    ConsultarHistorialPruebasService,
    {
      provide: 'IPruebaRepositorio',
      useClass: PrismaPruebaRepositorio,
    },
  ],
})
export class PruebasModule {}
