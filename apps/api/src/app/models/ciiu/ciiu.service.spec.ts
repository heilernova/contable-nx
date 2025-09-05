import { Test, TestingModule } from '@nestjs/testing';
import { CiiuService } from './ciiu.service';

describe('CiiuService', () => {
  let service: CiiuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CiiuService],
    }).compile();

    service = module.get<CiiuService>(CiiuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
