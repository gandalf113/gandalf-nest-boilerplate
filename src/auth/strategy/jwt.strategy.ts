import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  ExtractJwt,
} from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * JWTStrategy validates the token and protects routes
 */

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  'jwt',
) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  /**
   * Attach user object to the request
   * @param payload it is the decoded jwt
   */
  async validate(payload: ValidatePayloadType) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    delete user.hash;
    return user;
  }
}

type ValidatePayloadType = {
  sub: number;
  email: string;
};
