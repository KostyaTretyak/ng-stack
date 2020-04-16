# @ng-stack/api-mock

Даний модуль є альтернативою [angular-in-memory-web-api](https://github.com/angular/in-memory-web-api), призначений для демо-версій Angular застосунків та для тестів, що симулюють CRUD операції, спрямовані до REST API. Він перехоплює запити від Angular `HttpClient`, що мають йти на сервер, і переспрямовує їх до підготовлених даних, збережених у сервісах `@ng-stack/api-mock`.

## Зміст
- [Коли використовується](#коли-використовується)
- [Встановлення](#встановлення)
- [Обробка HTTP-запитів](#обробка-http-запитів)
- [Базове налаштування](#базове-налаштування)
- [Імпорт `@ng-stack/api-mock`](#імпорт-модуля-ng-stackapi-mock)
- [API](#api)
  - [ApiMockService та ApiMockRoute](#apimockservice-та-apimockroute)
  - [dataCallback](#datacallback)
  - [responseCallback](#responsecallback)
  - [ApiMockConfig](#apimockconfig)

## Коли використовується

- Коли Angular-застосунки розробляються швидше, ніж бекенд API для цих застосунків. Даний модуль дозволяє симулювати роботу з даними так, начебто вони знаходяться на бекенді. Пізніше, коли на реальному dev/test сервері потрібна функціональність буде впроваджена, цей модуль можна буде безшовно вимкнути, спрямувавши таким чином запити на реальний бекенд.
- Демо-застосунки, що потребують симуляції CRUD-операцій без реального сервера.
- Створення прототипів Angular-застосунків та [Proof of concept](https://en.wikipedia.org/wiki/Proof_of_concept).
- Поширення прикладів в інтернеті, якими можна ділитись з іншими людьми за допомогою [StackBlitz](https://stackblitz.com/) чи [CodePen](https://codepen.io/).
- Написання юніт-тестів, що читають та записують дані. Модуль `@ng-stack/api-mock` може перевстановлювати дані для кожного окремого теста.
- End-to-end тестування. Якщо ви переключите ваш застосунок для роботи із `@ng-stack/api-mock`, ви не будете надокучати реальній базі даних. Це може бути особливо корисним у випадку зі збірками CI (continuous integration).

## Встановлення

```bash
npm i -D @ng-stack/api-mock
```

де `-D` означає - "зберегти у `devDependencies` у package.json".

## Обробка HTTP-запитів

`@ng-stack/api-mock` обробляє HTTP-запити так, як це прийнято у REST web api.

Наприклад:

```text
GET api/posts                 // усі пости
GET api/posts/42              // пост із id=42
GET api/posts/42/comments     // усі коментарі поста із id=42
GET api/authors/10/books/3    // книга із id=3 чий автор має id=10
GET api/one/two/three         // інші маршрути, що не мають primary key
```

Підтримується будь-який рівень вкладеності маршрутів.

## Базове налаштування

> Сирцевий код із наведених тут прикладів можете проглянути
на [github](https://github.com/KostyaTretyak/angular-example-simple-service)
чи на [stackblitz](https://stackblitz.com/github/KostyaTretyak/angular-example-simple-service).

Створіть клас `SimpleService`, що впроваджує `ApiMockService`.

Цей клас, як мінімум, повинен мати метод `getRoutes()`, що повертає масив із маршрутами.
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
        path: 'api/simple/:id',
        dataCallback: this.getDataCallback(),
      },
    ];
  }

  /**
   * Колбек викликається, наприклад коли `URL == '/api/simple'` чи `URL == '/api/simple/3'`.
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

## Імпорт модуля `@ng-stack/api-mock`

Зареєструйте `SimpleService` за допомогою `ApiMockModule` в масиві `imports` викликаючи статичний метод `forRoot` із `SimpleService` та опціональним конфігураційним об'єктом:

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

### _Зверніть увагу, 1_
- Завжди імпортуйте `ApiMockModule` після `HttpClientModule`, бо цей модуль потрібен для коректної роботи `ApiMockModule`.
- Ви можете також встановлювати `ApiMockModule` для модулів із лінивим завантаженням викликаючи метод `.forFeature()`.

## API

### ApiMockService та ApiMockRoute

```ts
abstract class ApiMockService {
  abstract getRoutes(): ApiMockRootRoute[];
}
```

`ApiMockService` є інтерфейсом, який повинен впроваджуватись будь-яким сервісом для роботи з ` @ng-stack/api-mock`. Наприклад:

```ts
class SomeService implements ApiMockService {
  getRoutes(): ApiMockRootRoute[] {
    return [{ path: 'api/login' }];
  }
}
```

Якщо ми глянемо на визначення інтерфейсу `ApiMockRootRoute`,
ми побачимо, що воно відрізняється від інтерфейсу `ApiMockRoute` лише наявністю властивості `host`:

```ts
interface ApiMockRootRoute extends ApiMockRoute {
  host?: string;
}

interface ApiMockRoute {
  path: string;
  dataCallback?: ApiMockDataCallback;
  /**
   * Вказані властивості в цьому об'єкті будуть використовуватись для елементів,
   * що повертаються при виклику `dataCallback()`, але ці властивості необхідно ініціалізувати:
   * `propertiesForList: { firstProp: null, secondProp: null }`.
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
```

Отже, якщо ви встановлюєте усі можливі властивості маршруту, він буде схожий на цей приклад:

```ts
class SomeService implements ApiMockService {
  getRoutes(): ApiMockRootRoute[] {
    return [
      {
        host: 'https://example.com',
        path: 'api/posts/:postId',
        dataCallback: ({ items }) => items.length ? items : [{ postId: 1, body: 'one' }, { postId: 2, body: 'two' }],
        propertiesForList: { body: null },
        responseCallback: ({ resBody }) => resBody,
        ignoreDataFromLocalStorage: false,
        children: []
      }
    ];
  }
}
```

Де `:postId` у властивості `path` вказує нам на те, що цей ключ повинен використовуватись в якості "primary key" для елементів, що повертаються функцією `dataCallback`.
А `propertiesForList` містить об'єкт із ініціалізованими властивостями,
які використовуються для виведення списку, що повертається функцією `dataCallback`.

У прикладі, наведеному вище, функція `dataCallback` повертає елементи із типом `{ postId: number, body: string }`,
і якщо ми маємо запит із `URL == '/api/posts/1'`, відповідь, що міститься в аргументі `resBody`, буде мати тип `{ postId: number, body: string }`.

Але якщо ми маємо запит із `URL == '/api/posts'` (без primary key),
відповідь, що міститься в аргументі `resBody` буде мати тип `{ body: string }`,
оскільки ми це вказали у властивості `propertiesForList: { body: null }` маршрута.

### dataCallback

`dataCallback` містить функцію, яка викликається по конкретному маршруту для самого першого `HttpClient` запиту:
- один раз, якщо `httpMethod == 'GET'`.
- двічі, якщо `httpMethod != 'GET'`. Перший виклик автоматично йде із `httpMethod == 'GET'` та із пустим масивом в аргументі `items`. Далі, результат із першого виклику передається масивом в аргумент `items` із елементами, що **можна змінювати**, для подальших викликів з оригінальним HTTP-методом.
  
  Тобто, наприклад, якщо на бекенд приходить `HttpClient` запит із методом `POST`, то спочатку `dataCallback` викликається із методом `GET`, а потім із методом `POST`, причому в аргументі `items` міститься результат, повернутий від першого виклику.
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
  та якщо `HttpClient` запит йде із `URL == 'api/posts/123/comments'`, спочатку буде викликатись `firstCallback()` із `httpMethod == 'GET'`, потім у результаті цього виклику буде шукатись елемент із `postId == 123`. Після чого буде викликатись `secondCallback()` у відповідності із алгоритмом, описаним у перших двох пунктах, але із аргументом `parents`, де буде масив із одним елементом `postId == 123`.

Нагадаємо - так працюватиме `dataCallback` лише для самого першого `HttpClient` запиту по конкретному маршруту. Для другого і подальших запитів, якщо `httpMethod == 'GET'`, дані будуть братись із кешу (або із `localStorage`, при наявності відповідного налаштування).

Наприклад, якщо вже раніше був `HttpClient` запит із `URL == 'api/posts/:postId'`, то другий і наступні рази `dataCallback` вже не буде викликатись по цьому ж маршруту із `httpMethod == 'GET'`.

Те саме стосується і вкладених маршрутів із прикладу, наведеному вище. Якщо перший `HttpClient` запит йде із `URL == 'api/posts/:postId/comments/:commentId'`, а наступний із `URL == 'api/posts/:postId'` та із `httpMethod == 'GET'`, то у цьому наступному запиті вже не буде викликатись `firstCallback()`, бо дані будуть братись із кешу.

Також варто зазначити - якщо ваш маршрут не має властивості `dataCallback` та не має властивості `responseCallback`, і не має primary key у `path`, ви завжди отримуватимете `{ status: 200 }` у якості відповіді.

Властивість `dataCallback` повинна містити функцію наступного типу:

```ts
/**
 * Спрощена версія.
 */
type ApiMockDataCallback<I, P> = (opts?: ApiMockDataCallbackOptions<I, P>) => I;
/**
 * Спрощена версія.
 */
interface ApiMockDataCallbackOptions<I, P> {
  httpMethod?: HttpMethod;
  items?: I;
  itemId?: string;
  parents?: P;
  queryParams?: Params;
  /**
   * Тіло запиту.
   */
  reqBody?: any;
  /**
   * Заголовки запиту.
   */
  reqHeaders?: any;
}
```

Отже, якщо ви встановлюєте усі можливі властивості `ApiMockDataCallbackOptions`, це буде схоже на приклад:

```ts
export class SomeService implements ApiMockService {
  getRoutes(): ApiMockRootRoute[] {
    return [
      {
        path: 'api/heroes/:id',
        dataCallback: ({ httpMethod, items, itemId, parents, queryParams, reqBody, reqHeaders }) => [],
      },
    ];
  }
}
```

### responseCallback

`responseCallback` - є властивістю `ApiMockRoute`, що містить функцію, яка викликається після виклику `dataCallback`.

Ця властивість повинна містити функцію наступного типу:

```ts
/**
 * Спрощена версія.
 */
type ApiMockResponseCallback<I, P> = (opts?: ApiMockResponseCallbackOptions<I, P>) => any;

/**
 * Спрощена версія.
 */
interface ApiMockResponseCallbackOptions<I, P> extends ApiMockDataCallbackOptions<I, P> {
  /**
   * Тіло відповіді.
   */
  resBody?: any;
}
```

Отже, якщо ви встановлюєте усі можливі властивості `ApiMockResponseCallbackOptions`, це буде схоже на приклад:

```ts
export class SomeService implements ApiMockService {
  getRoutes(): ApiMockRootRoute[] {
    return [
      {
        path: 'api/login',
        responseCallback: ({ httpMethod, items, itemId, parents, queryParams, reqBody, reqHeaders, resBody }) => [],
      },
    ];
  }
}
```

Дані, що повертає функція `responseCallback`, потім підставляються у `body` HTTP-відповіді.
Вийняток із цього правила застосовується до даних із типом `HttpResponse` або `HttpErrorResponse`, такі дані повертаються у незміненому вигляді.

Наприклад:

```ts
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ApiMockService, ApiMockRootRoute, ApiMockResponseCallback } from '@ng-stack/api-mock';

export class SomeService implements ApiMockService {
  getRoutes(): ApiMockRootRoute[] {
    return [
      {
        path: 'api/login',
        responseCallback: this.getResponseCallback(),
      },
    ];
  }

  private getResponseCallback(): ApiMockResponseCallback {
    return ({ reqBody }) => {
      const { login, password } = reqBody;

      if (login != 'admin' || password != 'qwerty') {
        return new HttpErrorResponse({
          url: 'api/login',
          status: 400,
          statusText: 'some error message',
          headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
          error: 'other description',
        });
      }
    };
  }
}
```

### ApiMockConfig

`ApiMockConfig` визначає набір опцій для `ApiMockModule`. Додайте їх другим аргументом для `forRoot`:

```ts
ApiMockModule.forRoot(SimpleService, { delay: 1000 });
```

Прогляньте клас `ApiMockConfig`, щоб вивчити усі можливі опції:

```ts
class ApiMockConfig {
  /**
   * - `true` - потрібно пропускати запити із нерозпізнаними URL на оригінальний сервер.
   * - `false` - (початково) повертати 404 код.
   */
  passThruUnknownUrl? = false;
  /**
   * - Чи потрібно очищати попередні записи в консолі?
   *
   * Очищує записи між попередньою подією маршрутизації `NavigationStart` та поточною подією `NavigationStart`.
   */
  clearPrevLog? = false;
  showLog? = true;
  cacheFromLocalStorage? = false;
  localStorageKey? = 'apiMockCachedData';
  /**
   * Симуляція затримки відповіді (в мілісекундах).
   */
  delay? = 500;
  /**
   * - `true` - (початково) 204 код - якщо елемент, із ID відправленим у тілі `POST`, існує,
   * не повертати оновлений елемент у відповіді.
   * 
   * - `false` - 200 код - повертати оновлений елемент у відповіді.
   *
   * Підказка:
   * > **204 No Content**
   *
   * > Сервер успішно обробив запит та не повертає будь-який вміст.
   */
  postUpdate204? = true;
  /**
   * - `true` - 409 код - не потрібно оновлювати існуючий елемент, якщо ми маємо `POST` запит.
   * - `false` - (початково) 200 код - OK, оновлювати.
   *
   * Підказка:
   * > **409 Conflict**
   *
   * > Вказує, що запит не буде оброблятись, оскільки існує конфлікт з поточним станом ресурсу,
   * > наприклад конфлікт зміни елементу між одночасними оновленнями.
   */
  postUpdate409? = false;
  /**
   * - `true` - (початково) 204 код - якщо елемент, із ID відправленим у тілі `PUT`, існує,
   * не повертати оновлений елемент у відповіді.
   *
   * - `false` - 200 код - повертати оновлений елемент у відповіді.
   *
   * Підказка:
   * > **204 No Content**
   *
   * > Сервер успішно обробив запит та не повертає будь-який вміст.
   */
  putUpdate204? = true;
  /**
   * - `true` - (початково) 404 код - якщо елемент, що йде у тілі `PUT` не знайдено.
   * - `false` - створювати новий елемент.
   */
  putUpdate404? = true;
  /**
   * - `true` - (початково) 204 код - якщо елемент, із ID відправленим у тілі `PATCH`, існує,
   * не повертати оновлений елемент у відповіді.
   *
   * - `false` - 200 код - повертати оновлений елемент у відповіді.
   *
   * Підказка:
   * > **204 No Content**
   *
   * > Сервер успішно обробив запит та не повертає будь-який вміст.
   */
  patchUpdate204? = true;
  /**
   * - `true` - (початково) 404 код - якщо елементу, що треба видалити, не існує.
   * - `false` - 204 код.
   *
   * Підказка:
   * > **204 No Content**
   *
   * > Сервер успішно обробив запит та не повертає будь-який вміст.
   */
  deleteNotFound404? = true;
}
```

## Peer dependencies

Compatible with `@angular/core` >= v4.3.6 and `rxjs` > v6



