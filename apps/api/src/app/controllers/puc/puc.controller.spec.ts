import { Test, TestingModule } from '@nestjs/testing';
import { PucController } from './puc.controller';

describe('PucController', () => {
  let controller: PucController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PucController],
    }).compile();

    controller = module.get<PucController>(PucController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
