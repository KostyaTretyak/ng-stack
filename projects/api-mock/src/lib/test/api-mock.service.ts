import { Injectable } from '@angular/core';

import { ApiMockService, MockRouteGroup } from '@ng-stack/api-mock';

@Injectable()
export class MyApiMockService implements ApiMockService {
  constructor() {}
  getRouteGroups(): MockRouteGroup[] {
    return [];
  }
}
