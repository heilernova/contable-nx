import { Test, TestingModule } from '@nestjs/testing';
import { UnspscService } from './unspsc.service';

describe('UnspscService', () => {
  let service: UnspscService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnspscService],
    }).compile();

    service = module.get<UnspscService>(UnspscService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
