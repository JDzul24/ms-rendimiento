import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { RegistrarSesionDto } from '../dtos/registrar-sesion.dto';
import { RegistrarSesionService } from '../../aplicacion/servicios/registrar-sesion.service';

@Controller('sessions')
export class SesionesController {
  constructor(
    // El tipo se infiere correctamente por el sistema de inyección de NestJS
    @Inject(RegistrarSesionService)
    private readonly registrarSesionService: RegistrarSesionService,
  ) {}

  @Post()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
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
      // --- CORRECCIÓN DE ESLINT ---
      // Verificamos si el error es una instancia de HttpException para usar su estado,
      // de lo contrario, asumimos un error interno del servidor.
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
}
