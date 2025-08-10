import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcryptjs';
import { Model } from 'mongoose';
import { AppException, ErrorCode } from '../../app.exception';
import { User } from '../user/user.schema';
import { LoginResDto } from './dtos/login-res.dto';

@Injectable()
export class AuthLoginService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async execute(email: string, password: string): Promise<LoginResDto> {
    const user = await this.userModel.findOne({ email }).lean();

    if (!user || !(await compare(password, user.password))) {
      throw new AppException(ErrorCode.INVALID_CREDENTIALS, 'Invalid credentials');
    }

    const payload = {
      sub: user._id.toString(),
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
