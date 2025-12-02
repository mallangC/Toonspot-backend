import {Test, TestingModule} from '@nestjs/testing';
import {UserService} from '../../src/user/user.service';
import {UserRepository} from "../../src/user/user.repository";
import {RegisterRequestDto} from "../../src/user/dto/register.request.dto";
import {UserRole} from "@prisma/client";
import {ExceptionCode} from "../../src/exception/exception.code";
import {UpdateRequestDto} from "../../src/user/dto/update.request.dto";

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;
  const mockUserRepository = {
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
    existsByEmail: jest.fn(),
    existsByNickname: jest.fn(),
    update: jest.fn(),
    save: jest.fn()
  }


  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, {
        provide: UserRepository,
        useValue: mockUserRepository,
      }],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('회원가입 성공', async () => {
    const dto = {
      email: 'test@email.com',
      password: 'password1234',
      nickname: '김테스트',
    } as RegisterRequestDto;

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
    } as RegisterRequestDto;

    (userRepository.existsByEmail as jest.Mock).mockResolvedValue(true);
    await expect(userService.signup(dto)).rejects.toThrow(ExceptionCode.ALREADY_EXISTS_USER.message);
    expect(userRepository.existsByEmail).toHaveBeenCalledWith(dto.email);
    expect(userRepository.save).not.toHaveBeenCalled();
  })

  it('닉네임 변경 성공', async () => {
    const dto = {
      email: 'test@email.com',
      nickname: 'mallang',
    } as UpdateRequestDto;

    const updateUser = {
      id: 1,
      email: 'test@email.com',
      password: 'password1234',
      nickname: 'mallang',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: UserRole.USER
    };
    (userRepository.existsByEmail as jest.Mock).mockResolvedValue(true);
    (userRepository.existsByNickname as jest.Mock).mockResolvedValue(false);
    (userRepository.update as jest.Mock).mockResolvedValue(updateUser);

    const result = await userService.updateUserNickname(dto.email, dto.nickname);
    expect(userRepository.existsByEmail).toHaveBeenCalledWith(dto.email);
    expect(result?.nickname).toEqual(updateUser.nickname);
  })

  it('닉네임 변경 실패(회원을 찾을 수 없음)', async () => {
    const dto = {
      email: 'test@email.com',
      nickname: 'mallang',
    } as UpdateRequestDto;

    (userRepository.existsByEmail as jest.Mock).mockResolvedValue(false);

    await expect(userService.updateUserNickname(dto.email, dto.nickname)).rejects.toThrow(ExceptionCode.USER_NOT_FOUND.message);
    expect(userRepository.existsByEmail).toHaveBeenCalledWith(dto.email);
    expect(userRepository.update).not.toHaveBeenCalled();
  })

  it('닉네임 변경 실패(닉네임 중복)', async () => {
    const dto = {
      email: 'test@email.com',
      nickname: 'mallang',
    } as UpdateRequestDto;

    (userRepository.existsByEmail as jest.Mock).mockResolvedValue(true);
    (userRepository.existsByNickname as jest.Mock).mockResolvedValue(true);

    await expect(userService.updateUserNickname(dto.email, dto.nickname)).rejects.toThrow(ExceptionCode.ALREADY_EXISTS_NICKNAME.message);
    expect(userRepository.existsByEmail).toHaveBeenCalledWith(dto.email);
    expect(userRepository.existsByNickname).toHaveBeenCalledWith(dto.nickname);
    expect(userRepository.update).not.toHaveBeenCalled();
  })

});
