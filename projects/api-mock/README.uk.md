# @ng-stack/api-mock

Даний модуль є альтернативою [angular-in-memory-web-api](https://github.com/angular/in-memory-web-api), призначений для демо-версій Angular застосунків та для тестів, що емулюють CRUD операції спрямовані до REST API.

Він перехоплює запити від Angular `HttpClient`, що мають йти на сервер, і переспрямовує їх до підготовлених даних, збережених у сервісах `@ng-stack/api-mock`.

## Зміст
- [Коли використовується](#use-cases)
- [Встановлення](#install)
- [Обробка HTTP-запитів](#http-request-handling)
- [Базове налаштування](#basic-setup)
- [Імпорт `@ng-stack/api-mock`](#import-the-ng-stackapi-mock-module)

## Use cases

- Коли Angular-застосунки розробляються швидше, ніж бекенд API для цих застосунків. Даний модуль дозволяє емулювати роботу з даними, начебто вони знаходяться на бекенді. Пізніше, коли на реальному dev/test сервері потрібна функціональність буде впроваджена, цей модуль можна буде безшовно вимкнути, спрямувавши таким чином запити на реальний бекенд.

- Домо-застосунки, що потребують симуляції CRUD-операцій без реального сервера.

- Створення прототипів Angular-застосунків та [Proof of concept](https://en.wikipedia.org/wiki/Proof_of_concept).

- Поширення прикладів в інтернеті, якими можна ділитись з іншими людьми за допомогою [StackBlitz](https://stackblitz.com/) чи [CodePen](https://codepen.io/).

- Написання юніт-тестів, що читають та записують дані. Модуль `@ng-stack/api-mock` може перевстановлювати дані для кожного окремого теста.

- End-to-end тестування. Якщо ви переключите ваш застосунок для роботи із `@ng-stack/api-mock`, ви не будете надокучати реальній базі даних. Це може бути особливо корисним у випадку зі збірками CI (continuous integration).

## Install

```bash
npm i -D @ng-stack/api-mock
```

ЧИ

```bash
yarn add -D @ng-stack/api-mock
```

де `-D` означеє - "зберегти у `devDependencies` у package.json".

## HTTP request handling

`@ng-stack/api-mock` обробляє HTTP-запити та повертає `Observable` об'єкт так, як це прийнято у REST web api.

Examples:

```text
GET api/posts                 // all posts
GET api/posts/42              // the post with id=42
GET api/posts/42/comments     // all comments of post with id=42
GET api/authors/10/books/3    // a book with id=3 whose author has id=10
GET api/one/two/three         // endpoint without primary id
```

Підтримується будь-який рівень вкладеності маршрутів.

## Basic setup

> Сирцевий код із наведених тут прикладів можете проглянути
на [github](https://github.com/KostyaTretyak/angular-example-simple-service)
чи на [stackblitz](https://stackblitz.com/github/KostyaTretyak/angular-example-simple-service).

Створіть клас `SimpleService`, що впроваджує `ApiMockService`.

Цей клас, як мінімум, повинен мати метод `getRoutes()`, що повертає масив із маршрутами та відповідними даними.
Наприклад:

```ts
import { ApiMockService, ApiMockDataCallback, ApiMockRootRoute } from '@ng-stack/api-mock';

interface Model {
  id: number;
  name: string;
}

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
   * Колбек викликається, коли `URL == '/simple'` чи коли воно містить id, наприклад `URL == '/simple/3'`.
   */
  private getDataCallback(): ApiMockDataCallback<Model[]> {
    return ({ httpMethod, items }) => {
      if (httpMethod == 'GET') {
        return [
          { id: 1, name: 'Windstorm' },
          { id: 2, name: 'Bombasto' },
          { id: 3, name: 'Magneta' },
          { id: 4, name: 'Tornado' },
        ];
      } else {
        return items;
      }
    };
  }
}
```

**_Зверніть увагу_**
- метод `getDataCallback()` повертає колбек, що викликається:
  - один раз, якщо HTTP-запит має `httpMethod == 'GET'`.
  - двічі, якщо HTTP-запит має `httpMethod != 'GET'`. Перший виклик автоматично йде із `httpMethod == 'GET'` та із пустим масивом в аргументі `items`. Далі результат із першого виклику передається масивом в аргумент `items` для подальших викликів з оригінальним HTTP-методом. Наприклад, якщо на бекенд приходить запит із методом `POST`, то спочатку колбек викликається із методом `GET`, а потім із методом `POST`, причому в аргументі `items` міститься результат повернутий від першого виклику.
  - якщо ми маємо маршрут із вкладеністю, наприклад:
  ```ts
  {
    path: 'api/posts/:postId',
    dataCallback: firstCallback,
    children: [
      {
        path: 'comments/:commentId',
        dataCallback: secondCallback
      }
    ]
  }
  ```
  та якщо запит йде із `URL == 'api/posts/123/comments'`, спочатку буде викликатись `firstCallback()` із `httpMethod == 'GET'`, потім у результаті цього виклику буде шукатись елемент із `postId == 123`. Після чого буде викликатись `secondCallback()` у відповідності із алгоритмом, описаним у перших двох пунктах, але із одним елементом (чий `postId == 123`) у масиві в аргументі `parents`.

## Import the `@ng-stack/api-mock` module

Зареєструйте ваш сервіс із даними за допомогою `ApiMockModule` в масиві `AppModule.imports` викликаючи статичний метод `forRoot` цього сервіса, опціонально можна ще передавати конфігураційний об'єкт:

```ts
import { NgModule } from '@angular/core';
import { ApiMockModule } from '@ng-stack/api-mock';
import { environment } from '../environments/environment';
import { SimpleService } from './simple.service';

const apiMockModule = ApiMockModule.forRoot(SimpleService, { delay: 1000 });

@NgModule({
  // ...
  imports: [
    HttpClientModule,
    !environment.production ? apiMockModule : []
    // ...
  ],
  // ...
})
export class AppModule { }
```

**_Зверніть увагу_**
- Завжди імпортуйте `ApiMockModule` після `HttpClientModule`, бо цей модуль потрібен для коректної роботи `@ng-stack/api-mock`.
- Ви можете тако встановлювати `@ng-stack/api-mock` для модулів із лінивим завантаженням викликаючи метод `.forFeature()`.

## API

```ts
abstract class ApiMockService {
  abstract getRoutes(): ApiMockRootRoute[];
}

interface ApiMockRootRoute extends ApiMockRoute {
  host?: string;
}

interface ApiMockRoute {
  path: string;
  dataCallback?: ApiMockDataCallback;
  /**
   * Вказані властивості в цьому об'єкті будуть використовуватись для елементів,
   * що повертаються при виклику `dataCallback()`.
   */
  propertiesForList?: ObjectAny;
  responseCallback?: ApiMockResponseCallback;
  /**
   * Ви можете зберігати майже усі дані для @ng-stack/api-mock у localStorage, але за виключенням
   * окремих маршрутів, де `ignoreDataFromLocalStorage == true`.
   *
   * Початково `ignoreDataFromLocalStorage == false`.
   */
  ignoreDataFromLocalStorage?: boolean;
  children?: ApiMockRoute[];
}

interface ApiMockDataCallbackOptions<I, P> {
  items?: I;
  itemId?: string;
  httpMethod?: HttpMethod;
  parents?: P;
  queryParams?: Params;
  /**
   * Request body.
   */
  reqBody?: any;
}

interface ApiMockResponseCallbackOptions<I, P> extends ApiMockDataCallbackOptions<I, P> {
  /**
   * Response body.
   */
  resBody?: any;
}

type ApiMockDataCallback<I, P> = (opts?: ApiMockDataCallbackOptions<I, P>) => I;

type ApiMockResponseCallback<I, P> = (opts?: ApiMockResponseCallbackOptions<I, P>) => any;
```

## Peer dependencies

Модуль сумісний із `@angular/core` >= v4.3.6 та `rxjs` > v6.

