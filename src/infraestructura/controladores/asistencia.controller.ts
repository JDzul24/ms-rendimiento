import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../guardias/jwt-auth.guard';
import { RegistrarAsistenciaDto } from '../dtos/registrar-asistencia.dto';
import { RegistrarAsistenciaService } from '../../aplicacion/servicios/registrar-asistencia.service';

/**
 * Interfaz para extender el objeto Request de Express y añadir la propiedad 'user',
 * que es adjuntada por la estrategia de Passport después de validar un token JWT.
 */
interface RequestConUsuario extends Request {
  user: {
    userId: string;
    email: string;
    rol: string;
  };
}

@Controller('attendance') // Ruta base: /v1/performance/attendance
@UseGuards(JwtAuthGuard) // Protegemos todas las rutas de este controlador
export class AsistenciaController {
  constructor(
    @Inject(RegistrarAsistenciaService)
    private readonly registrarAsistenciaService: RegistrarAsistenciaService,
  ) {}

  /**
   * Endpoint protegido para que un entrenador registre la asistencia de sus atletas.
   * POST /attendance
   *
   * @param req - El objeto de la petición, enriquecido con los datos del usuario.
   * @param registrarAsistenciaDto - El DTO con la fecha y la lista de atletas.
   * @returns Un objeto de confirmación de la operación.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async registrarAsistencia(
    @Req() req: RequestConUsuario,
    @Body() registrarAsistenciaDto: RegistrarAsistenciaDto,
  ) {
    const { userId: entrenadorId, rol } = req.user;

    // 1. Lógica de Autorización a nivel de Rol.
    //    Aseguramos que solo los usuarios con el rol 'Entrenador' puedan registrar asistencia.
    if (rol !== 'Entrenador') {
      throw new ForbiddenException(
        'No tienes los permisos necesarios para registrar la asistencia.',
      );
    }

    // 2. Delegamos la ejecución y la lógica de negocio, incluyendo la validación
    //    de pertenencia de los atletas, al servicio de aplicación.
    return this.registrarAsistenciaService.ejecutar(
      registrarAsistenciaDto,
      entrenadorId,
    );
  }
}
