export interface Environment {
  production: boolean;
  frontendHost: string;

  // Intended for ApiMockModule
  runApiMock?: boolean;
  showLogApiMock?: boolean;
  clearPrevLogApiMock?: boolean;
  httpDelayApiMock?: number;
}

export interface ObjectAny {
  [key: string]: any;
}

export interface PrimaryKeys {
  [key: string]: number | string;
}
