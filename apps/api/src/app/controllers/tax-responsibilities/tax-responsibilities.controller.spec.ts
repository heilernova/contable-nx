import { Test, TestingModule } from '@nestjs/testing';
import { TaxResponsibilitiesController } from './tax-responsibilities.controller';

describe('TaxResponsibilitiesController', () => {
  let controller: TaxResponsibilitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaxResponsibilitiesController],
    }).compile();

    controller = module.get<TaxResponsibilitiesController>(TaxResponsibilitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
