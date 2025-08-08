import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GetUser } from '../../../decorators/get-user.decorator';
import { Roles } from '../../../decorators/roles.decorator';

import { LocationIdDto } from '../dtos/location-id-param.dto';
import { PaginateReqDto, PaginateResDto } from '../dtos/paginate.dto';
import { UserResDto } from '../dtos/user-res.dto';

import { LocationUsersFinderService } from '../services/location-users-finder.service';

import { UserRole } from '../user.schema';
import { CurrentUser } from '../user.types';

@ApiTags('Managers And Employees Locations Lookup')
@Controller('user')
export class UserLocationController {
  constructor(
    private readonly locationUsersFinderService: LocationUsersFinderService,
  ) {}

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get all managers by location id.' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResDto })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.MANAGER)
  @Get('location/managers/:locationId')
  async getManagersByLocationId(
    @GetUser() currentUser: CurrentUser,
    @Param() params: LocationIdDto,
    @Query() query: PaginateReqDto,
  ): Promise<PaginateResDto<UserResDto>> {
    return this.locationUsersFinderService.execute(
      currentUser,
      params.locationId,
      UserRole.MANAGER,
      query.page,
      query.limit,
    );
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get all managers by location id and their descendants.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: UserResDto })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.MANAGER)
  @Get('location/managers/:locationId/all')
  async getAllManagersForLocationAndTheirDescendants(
    @GetUser() currentUser: CurrentUser,
    @Param() params: LocationIdDto,
    @Query() query: PaginateReqDto,
  ): Promise<PaginateResDto<UserResDto>> {
    return this.locationUsersFinderService.execute(
      currentUser,
      params.locationId,
      UserRole.MANAGER,
      query.page,
      query.limit,
      true,
    );
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get employees by location id.' })
  @ApiResponse({ status: HttpStatus.OK, type: UserResDto })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.MANAGER, UserRole.EMPLOYEE)
  @Get('location/employees/:locationId')
  async getEmployeesByLocationId(
    @GetUser() currentUser: CurrentUser,
    @Param() params: LocationIdDto,
    @Query() query: PaginateReqDto,
  ): Promise<PaginateResDto<UserResDto>> {
    return this.locationUsersFinderService.execute(
      currentUser,
      params.locationId,
      UserRole.EMPLOYEE,
      query.page,
      query.limit,
    );
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get employees by location id and their descendants.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: UserResDto })
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.MANAGER, UserRole.EMPLOYEE)
  @Get('location/employees/:locationId/all')
  async getAllEmployeesForLocationAndTheirDescendants(
    @GetUser() currentUser: CurrentUser,
    @Param() params: LocationIdDto,
    @Query() query: PaginateReqDto,
  ): Promise<PaginateResDto<UserResDto>> {
    return this.locationUsersFinderService.execute(
      currentUser,
      params.locationId,
      UserRole.EMPLOYEE,
      query.page,
      query.limit,
      true,
    );
  }
}
