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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { GetUser } from '../../../decorators/get-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

import { IdParamDto } from '../dtos/id-param.dto';
import { PaginateReqDto, PaginateResDto } from '../dtos/paginate.dto';
import { UserCreateDto } from '../dtos/user-create.dto';
import { UserResDto } from '../dtos/user-res.dto';
import { UserUpdateDto } from '../dtos/user-update.dto';

import { CreateUserService } from '../services/create-user.service';
import { DeleteUserService } from '../services/delete-user.service';
import { GetAllUsersService } from '../services/get-all-users.service';
import { GetUserService } from '../services/get-user.service';
import { UpdateUserService } from '../services/update-user.service';

import { UserRole } from '../user.schema';
import { CurrentUser } from '../user.types';

@Controller('user')
export class UserManagementController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly getUserService: GetUserService,
    private readonly deleteUserService: DeleteUserService,
    private readonly updateUserService: UpdateUserService,
    private readonly getAllUsersService: GetAllUsersService,
  ) {}

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all users.' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResDto })
  @HttpCode(HttpStatus.OK)
  @Get('all')
  @Roles(UserRole.MANAGER, UserRole.EMPLOYEE)
  async getAllUser(
    @GetUser() currentUser: CurrentUser,
    @Query() query: PaginateReqDto,
  ): Promise<PaginateResDto<UserResDto>> {
    return this.getAllUsersService.execute(
      currentUser,
      query.page,
      query.limit,
    );
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user by ID.' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResDto })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.MANAGER, UserRole.EMPLOYEE)
  @Get(':id')
  async getUser(
    @GetUser() currentUser: CurrentUser,
    @Param() params: IdParamDto,
  ): Promise<UserResDto> {
    return this.getUserService.execute(currentUser, params.id);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new user.' })
  @ApiResponse({ status: HttpStatus.CREATED, type: UserResDto })
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.MANAGER)
  @Post()
  async createUser(
    @GetUser() currentUser: CurrentUser,
    @Body() userDto: UserCreateDto,
  ): Promise<Partial<UserResDto>> {
    return this.createUserService.execute(currentUser, userDto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a user.' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResDto })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.MANAGER)
  @Put(':id')
  async updateUser(
    @GetUser() currentUser: CurrentUser,
    @Param() params: IdParamDto,
    @Body() user: UserUpdateDto,
  ): Promise<UserResDto> {
    return await this.updateUserService.execute(currentUser, params.id, user);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a user.' })
  @ApiResponse({ status: HttpStatus.OK })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.MANAGER)
  @Delete(':id')
  async deleteUser(
    @GetUser() currentUser: CurrentUser,
    @Param() params: IdParamDto,
  ) {
    return this.deleteUserService.execute(currentUser, params.id);
  }
}
