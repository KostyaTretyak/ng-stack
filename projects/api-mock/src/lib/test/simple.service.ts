import { Injectable } from '@angular/core';

import { ApiMockService, ApiMockRouteGroup } from '@ng-stack/api-mock';

@Injectable()
export class SimpleService implements ApiMockService {
  getRouteGroups(): ApiMockRouteGroup[] {
    return [
      // This array called "routes group". There may be more than one object here.
      [{ path: 'simple/:id', callbackData: this.getCallbackData(), callbackResponse: this.getCallbackResponse() }],
    ];
  }

  /**
   * Called when URL is like `/simple` or `/simple/3`
   */
  private getCallbackData() {
    return () => [
      { id: 1, body: 'content for id 1' },
      { id: 2, body: 'content for id 2' },
      { id: 3, body: 'content for id 3' },
      { id: 4, body: 'content for id 4' },
    ];
  }

  /**
   * Returns the data (list or one item) from `getData()` callback.
   */
  private getCallbackResponse() {
    return data => data;
  }
}
