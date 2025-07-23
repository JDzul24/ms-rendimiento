import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';

// --- Módulos de Funcionalidad ---
import { SesionesModule } from './infraestructura/sesiones/sesiones.module';
import { PruebasModule } from './infraestructura/pruebas/pruebas.module';
import { EventosCombateModule } from './infraestructura/eventos-combate/eventos-combate.module';
import { AsistenciaModule } from './infraestructura/asistencia/asistencia.module';

// --- Proveedores Globales ---
import { PrismaService } from './infraestructura/db/prisma.service';
import { JwtAuthGuard } from './infraestructura/guardias/jwt-auth.guard';
import { JwtStrategy } from './infraestructura/estrategias/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    HttpModule, // Importante para el ComunicacionModule
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
    // --- Ensamblaje de Módulos ---
    SesionesModule,
    PruebasModule,
    EventosCombateModule,
    AsistenciaModule,
  ],
  providers: [
    // Solo los servicios que son verdaderamente globales y transversales
    PrismaService,
    JwtStrategy,
    JwtAuthGuard,
  ],
})
export class MsRendimientoModule {}
