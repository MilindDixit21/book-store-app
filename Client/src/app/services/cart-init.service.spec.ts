import { TestBed } from '@angular/core/testing';

import { CartInitService } from './cart-init.service';

describe('CartInitService', () => {
  let service: CartInitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartInitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
