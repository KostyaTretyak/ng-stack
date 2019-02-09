import { Injectable } from '@angular/core';

import { ApiMockService, ApiMockRouteGroup, ApiMockCallbackData, ApiMockCallbackResponse } from '@ng-stack/api-mock';

import { Customer } from './types';

@Injectable()
export class CustomersOrdersService implements ApiMockService {
  getRouteGroups(): ApiMockRouteGroup[] {
    return [
      [
        {
          path: 'customers/:customerId',
          callbackData: this.getCustomersData(),
          callbackResponse: this.getCustomerResponse(),
        },
        {
          path: 'orders/:orderId',
          callbackData: this.getOrdersData(),
          callbackResponse: this.getOrdersResponse(),
        },
      ],
    ];
  }

  /**
   * Called when URL is like `customers` or `customers/123`
   */
  private getCustomersData(): ApiMockCallbackData {
    return customerId => {
      return { writeableData: [], onlyreadData: [] };
    };
  }

  /**
   * Called when URL is like `customers` or `customers/123`
   */
  private getCustomerResponse(): ApiMockCallbackResponse {
    return (mockData, parents, queryParams) => {
      return;
    };
  }

  /**
   * Called when URL is like `customers/123/orders` or `customers/123/orders/456`.
   * Here `[Customer]` - it is generic type for `parents` - parameter for the callback.
   */
  private getOrdersData(): ApiMockCallbackData<[Customer]> {
    return (orderId, parents) => {
      return { writeableData: [], onlyreadData: [] };
    };
  }

  /**
   * Called when URL is like `customers/123/orders` or `customers/123/orders/456`.
   * Here `[Customer]` - it is generic type for `parents` - parameter for the callback.
   */
  private getOrdersResponse(): ApiMockCallbackResponse<[Customer]> {
    return (mockData, parents, queryParams) => {
      return;
    };
  }
}
