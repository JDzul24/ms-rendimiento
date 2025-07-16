import { Module } from '@nestjs/common';
// Corrigiendo las rutas para ser explícitas y relativas.
import { SesionesController } from './src/infraestructura/controladores/sesiones.controller';
import { RegistrarSesionService } from './src/aplicacion/servicios/registrar-sesion.service';
import { PrismaService } from './src/infraestructura/db/prisma.service';
import { PrismaSesionRepositorio } from './src/infraestructura/db/prisma-sesion.repositorio';

@Module({
  imports: [],
  controllers: [SesionesController],
  providers: [
    // Se declaran todos los proveedores que el módulo utilizará.
    PrismaService,
    RegistrarSesionService,
    {
      provide: 'ISesionRepositorio', // Token de inyección para la interfaz
      useClass: PrismaSesionRepositorio, // Clase concreta que se inyectará
    },
  ],
})
export class MsRendimientoModule {}
