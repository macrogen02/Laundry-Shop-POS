import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'laundry-pos-secret',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
