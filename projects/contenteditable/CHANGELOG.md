<a name="2.0.0"></a>
# [2.0.0](https://github.com/KostyaTretyak/ng-stack/releases/tag/contenteditable-2.0.0) (2022-02-17)

### Breaking Changes

- Changed module name to `NgsContenteditableModule`.

<a name="2.0.0-beta.2"></a>
## [2.0.0-beta.2](https://github.com/KostyaTretyak/ng-stack/releases/tag/contenteditable-2.0.0-beta.2) (2022-02-14)

### Breaking Changes

- Changed selector to `editable`.
- The lib builded with Ivy Renderer.

<a name="1.1.1"></a>
## [1.1.1](https://github.com/KostyaTretyak/ng-stack/releases/tag/contenteditable%401.1.1) (2020-10-15)

### Fix

- Refactoring of the method to support the `unformattedPaste` attribute.

<a name="1.1.0"></a>
## [1.1.0](https://github.com/KostyaTretyak/ng-stack/releases/tag/contenteditable%401.1.0) (2020-08-22)

### Features

- Added experimental `[unformattedPaste]` attribute that allow copy formated text (from anywhere) and paste unformated text into HTML element with `contenteditable="true"` attribute.

<a name="1.0.2"></a>
## [1.0.2](https://github.com/KostyaTretyak/ng-stack/releases/tag/contenteditable%401.0.2) (2019-05-04)

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
