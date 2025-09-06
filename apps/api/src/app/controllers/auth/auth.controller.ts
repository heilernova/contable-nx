import { Body, Controller, HttpCode, HttpStatus, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../models/users/users.service';
import { CredentialsDto, RefreshDto } from './dto';
import { AuthGuard, GetSession, Session } from '../../auth';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly _usersService: UsersService,
    private readonly _jwtService: JwtService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  public async login(@Body() credentialsDto: CredentialsDto) {
    const user = await this._usersService.get(credentialsDto.username);
    if (!user) {
      return { message: 'Usuario no encontrado' };
    }
    const isValid = await user.verifyPassword(credentialsDto.password);
    if (!isValid) {
      return { message: 'Contraseña inválida' };
    }

    const session = new Session({ 
      username: user.username,
      sub: user.id,
      role: user.role,
      permissions: user.permissions
    });


    const accessToken = this._jwtService.sign(session.toJSON());
    const secret = process.env.JWT_SECRET + user.jwtSecretKey;
    const refreshToken = this._jwtService.sign({ sub: user.id, type: 'refresh' }, { expiresIn: '30d', secret: secret });

    return { 
      message: 'Sesión iniciada',
      data: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      }
    };
  }

  @UseGuards(AuthGuard)
  @Post('verify')
  public async verify(@GetSession() session: Session) {
    const user = await this._usersService.get(session.sub); // Verifica que el usuario aún exista
    if (!user) {
      throw new UnauthorizedException({ message: 'Usuario no encontrado' });
    }

    return { 
      message: 'Verificación exitosa',
      data: {
        name: user.name,
        lastName: user.lastName,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
      }
    };
  }

  @Post('refresh')
  public async refresh(@Body() body: RefreshDto) {

    const decoded: { sub: string } = this._jwtService.decode(body.refreshToken);
    if (!decoded || !decoded.sub) {
      throw new UnauthorizedException({ message: 'Token inválido' });
    }
    
    const user = await this._usersService.get(decoded.sub);
    
    if (!user) {
      throw new UnauthorizedException({ message: 'Token inválido' });
    }

    const secret = process.env.JWT_SECRET + user.jwtSecretKey;
    try {
      
      await this._jwtService.verifyAsync(body.refreshToken, { secret: secret });
  
      const session = new Session({ 
        username: user.username,
        sub: user.id,
        role: user.role,
        permissions: user.permissions
      });
  
      const accessToken = this._jwtService.sign(session.toJSON());
      const refreshToken = this._jwtService.sign({ sub: user.id, type: 'refresh' }, { expiresIn: '30d' });
  
      return { 
        message: 'Token refrescado',
        data: {
          accessToken: accessToken,
          refreshToken: refreshToken,
        }
      };
    } catch {
      throw new UnauthorizedException({ message: 'Refresh Token inválido' });
    }
  }
}
