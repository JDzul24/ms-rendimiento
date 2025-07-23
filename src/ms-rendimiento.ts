import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

// --- Módulo de Comunicación ---
import { ComunicacionModule } from './aplicacion/comunicacion/comunicacion.module';

// --- Componentes ---
import { SesionesController } from './infraestructura/controladores/sesiones.controller';
import { PruebasController } from './infraestructura/controladores/pruebas.controller';
import { EventosCombateController } from './infraestructura/controladores/eventos-combate.controller';
import { AsistenciaController } from './infraestructura/controladores/asistencia.controller';
import { RegistrarSesionService } from './aplicacion/servicios/registrar-sesion.service';
import { ConsultarHistorialSesionesService } from './aplicacion/servicios/consultar-historial-sesiones.service';
import { ConsultarHistorialAtletaService } from './aplicacion/servicios/consultar-historial-atleta.service';
import { RegistrarPruebasService } from './aplicacion/servicios/registrar-pruebas.service';
import { ConsultarHistorialPruebasService } from './aplicacion/servicios/consultar-historial-pruebas.service';
import { RegistrarEventoCombateService } from './aplicacion/servicios/registrar-evento-combate.service';
import { ConsultarHistorialCombatesService } from './aplicacion/servicios/consultar-historial-combates.service';
import { RegistrarAsistenciaService } from './aplicacion/servicios/registrar-asistencia.service';
import { JwtAuthGuard } from './infraestructura/guardias/jwt-auth.guard';
import { JwtStrategy } from './infraestructura/estrategias/jwt.strategy';
import { PrismaService } from './infraestructura/db/prisma.service';
import { PrismaSesionRepositorio } from './infraestructura/db/prisma-sesion.repositorio';
import { PrismaPruebaRepositorio } from './infraestructura/db/prisma-prueba.repositorio';
import { PrismaEventoCombateRepositorio } from './infraestructura/db/prisma-evento-combate.repositorio';
import { PrismaAsistenciaRepositorio } from './infraestructura/db/prisma-asistencia.repositorio';

@Module({
  imports: [
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
    // --- CORRECCIÓN DEFINITIVA ---
    ComunicacionModule, // Se importa el módulo que encapsula HttpModule y los servicios cliente
  ],
  controllers: [
    SesionesController,
    PruebasController,
    EventosCombateController,
    AsistenciaController,
  ],
  providers: [
    // Servicios de Aplicación (los servicios cliente ahora vienen del ComunicacionModule)
    RegistrarSesionService,
    ConsultarHistorialSesionesService,
    ConsultarHistorialAtletaService,
    RegistrarPruebasService,
    ConsultarHistorialPruebasService,
    RegistrarEventoCombateService,
    ConsultarHistorialCombatesService,
    RegistrarAsistenciaService,

    // Guardias y Estrategias
    JwtAuthGuard,
    JwtStrategy,

    // Infraestructura de Base de Datos
    PrismaService,
    { provide: 'ISesionRepositorio', useClass: PrismaSesionRepositorio },
    { provide: 'IPruebaRepositorio', useClass: PrismaPruebaRepositorio },
    {
      provide: 'IEventoCombateRepositorio',
      useClass: PrismaEventoCombateRepositorio,
    },
    {
      provide: 'IAsistenciaRepositorio',
      useClass: PrismaAsistenciaRepositorio,
    },
  ],
})
export class MsRendimientoModule {}
