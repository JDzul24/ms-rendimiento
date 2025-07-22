import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
  HttpException,
  Get, // Se añade Get
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../guardias/jwt-auth.guard';
import { RegistrarEventoCombateDto } from '../dtos/registrar-evento-combate.dto';
import { RegistrarEventoCombateService } from '../../aplicacion/servicios/registrar-evento-combate.service';
import { ConsultarHistorialCombatesService } from '../../aplicacion/servicios/consultar-historial-combates.service'; // Se añade el nuevo servicio

interface RequestConUsuario extends Request {
  user: {
    userId: string;
    email: string;
    rol: string;
  };
}

@Controller('combat-events')
@UseGuards(JwtAuthGuard)
export class EventosCombateController {
  constructor(
    @Inject(RegistrarEventoCombateService)
    private readonly registrarEventoCombateService: RegistrarEventoCombateService,
    // Se inyecta el nuevo servicio para consultar el historial
    @Inject(ConsultarHistorialCombatesService)
    private readonly consultarHistorialCombatesService: ConsultarHistorialCombatesService,
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
  async registrarEventoCombate(
    @Req() req: RequestConUsuario,
    @Body() registrarEventoCombateDto: RegistrarEventoCombateDto,
  ) {
    try {
      const { userId: solicitanteId, rol: rolSolicitante } = req.user;
      return await this.registrarEventoCombateService.ejecutar(
        registrarEventoCombateDto,
        solicitanteId,
        rolSolicitante,
      );
    } catch (error) {
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado al registrar el evento de combate.';
      throw new HttpException({ statusCode: status, message }, status);
    }
  }

  /**
   * Endpoint protegido para que un atleta obtenga su propio historial de combates.
   * GET /combat-events/me
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async obtenerMiHistorialDeCombates(@Req() req: RequestConUsuario) {
    try {
      // La guardia ya ha validado el token. Extraemos el ID del atleta.
      const atletaId = req.user.userId;

      // Delegamos la lógica al servicio de aplicación correspondiente.
      return await this.consultarHistorialCombatesService.ejecutar(atletaId);
    } catch (error) {
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado al consultar el historial de combates.';
      throw new HttpException({ statusCode: status, message }, status);
    }
  }
}
