import { Test, TestingModule } from '@nestjs/testing';
import { AcquireController } from './acquire.controller';

describe('AcquireController', () => {
  let controller: AcquireController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcquireController],
    }).compile();

    controller = module.get<AcquireController>(AcquireController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
