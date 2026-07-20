import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CertificatesService } from './certificates.service';
import { buildCertificatePdf } from './certificates.pdf';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, JwtUser } from '../../common/decorators/current-user.decorator';

@ApiTags('internships-certificates')
@ApiBearerAuth()
@Controller('internships/certificates')
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @Public()
  @Get('verify/:code')
  @ApiOperation({ summary: 'Public certificate verification (JSON)' })
  verify(@Param('code') code: string) {
    return this.certificates.verifyByCode(code);
  }

  // Bare @Res() (no `passthrough: true`) opts this route out of the global
  // ResponseInterceptor's `{ success, data }` JSON envelope — Nest skips its own
  // response handling once a raw response object is injected, so writing/piping
  // directly here is the actual HTTP body. Covered by an e2e assertion on
  // Content-Type + the `%PDF` magic bytes since this pattern is new to this codebase.
  @Public()
  @Get('verify/:code/pdf')
  @ApiOperation({ summary: 'Public certificate verification (PDF, inline)' })
  async verifyPdf(@Param('code') code: string, @Res() res: Response) {
    const cert = await this.certificates.getForPublicPdf(code);
    const doc = buildCertificatePdf(cert);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${cert.code}.pdf"`);
    doc.pipe(res);
    doc.end();
  }

  @Get('me')
  @ApiOperation({ summary: 'My certificates' })
  mine(@CurrentUser('sub') userId: string) {
    return this.certificates.myCertificates(userId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download my certificate as a PDF (attachment)' })
  async download(@CurrentUser() user: JwtUser, @Param('id') id: string, @Res() res: Response) {
    const cert = await this.certificates.getForDownload(user.sub, user.role, id);
    const doc = buildCertificatePdf(cert);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cert.code}.pdf"`);
    doc.pipe(res);
    doc.end();
  }
}
