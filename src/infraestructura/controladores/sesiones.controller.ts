import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  HttpException,
  HttpStatus,
  Inject,
  UseGuards,
  Get,
  Req,
  HttpCode,
  Param,
  ParseUUIDPipe,
  ForbiddenException,
  forwardRef,
} from '@nestjs/common';
import { Request } from 'express';
import { RegistrarSesionDto } from '../dtos/registrar-sesion.dto';
import { RegistrarSesionEntrenamientoDto } from '../dtos/registrar-sesion-entrenamiento.dto';
import { RegistrarSesionService } from '../../aplicacion/servicios/registrar-sesion.service';
import { RegistrarSesionEntrenamientoService } from '../../aplicacion/servicios/registrar-sesion-entrenamiento.service';
import { ConsultarHistorialSesionesService } from '../../aplicacion/servicios/consultar-historial-sesiones.service';
import { ConsultarHistorialAtletaService } from '../../aplicacion/servicios/consultar-historial-atleta.service';
import { JwtAuthGuard } from '../guardias/jwt-auth.guard';

interface RequestConUsuario extends Request {
  user: {
    userId: string;
    email: string;
    rol: string;
  };
}

@Controller('sessions')
export class SesionesController {
  constructor(
    @Inject(RegistrarSesionService)
    private readonly registrarSesionService: RegistrarSesionService,

    @Inject(RegistrarSesionEntrenamientoService)
    private readonly registrarSesionEntrenamientoService: RegistrarSesionEntrenamientoService,

    @Inject(forwardRef(() => ConsultarHistorialSesionesService))
    private readonly consultarHistorialSesionesService: ConsultarHistorialSesionesService,
    @Inject(ConsultarHistorialAtletaService)
    private readonly consultarHistorialAtletaService: ConsultarHistorialAtletaService,
  ) {}

  /**
   * Endpoint de health check para el servicio de rendimiento.
   * GET /sessions (sin auth guard)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  healthCheck() {
    return {
      statusCode: HttpStatus.OK,
      message: 'Servicio de rendimiento disponible',
      service: 'ms-rendimiento',
      version: '1.3.0',
      endpoints: {
        createSession: 'POST /sessions',
        myHistory: 'GET /sessions/me',
        athleteHistory: 'GET /sessions/athlete/:id',
      },
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async registrarSesion(@Body() registrarSesionDto: RegistrarSesionDto) {
    try {
      const resultado =
        await this.registrarSesionService.ejecutar(registrarSesionDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Sesión de entrenamiento registrada con éxito.',
        data: resultado,
      };
    } catch (error) {
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado al registrar la sesión.';
      throw new HttpException({ statusCode: status, message }, status);
    }
  }

  /**
   * Endpoint específico para registrar sesiones de entrenamiento con estructura detallada
   * POST /sessions/training
   */
  @Post('training')
  @UseGuards(JwtAuthGuard)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async registrarSesionEntrenamiento(
    @Body() dto: RegistrarSesionEntrenamientoDto,
    @Req() req: RequestConUsuario,
  ) {
    try {
      const atletaId = req.user.userId;
      
      // Solo los atletas pueden registrar sus propias sesiones de entrenamiento
      if (req.user.rol !== 'Atleta') {
        throw new ForbiddenException(
          'Solo los atletas pueden registrar sesiones de entrenamiento.',
        );
      }

      const resultado = await this.registrarSesionEntrenamientoService.ejecutar(
        dto,
        atletaId,
      );
      
      return {
        statusCode: HttpStatus.CREATED,
        ...resultado,
      };
    } catch (error) {
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado al registrar la sesión de entrenamiento.';
      throw new HttpException({ statusCode: status, message }, status);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async obtenerMiHistorialDeSesiones(@Req() req: RequestConUsuario) {
    try {
      const atletaId = req.user.userId;
      return await this.consultarHistorialSesionesService.ejecutar(atletaId);
    } catch (error) {
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado al consultar el historial.';
      throw new HttpException({ statusCode: status, message }, status);
    }
  }

  @Get('athlete/:atletaId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async obtenerHistorialDeAtleta(
    @Req() req: RequestConUsuario,
    @Param('atletaId', ParseUUIDPipe) atletaId: string,
  ) {
    try {
      const { userId: solicitanteId, rol } = req.user;

      if (rol !== 'Entrenador') {
        throw new ForbiddenException(
          'No tienes los permisos necesarios para realizar esta acción.',
        );
      }

      return await this.consultarHistorialAtletaService.ejecutar(
        solicitanteId,
        atletaId,
      );
    } catch (error) {
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado al consultar el historial del atleta.';
      throw new HttpException({ statusCode: status, message }, status);
    }
  }
}
