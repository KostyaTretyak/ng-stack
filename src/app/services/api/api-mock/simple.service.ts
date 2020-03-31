import { Injectable } from '@angular/core';

import { ApiMockService, ApiMockDataCallback, ApiMockRootRoute } from '@ng-stack/api-mock';

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
        dataCallback: this.getDataCallback(),
      },
    ];
  }

  /**
   * Called when URL is like `/simple` or `/simple/3`.
   */
  private getDataCallback(): ApiMockDataCallback<Model[]> {
    return (data, id, httpMethod) => {
      if (httpMethod == 'GET') {
        return [
          { id: 1, body: 'content for id 1' },
          { id: 2, body: 'content for id 2' },
          { id: 3, body: 'content for id 3' },
          { id: 4, body: 'content for id 4' },
        ];
      } else {
        return data;
      }
    };
  }
}
