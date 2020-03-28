import { Injectable } from '@angular/core';

import { ApiMockService, ApiMockCallbackData, ApiMockRootRoute } from '@ng-stack/api-mock';

interface Model {
  id: number;
  body: string;
}

@Injectable()
export class SimpleService implements ApiMockService {
  getRoutes(): ApiMockRootRoute[] {
    return [
      {
        path: 'simple/:id',
        callbackData: this.getCallbackData(),
      },
    ];
  }

  /**
   * Called when URL is like `/simple` or `/simple/3`.
   */
  private getCallbackData(): ApiMockCallbackData<Model[]> {
    return data => {
      if (data.length) {
        return data;
      }

      return [
        { id: 1, body: 'content for id 1' },
        { id: 2, body: 'content for id 2' },
        { id: 3, body: 'content for id 3' },
        { id: 4, body: 'content for id 4' },
      ];
    };
  }
}
