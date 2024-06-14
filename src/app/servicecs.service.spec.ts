import { TestBed } from '@angular/core/testing';

import { ServicecsService } from './servicecs.service';

describe('ServicecsService', () => {
  let service: ServicecsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicecsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
