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
import { RegistrarSesionService } from '../../aplicacion/servicios/registrar-sesion.service';
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
@UseGuards(JwtAuthGuard)
export class SesionesController {
  constructor(
    @Inject(RegistrarSesionService)
    private readonly registrarSesionService: RegistrarSesionService,

    @Inject(forwardRef(() => ConsultarHistorialSesionesService))
    private readonly consultarHistorialSesionesService: ConsultarHistorialSesionesService,
    @Inject(ConsultarHistorialAtletaService)
    private readonly consultarHistorialAtletaService: ConsultarHistorialAtletaService,
  ) {}

  @Post()
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

  @Get('me')
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
