import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthResponseDTO } from './dto/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Version(VERSION_NEUTRAL)
  @ApiOperation({ summary: 'Checks the health status of the application.' })
  @ApiOkResponse({
    description: 'Application is healthy.',
    type: HealthResponseDTO,
  })
  @Get()
  getHealth(): HealthResponseDTO {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }
}
