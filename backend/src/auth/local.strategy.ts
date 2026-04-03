
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const validateUserWithPasswordRes = await this.authService.verifyUserWithPassword(email, password);
    console.log("Validate User with Password Result: ", validateUserWithPasswordRes);

    if (!validateUserWithPasswordRes.success) {
      throw new UnauthorizedException(validateUserWithPasswordRes.data.message);
    }
    return validateUserWithPasswordRes.data.user;
  }
}
