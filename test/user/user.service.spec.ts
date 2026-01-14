import {Test, TestingModule} from '@nestjs/testing';
import {UserService} from '../../src/user/user.service';
import {UserRepository} from "../../src/user/user.repository";
import {UserRegisterDto} from "../../src/user/dto/user.register.dto";
import {UserRole, UserStatus} from "@prisma/client";
import {ExceptionCode} from "../../src/exception/exception.code";
import {UserUpdateDto} from "../../src/user/dto/user.update.dto";
import {MailerService} from "@nestjs-modules/mailer";

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;
  let mailerService: MailerService;
  const mockUserRepository = {
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    existsByEmail: jest.fn(),
    existsByToken: jest.fn(),
    existsByNickname: jest.fn(),
    existsById: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    updateStatus: jest.fn(),
    updateNickname: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const mockMailerService = {
    sendMail: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, {
        provide: UserRepository,
        useValue: mockUserRepository,
      },{
        provide: MailerService,
        useValue: mockMailerService,
      }],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
    mailerService = module.get<MailerService>(MailerService);
  });

  const userData = {
    id: 1,
    email: 'test@email.com',
    password: 'password1234',
    nickname: '김테스트',
    createdAt: new Date(),
    updatedAt: new Date(),
    status: UserStatus.ACTIVE,
    role: UserRole.USER
  }

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  it('회원가입 성공', async () => {
    const dto = {
      email: 'test@email.com',
      password: 'password1234',
      nickname: '김테스트',
    } as UserRegisterDto;

    const createUser = {
      id: 1,
      email: 'test@email.com',
      password: 'password1234',
      nickname: '김테스트',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: UserRole.USER
    };
    (userRepository.existsByEmail as jest.Mock).mockResolvedValue(false);
    (userRepository.save as jest.Mock).mockResolvedValue(createUser);

    const result = await userService.signup(dto);
    expect(userRepository.existsByEmail).toHaveBeenCalledWith(dto.email);
    expect(result?.id).toEqual(createUser.id);
  })

  it('회원가입 실패 (이미 가입한 회원)', async () => {
    const dto = {
      email: 'test@email.com',
      password: 'password1234',
      nickname: '김테스트',
    } as UserRegisterDto;

    (userRepository.existsByEmail as jest.Mock).mockResolvedValue(true);
    await expect(userService.signup(dto)).rejects.toThrow(ExceptionCode.USER_ALREADY_EXISTS.message);
    expect(userRepository.existsByEmail).toHaveBeenCalledWith(dto.email);
    expect(userRepository.save).not.toHaveBeenCalled();
  })

  it('닉네임 변경 성공', async () => {
    const dto = {
      nickname: 'mallang',
    } as UserUpdateDto;

    const updateUser = {
      id: 1,
      email: 'test@email.com',
      password: 'password1234',
      nickname: 'mallang',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: UserStatus.ACTIVE,
      role: UserRole.USER
    };
    (userRepository.existsByNickname as jest.Mock).mockResolvedValue(false);
    (userRepository.updateNickname as jest.Mock).mockResolvedValue(updateUser);

    const result = await userService.updateNickname(userData.email, dto.nickname);
    expect(userRepository.existsByNickname).toHaveBeenCalledWith(dto.nickname);
    expect(userRepository.updateNickname).toHaveBeenCalledWith(userData.email, dto.nickname);
    expect(result?.nickname).toEqual(updateUser.nickname);
  })

  it('닉네임 변경 실패(닉네임 중복)', async () => {
    const dto = {
      nickname: 'mallang',
    } as UserUpdateDto;

    (userRepository.existsByNickname as jest.Mock).mockResolvedValue(true);

    await expect(userService.updateNickname(userData.email, dto.nickname)).rejects.toThrow(ExceptionCode.NICKNAME_ALREADY_EXISTS.message);
    expect(userRepository.existsByNickname).toHaveBeenCalledWith(dto.nickname);
    expect(userRepository.updateNickname).not.toHaveBeenCalled();
  })

  it('유저 상태 변경 성공', async () => {
    const updateUser = {
      id: 1,
      email: 'test@email.com',
      password: 'password1234',
      nickname: 'mallang',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: UserStatus.BLOCKED,
      role: UserRole.USER
    };
    const status = UserStatus.BLOCKED;
    (userRepository.existsById as jest.Mock).mockResolvedValue(true);
    (userRepository.updateStatus as jest.Mock).mockResolvedValue(updateUser);
    const result = await userService.updateStatus(userData.id, status);
    expect(userRepository.existsById).toHaveBeenCalledWith(userData.id);
    expect(userRepository.updateStatus).toHaveBeenCalledWith(userData.id, status);
    expect(result?.status).toEqual(status);
  });

  it('유저 상태 변경 실패 (유저를 찾을 수 없음)', async () => {
    const status = UserStatus.BLOCKED;
    (userRepository.existsById as jest.Mock).mockResolvedValue(false);

    await expect(userService.updateStatus(userData.id, status)).rejects.toThrow(ExceptionCode.USER_NOT_FOUND.message);
    expect(userRepository.existsById).toHaveBeenCalledWith(userData.id);
    expect(userRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('회원 탈퇴 성공', async () => {
    const result = await userService.deleteUser(userData.email);
    expect(result).toEqual('회원 탈퇴 되었습니다.');
  });
});
