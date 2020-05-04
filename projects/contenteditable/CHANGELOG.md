<a name="1.0.2"></a>
# [1.0.2](https://github.com/KostyaTretyak/ng-stack/releases/tag/contenteditable%401.0.2) (2019-05-04)

### Fix

- **directive selector:** Specified selector for directive:

  before:

  ```ts
  @Directive({
    selector: '[contenteditable]',
    //...
  })
  ```

  now:

  ```ts
  @Directive({
    selector: '[contenteditable][formControlName],[contenteditable][formControl],[contenteditable][ngModel]',
    //...
  })
  ```

<a name="1.0.0"></a>
## 1.0.0 (2019-02-06)

### Features

* **npm pack:** `@ng-stack/contenteditable` use Angular-CLI v7 git mono repository and build npm pack with it.
* **testing:** Added Unit tests.
* **contenteditable:** Since version 1.0.0, `@ng-stack/contenteditable` accepts `contenteditable` as @Input property. ([#12](https://github.com/KostyaTretyak/ng-contenteditable/issues/12))
