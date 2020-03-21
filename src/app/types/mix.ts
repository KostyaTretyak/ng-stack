export interface Environment {
  production: boolean;
  frontendHost: string;

  // Intended for ApiMockModule
  apiMockRun?: boolean;
  apiMockShowLog?: boolean;
  apiMockClearPrevLog?: boolean;
  apiMockHttpDelay?: number;
  apiMockPassThruUnknownUrl?: boolean;
}

export interface ObjectAny {
  [key: string]: any;
}

export interface PrimaryKeys {
  [key: string]: number | string;
}
