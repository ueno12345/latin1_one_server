import { Test, TestingModule } from '@nestjs/testing';
import { AcquireService } from './acquire.service';

describe('AcquireService', () => {
  let service: AcquireService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcquireService],
    }).compile();

    service = module.get<AcquireService>(AcquireService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
