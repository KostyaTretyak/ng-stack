import { Injectable } from '@angular/core';

import { ApiMockService, ApiMockCallbackData, ApiMockRoute } from '@ng-stack/api-mock';

interface Model {
  id: number;
  body: string;
}

@Injectable()
export class SimpleService implements ApiMockService {
  getRoutes(): ApiMockRoute[] {
    return [
      // This array called "routes group". There may be more than one an object.
      {
        path: 'simple/:id',
        callbackData: this.getCallbackData(),
        callbackResponse: this.getCallbackResponse(),
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

  /**
   * Returns the data (list or an one item) from `getCallbackData()` callback.
   */
  private getCallbackResponse() {
    return data => data;
  }
}
