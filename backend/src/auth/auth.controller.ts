import { Body, Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsString, MinLength } from 'class-validator';

class StaffLoginDto {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(4)
  password!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('login')
  login(@Body() body: StaffLoginDto) {
    return {
      accessToken: this.jwtService.sign({ sub: body.username, role: 'staff' }),
      user: { username: body.username, role: 'staff' },
    };
  }
}
