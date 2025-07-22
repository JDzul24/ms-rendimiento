import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Una guardia que protege las rutas activando la estrategia 'jwt' de Passport.
 * Rechazará automáticamente (con un error 401 Unauthorized) cualquier petición
 * que no contenga un Access Token válido y no expirado en la cabecera
 * 'Authorization: Bearer <token>'.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
