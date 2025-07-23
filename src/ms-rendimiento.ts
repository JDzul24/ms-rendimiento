import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// --- Módulos de Funcionalidad ---
import { SesionesModule } from './infraestructura/sesiones/sesiones.module';
import { PruebasModule } from './infraestructura/pruebas/pruebas.module';
import { EventosCombateModule } from './infraestructura/eventos-combate/eventos-combate.module';
import { AsistenciaModule } from './infraestructura/asistencia/asistencia.module';

// --- Proveedores Globales ---
import { PrismaService } from './infraestructura/db/prisma.service';
import { JwtAuthGuard } from './infraestructura/guardias/jwt-auth.guard';
import { JwtStrategy } from './infraestructura/estrategias/jwt.strategy';
import { ComunicacionModule } from './aplicacion/comunicacion/comunicacion.module';

@Module({
  imports: [
    // Módulos de configuración base
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
        },
      }),
    }),

    // --- Módulos de Funcionalidad ---
    ComunicacionModule, // Importamos el módulo de comunicación para que esté disponible
    SesionesModule,
    PruebasModule,
    EventosCombateModule,
    AsistenciaModule,
  ],
  // Los controladores se declaran en sus respectivos módulos de funcionalidad,
  // por lo que este arreglo ahora está vacío.
  controllers: [],
  // Se proveen los servicios que son transversales a toda la aplicación.
  providers: [PrismaService, JwtStrategy, JwtAuthGuard],
})
export class MsRendimientoModule {}
