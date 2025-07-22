import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Define la estructura esperada del payload decodificado del JWT.
interface JwtPayload {
  sub: string; // ID del usuario
  email: string;
  rol: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error(
        'El secreto JWT no está definido. Asegúrate de que JWT_SECRET esté en tu archivo .env',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Método de validación que Passport invoca después de una verificación exitosa del token.
   * @param payload El payload decodificado y verificado del token.
   * @returns Un objeto simplificado que se adjuntará a `request.user`.
   */
  validate(payload: JwtPayload): {
    userId: string;
    email: string;
    rol: string;
  } {
    // Verificación adicional para asegurar que el payload contenga los campos requeridos.
    if (!payload.sub || !payload.email || !payload.rol) {
      throw new UnauthorizedException('Token inválido o malformado.');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      rol: payload.rol,
    };
  }
}
