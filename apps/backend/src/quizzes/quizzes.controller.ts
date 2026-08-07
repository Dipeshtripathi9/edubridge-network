import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { QuizzesService } from './quizzes.service';
import { AddQuestionDto, CreateQuizDto, SubmitAttemptDto, UpdateQuizDto } from './dto/quiz.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('quizzes')
@ApiBearerAuth()
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzes: QuizzesService) {}

  // ---- Admin ----

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a quiz (draft, unpublished) (admin)' })
  create(@Body() dto: CreateQuizDto) {
    return this.quizzes.createQuiz(dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all quizzes, including drafts (admin)' })
  listAdmin() {
    return this.quizzes.listQuizzesAdmin();
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get a quiz with correct answers (admin)' })
  getAdmin(@Param('id') id: string) {
    return this.quizzes.getQuizForAdmin(id);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update / publish a quiz (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateQuizDto) {
    return this.quizzes.updateQuiz(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Post(':id/questions')
  @ApiOperation({ summary: 'Add a question to a quiz (admin)' })
  addQuestion(@Param('id') id: string, @Body() dto: AddQuestionDto) {
    return this.quizzes.addQuestion(id, dto);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id/questions/:questionId')
  @ApiOperation({ summary: 'Remove a question from a quiz (admin)' })
  deleteQuestion(@Param('id') id: string, @Param('questionId') questionId: string) {
    return this.quizzes.deleteQuestion(id, questionId);
  }

  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a quiz and all its questions/attempts (admin)' })
  deleteQuiz(@Param('id') id: string) {
    return this.quizzes.deleteQuiz(id);
  }

  // ---- Student ----

  @Public()
  @Get('published/list')
  @ApiOperation({ summary: 'List published quizzes' })
  listPublished() {
    return this.quizzes.listPublished();
  }

  @Public()
  @Get(':id/take')
  @ApiOperation({ summary: 'Get a published quiz for taking (no correct answers included)' })
  getForTaking(@Param('id') id: string) {
    return this.quizzes.getQuizForTaking(id);
  }

  @Post(':id/attempts')
  @ApiOperation({ summary: 'Submit a quiz attempt — auto-graded server-side' })
  submitAttempt(@CurrentUser('sub') userId: string, @Param('id') id: string, @Body() dto: SubmitAttemptDto) {
    return this.quizzes.submitAttempt(userId, id, dto);
  }

  @Get(':id/attempts/me')
  @ApiOperation({ summary: 'My attempts for this quiz' })
  myAttempts(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.quizzes.myAttempts(userId, id);
  }

  @Get('attempts/me/all')
  @ApiOperation({ summary: 'All my quiz attempts across quizzes' })
  myAllAttempts(@CurrentUser('sub') userId: string, @Query('quizId') quizId?: string) {
    return this.quizzes.myAttempts(userId, quizId);
  }
}
