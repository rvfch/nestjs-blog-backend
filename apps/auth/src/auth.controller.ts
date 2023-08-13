import { BaseController } from '@app/common/core/controllers/base.controller';
import { CurrentUser } from '@app/common/core/decorators/current-user.decorator';
import { Origin } from '@app/common/core/decorators/origin.decorator';
import { Public } from '@app/common/core/decorators/public.decorator';
import { AuthResultDto } from '@app/common/dto/auth/auth-result.dto';
import { LoginDto } from '@app/common/dto/auth/login.dto';
import { SignUpDto } from '@app/common/dto/auth/signup.dto';
import { TenantAuthorizedDto } from '@app/common/dto/auth/tenant-authorized.dto';
import { TenantDto } from '@app/common/dto/tenant/tenant.dto';
import { UserDto } from '@app/common/dto/users/user.dto';
import { MessageDto } from '@app/common/dto/utils/message.dto';
import { ITenant } from '@app/common/entity/interface/tenant.interface';
import { RequestWithTenantId } from '@app/common/utils/express/request-with-tenant';
import { RequestWithUser } from '@app/common/utils/express/request-with-user';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Response } from 'express';
import { catchError, of } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthHelper } from './helpers/auth.helpers';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController extends BaseController {
  private readonly cookiePath = '/api/auth';
  private readonly cookieName: string;
  private readonly refreshTime: number;
  private readonly debug: boolean;

  constructor(
    @Inject('REDIS') private readonly redisClient: ClientProxy,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super(authService);
    this.cookieName = this.configService.get<string>('REFRESH_COOKIE');
    this.refreshTime = this.configService.get<number>('jwt.refresh.time');
    this.debug = this.configService.get<string>('NODE_ENV') !== 'production';
  }

  /**
   * Registers a new user
   * @param {SignUpDto} dtoIn - User's sign-up information
   * @param {RequestWithTenantId} req - Request object
   * @param {string | undefined} origin - Origin of the request
   * @returns {Promise<MessageDto>} - Promise containing a message
   */
  @ApiHeader({ name: 'x-api-key', description: 'Tenant ID is required' })
  @ApiOperation({ summary: 'User sign-up' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('/signup')
  public async signUp(
    @Body() dtoIn: SignUpDto,
    @Req() req: RequestWithTenantId,
    @Origin() origin: string | undefined,
  ): Promise<MessageDto> {
    return await this.authService.signUp(dtoIn, origin);
  }

  /**
   * Retrieves the current user
   * @param {string} id - User's ID
   * @param {RequestWithTenantId} req - Request object
   * @returns {Promise<IUser>} - Promise containing user information
   */
  @ApiHeader({ name: 'x-api-key', description: 'Tenant ID is required' })
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, type: UserDto })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Get('/me')
  public async getMe(
    @CurrentUser() id: string,
    @Req() req: RequestWithTenantId,
  ): Promise<UserDto> {
    return await this.authService.getMe(id);
  }

  /**
   * Logs a user in
   * @param {LoginDto} dtoIn - User's login information
   * @param {Response} res - Response object
   * @param {RequestWithTenantId} req - Request object
   * @param {string | undefined} origin - Origin of the request
   * @returns {Promise<AuthResultDto>} - Promise containing authentication results
   */
  @ApiHeader({ name: 'x-api-key', description: 'Tenant ID is required' })
  @ApiOperation({ summary: 'Sign-in' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200 })
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  public async login(
    @Body() dtoIn: LoginDto,
    @Res() res: Response,
    @Req() req: RequestWithTenantId,
    @Origin() origin: string | undefined,
  ): Promise<AuthResultDto> {
    const result = await this.authService.login(dtoIn, origin);
    AuthHelper.saveRefreshCookie(
      res,
      result.refreshToken,
      this.cookieName,
      this.cookiePath,
      this.refreshTime,
      this.debug,
    )
      .status(HttpStatus.OK)
      .json(result);

    return result;
  }

  /**
   * Refreshes an access token
   * @param {RequestWithUser} req - Request object
   * @param {string | undefined} origin - Origin of the request
   * @param {Response} res - Response object
   */
  @ApiHeader({ name: 'x-api-key', description: 'Tenant ID is required' })
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: AuthResultDto })
  @ApiCookieAuth('refreshToken')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/refresh-access')
  public async refreshAccess(
    @Req() req: RequestWithUser,
    @Origin() origin: string | undefined,
    @Res() res: Response,
  ): Promise<AuthResultDto> {
    const token = AuthHelper.refreshTokenFromReq(req, this.cookieName);
    const result = await this.authService.refreshTokenAccess(token, origin);
    AuthHelper.saveRefreshCookie(
      res,
      result.refreshToken,
      this.cookieName,
      this.cookiePath,
      this.refreshTime,
      this.debug,
    )
      .status(HttpStatus.OK)
      .json(result);

    return result;
  }

  /**
   * Logs a user out
   * @param {RequestWithUser} req - Request object
   * @param {Response} res - Response object
   */
  @ApiHeader({ name: 'x-api-key', description: 'Tenant ID is required' })
  @ApiOperation({ summary: 'Logout' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiBearerAuth()
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  public async logout(
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    const token = AuthHelper.refreshTokenFromReq(req, this.cookieName);
    const message = await this.authService.logout(token);
    res
      .clearCookie(this.cookieName, { path: this.cookiePath })
      .status(HttpStatus.OK)
      .json(message);
  }

  /**
   * Initialize a tenant
   * @param {string} dtoIn - Tenant's id
   * @returns {Promise<TenantAuthorizedDto>} - Promise containing tenant authorization results
   */
  @ApiHeader({ name: 'x-api-key', description: 'Tenant ID is required' })
  @ApiOperation({ summary: 'Tenant initialize' })
  @ApiBody({ type: TenantDto })
  @ApiResponse({ status: 200, type: TenantAuthorizedDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @Public()
  @Post('/initTenant')
  @HttpCode(HttpStatus.OK)
  public async initTenant(
    @Req() req: RequestWithTenantId,
  ): Promise<TenantAuthorizedDto> {
    return await this.authService.initTenant();
  }

  /**
   * Authorizes a tenant
   * @param {TenantDto} dtoIn - Tenant's login information
   * @returns {Promise<TenantAuthorizedDto>} - Promise containing tenant authorization results
   */
  @ApiOperation({ summary: 'Tenant login' })
  @ApiBody({ type: TenantDto })
  @ApiResponse({ status: 200, type: TenantAuthorizedDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @Public()
  @Post('/tenantLogin')
  @HttpCode(HttpStatus.OK)
  public async authorizeTenant(
    @Body() dtoIn: TenantDto,
  ): Promise<TenantAuthorizedDto> {
    return await this.authService.authorizeTenant(
      this.redisClient
        .send<ITenant, TenantDto>('load_tenant', dtoIn)
        .pipe(catchError((val) => of({ error: val.message }))),
      dtoIn.password,
    );
  }

  @Public()
  @Get('/ping')
  ping() {
    return 'pong';
  }
}
