import {
  Controller,
  Request,
  Response,
  All,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { auth } from '@repo/auth';

@Controller('api/auth')
export class AuthController {
  // @All('*')
  // async handler(@Req() req: Request) {
  //   const handler = auth.handler;
  //   return handler(req);
  // }
  @Get('session')
  async getSession(@Req() req: Request, @Res() res: Response) {
    const session = await auth.api.getSession({ headers: req.headers });
    return session;
  }
}
