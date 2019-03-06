import { Injectable } from '@angular/core';

import { ApiMockRouteGroup, ApiMockService } from '@ng-stack/api-mock';

import { SimpleService } from './simple.service';

@Injectable()
export class ApiMockProxyService implements ApiMockService {
  constructor(private simpleService: SimpleService) {}

  getRouteGroups(): ApiMockRouteGroup[] {
    return [...this.simpleService.getRouteGroups()];
  }
}
