import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MsRendimientoModule } from '../src/ms-rendimiento';

/**
 * Función de arranque (bootstrap) para el microservicio de Planificación.
 * Este es el punto de entrada de la aplicación.
 */
async function bootstrap() {
  const app = await NestFactory.create(MsRendimientoModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // La lógica de 'shutdown hooks' ahora es manejada por el ciclo de vida
  // del módulo a través de OnModuleDestroy en PrismaService,
  // por lo que no se necesita una llamada explícita aquí.

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

// Se utiliza 'void' para indicar explícitamente que no estamos esperando
// a que la promesa de bootstrap se resuelva, satisfaciendo la regla de ESLint.
void bootstrap();
