import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { GetUser } from '../../decorators/get-user.decorator';
import { IdParamDto } from './dtos/id-param.dto';
import { UserReqDto } from './dtos/user-req.dto';
import { UserResDto } from './dtos/user-res.dto';
import { UserUpdateDto } from './dtos/user-update.dto';
import { UserRole } from './user.schema';
import { UserService } from './user.service';
import { CurrentUser } from './user.types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth('access-token')
  @ApiResponse({ status: HttpStatus.OK, type: UserResDto })
  @Get(':id')
  @Roles(UserRole.MANAGER, UserRole.EMPLOYEE)
  async getUser(
    @GetUser() currentUser: CurrentUser,
    @Param() params: IdParamDto,
  ): Promise<UserResDto> {
    return this.userService.getById(currentUser, params.id);
  }

  @ApiBearerAuth('access-token')
  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, type: UserResDto })
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.MANAGER)
  async createUser(
    @GetUser() currentUser: CurrentUser,
    @Body() userDto: UserReqDto,
  ): Promise<Partial<UserResDto>> {
    return this.userService.create(currentUser, userDto);
  }

  @ApiBearerAuth('access-token')
  @ApiResponse({ status: HttpStatus.OK, type: UserResDto })
  @Put(':id')
  @Roles(UserRole.MANAGER)
  async updateUser(
    @GetUser() currentUser: CurrentUser,
    @Param() params: IdParamDto,
    @Body() user: UserUpdateDto,
  ): Promise<UserResDto> {
    const updated = await this.userService.update(currentUser, params.id, user);
    return new UserResDto(updated);
  }

  @ApiBearerAuth('access-token')
  @Delete(':id')
  @Roles(UserRole.MANAGER)
  async deleteUser(
    @GetUser() currentUser: CurrentUser,
    @Param() params: IdParamDto,
  ) {
    return this.userService.delete(currentUser, params.id);
  }
}
