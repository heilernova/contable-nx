import { Test, TestingModule } from '@nestjs/testing';
import { TaxResponsibilitiesService } from './tax-responsibilities.service';

describe('TaxResponsibilitiesService', () => {
  let service: TaxResponsibilitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaxResponsibilitiesService],
    }).compile();

    service = module.get<TaxResponsibilitiesService>(TaxResponsibilitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
