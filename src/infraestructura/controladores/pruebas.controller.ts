import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../guardias/jwt-auth.guard';
import { RegistrarPruebasDto } from '../dtos/registrar-pruebas.dto';
import { RegistrarPruebasService } from '../../aplicacion/servicios/registrar-pruebas.service';
import { ConsultarHistorialPruebasService } from '../../aplicacion/servicios/consultar-historial-pruebas.service';

interface RequestConUsuario extends Request {
  user: {
    userId: string;
    email: string;
    rol: string;
  };
}

@Controller('tests')
@UseGuards(JwtAuthGuard)
export class PruebasController {
  constructor(
    @Inject(RegistrarPruebasService)
    private readonly registrarPruebasService: RegistrarPruebasService,
    @Inject(ConsultarHistorialPruebasService)
    private readonly consultarHistorialPruebasService: ConsultarHistorialPruebasService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async registrarPruebas(
    @Req() req: RequestConUsuario,
    @Body() registrarPruebasDto: RegistrarPruebasDto,
  ) {
    const { userId: solicitanteId, rol } = req.user;

    if (rol !== 'Entrenador') {
      throw new ForbiddenException(
        'No tienes los permisos necesarios para registrar pruebas.',
      );
    }

    return this.registrarPruebasService.ejecutar(
      registrarPruebasDto,
      solicitanteId,
    );
  }

  /**
   * Endpoint protegido para obtener el historial de resultados de pruebas de un atleta.
   * Accesible por el propio atleta o por un entrenador.
   * GET /tests/athlete/:atletaId
   */
  @Get('athlete/:atletaId')
  @HttpCode(HttpStatus.OK)
  async obtenerHistorialDePruebasDeAtleta(
    @Req() req: RequestConUsuario,
    @Param('atletaId', ParseUUIDPipe) atletaId: string,
  ) {
    try {
      const { userId: solicitanteId, rol: rolSolicitante } = req.user;

      // La lógica de negocio y la autorización fina se delegan al servicio.
      return await this.consultarHistorialPruebasService.ejecutar(
        solicitanteId,
        rolSolicitante,
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
          : 'Ocurrió un error inesperado al consultar el historial de pruebas.';
      throw new HttpException({ statusCode: status, message }, status);
    }
  }
}
