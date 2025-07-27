import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const userPoolId = configService.get<string>('COGNITO_USER_POOL_ID');
    const region = configService.get<string>('COGNITO_REGION');

    if (!userPoolId || !region) {
      throw new Error('Cognito User Pool ID and Region must be configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
      }),
    });
  }

  async validate(payload: any) {
    // La firma ya ha sido validada por jwks-rsa
    const rol = payload['custom:rol'] || 'Atleta';
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Token inválido: Faltan claims escenciales.');
    }
    return { userId: payload.sub, email: payload.email, rol: rol };
  }
}
