import { Test, TestingModule } from '@nestjs/testing';
import { CiiuController } from './ciiu.controller';

describe('CiiuController', () => {
  let controller: CiiuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CiiuController],
    }).compile();

    controller = module.get<CiiuController>(CiiuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
