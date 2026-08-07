import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddQuestionDto, CreateQuizDto, SubmitAttemptDto, UpdateQuizDto } from './dto/quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- Admin ----------------

  async createQuiz(dto: CreateQuizDto) {
    return this.prisma.quiz.create({ data: { title: dto.title, description: dto.description } });
  }

  async updateQuiz(id: string, dto: UpdateQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return this.prisma.quiz.update({ where: { id }, data: dto });
  }

  async addQuestion(quizId: string, dto: AddQuestionDto) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId }, include: { questions: true } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (dto.correctOption >= dto.options.length) {
      throw new BadRequestException('correctOption must be a valid index into options');
    }
    return this.prisma.quizQuestion.create({
      data: {
        quizId,
        order: quiz.questions.length,
        prompt: dto.prompt,
        options: dto.options,
        correctOption: dto.correctOption,
      },
    });
  }

  async deleteQuestion(quizId: string, questionId: string) {
    const question = await this.prisma.quizQuestion.findUnique({ where: { id: questionId } });
    if (!question || question.quizId !== quizId) throw new NotFoundException('Question not found');
    await this.prisma.quizQuestion.delete({ where: { id: questionId } });
    return { id: questionId };
  }

  /** Admin view — includes correctOption so it can be edited/reviewed. */
  async getQuizForAdmin(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async listQuizzesAdmin() {
    return this.prisma.quiz.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { questions: true, attempts: true } } },
    });
  }

  // ---------------- Student ----------------

  async listPublished() {
    return this.prisma.quiz.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { questions: true } } },
    });
  }

  /** Student view — never exposes correctOption. */
  async getQuizForTaking(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!quiz || !quiz.isPublished) throw new NotFoundException('Quiz not found');
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions.map((q) => ({ id: q.id, prompt: q.prompt, options: q.options })),
    };
  }

  async submitAttempt(userId: string, quizId: string, dto: SubmitAttemptDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });
    if (!quiz || !quiz.isPublished) throw new NotFoundException('Quiz not found');
    if (quiz.questions.length === 0) throw new BadRequestException('This quiz has no questions yet');

    let score = 0;
    for (const q of quiz.questions) {
      if (dto.answers[q.id] === q.correctOption) score += 1;
    }

    return this.prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        answers: dto.answers,
        score,
        totalQuestions: quiz.questions.length,
      },
    });
  }

  async myAttempts(userId: string, quizId?: string) {
    return this.prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { submittedAt: 'desc' },
    });
  }

  // ---------------- Metrics ----------------

  async averageScorePercent(): Promise<number> {
    const attempts = await this.prisma.quizAttempt.findMany({ select: { score: true, totalQuestions: true } });
    if (attempts.length === 0) return 0;
    const pct = attempts.reduce((sum, a) => sum + (a.totalQuestions === 0 ? 0 : a.score / a.totalQuestions), 0);
    return Math.round((pct / attempts.length) * 1000) / 10;
  }
}
