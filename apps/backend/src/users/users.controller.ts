import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UpdateProfileDto } from './dto/profile.dto';
import { CompleteJobsOnboardingDto, VerifyGoogleDto } from './dto/jobs-onboarding.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the current user with profile + badges' })
  getMe(@CurrentUser('sub') userId: string) {
    return this.users.getMe(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update profile' })
  updateProfile(@CurrentUser('sub') userId: string, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(userId, dto);
  }

  @Put('me/onboarding')
  @ApiOperation({ summary: 'Complete onboarding (profile + interests)' })
  onboarding(@CurrentUser('sub') userId: string, @Body() dto: UpdateProfileDto) {
    return this.users.completeOnboarding(userId, dto);
  }

  @Put('me/jobs-onboarding')
  @ApiOperation({ summary: 'Complete the Internships & Jobs onboarding (name, mobile, college, course, state + Google verify)' })
  jobsOnboarding(@CurrentUser('sub') userId: string, @Body() dto: CompleteJobsOnboardingDto) {
    return this.users.completeJobsOnboarding(userId, dto);
  }

  @Post('me/verify-google')
  @ApiOperation({ summary: 'Verify identity with Google (no domain check) — used to gate the college profile submit' })
  verifyGoogle(@CurrentUser('sub') userId: string, @Body() dto: VerifyGoogleDto) {
    return this.users.verifyWithGoogle(userId, dto);
  }

  @Get('me/sessions')
  @ApiOperation({ summary: 'List active sessions / devices' })
  sessions(@CurrentUser('sub') userId: string) {
    return this.users.listSessions(userId);
  }

  @Public()
  @Get(':username')
  @ApiOperation({ summary: 'Public profile by username' })
  publicProfile(@Param('username') username: string) {
    return this.users.getPublicProfile(username);
  }
}
