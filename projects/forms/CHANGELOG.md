<a name="1.4.0-beta"></a>
# [1.4.0-beta](https://github.com/KostyaTretyak/ng-stack/releases/tag/forms%401.4.0-beta) (2020-03-11)

### Features

- **support Control with an object model type** See [Automatically detect appropriate types for form controls](README.md#automatically-detect-appropriate-types-for-form-controls) (See https://github.com/KostyaTretyak/ng-stack/commit/faafda).

<a name="1.3.4"></a>
## [1.3.4](https://github.com/KostyaTretyak/ng-stack/releases/tag/forms%401.3.4) (2020-01-08)

### Fix peer dependencies

- **install the library** Now peer dependencies included v8 of `@angular/core`.

<a name="1.3.3"></a>
## [1.3.3](https://github.com/KostyaTretyak/ng-stack/releases/tag/forms%401.3.3) (2019-07-23)

### Bug Fixes

- **validation model:** Fixed default `ValidatorsModel`. ([#53](https://github.com/KostyaTretyak/ng-stack/pull/53)).

<a name="1.3.2"></a>
## [1.3.2](https://github.com/KostyaTretyak/ng-stack/releases/tag/forms%401.3.2) (2019-05-09)

### Bug Fixes and BREAKING CHANGES

- **Control type:** Removed buggy `Control` type support. ([#48](https://github.com/KostyaTretyak/ng-stack/pull/48)).

<a name="1.3.1"></a>
## [1.3.1](https://github.com/KostyaTretyak/ng-stack/releases/tag/forms%401.3.1) (2019-05-01)

### Bug Fixes

- **validation model:** fixed issues with nested validation models ([#44](https://github.com/KostyaTretyak/ng-stack/pull/44)).

<a name="1.3.0"></a>
## [1.3.0](https://github.com/KostyaTretyak/ng-stack/releases/tag/forms%401.3.0) (2019-04-17)

### Features

- **types:** added support for union types ([#39](https://github.com/KostyaTretyak/ng-stack/pull/39)).


<a name="1.2.1"></a>
## [1.2.1](https://github.com/KostyaTretyak/ng-stack/releases/tag/forms%401.2.1) (2019-04-09)

### Features and BREAKING CHANGES

- **input[type=file] directive:** added new @Output `select` event,
and removed @Output `selectedFiles` event ([#35](https://github.com/KostyaTretyak/ng-stack/pull/35)).


<a name="1.2.0-beta.1"></a>
## [1.2.0-beta.1](https://github.com/KostyaTretyak/ng-stack/releases/tag/forms%401.2.0-beta.1) (2019-04-07)

### Features and BREAKING CHANGES

- **input[type=file] directive:** added new @Output `selectedFiles` event,
and removed @Input() `valueAsFileList` ([#32](https://github.com/KostyaTretyak/ng-stack/pull/32)).


<a name="1.1.0-beta.2"></a>
## [1.1.0-beta.2](https://github.com/KostyaTretyak/ng-stack/releases/tag/forms%401.1.0-beta.2) (2019-04-06)

### Bug Fixes

- **Validators:** fixed filesMinLength and filesMaxLength methods names ([#29](https://github.com/KostyaTretyak/ng-stack/pull/29)).


<a name="1.1.0-beta.1"></a>
## [1.1.0-beta.1](https://github.com/KostyaTretyak/ng-stack/releases/tag/forms%401.1.0-beta.1) (2019-04-06)

### Features

- **new directive:** added support for `input[type="file"]` ([#25](https://github.com/KostyaTretyak/ng-stack/pull/25)).


<a name="1.0.0-beta.6"></a>
## [1.0.0-beta.6](https://github.com/KostyaTretyak/ng-stack/releases/tag/forms%401.0.0-beta.6) (2019-03-10)

### Bug Fixes

- **form model:** Type mismatch ([#18](https://github.com/KostyaTretyak/ng-stack/issues/18))


<a name="1.0.0-beta.5"></a>
## [1.0.0-beta.5](https://github.com/KostyaTretyak/ng-stack/releases/tag/forms%401.0.0-beta.5) (2019-03-09)

### Bug Fixes

- **validation model:** Issue with interpreting of a validation model ([#15](https://github.com/KostyaTretyak/ng-stack/issues/15))


<a name="1.0.0-beta.4"></a>
## [1.0.0-beta.4](https://github.com/KostyaTretyak/ng-stack/releases/tag/forms%401.0.0-beta.4) (2019-03-08)

### Features

- **validation model:** added support for a validation model ([#14](https://github.com/KostyaTretyak/ng-stack/pull/14)).


<a name="0.0.0-alpha.1"></a>
## 0.0.0-alpha.1 (2019-02-25)

### Features

- **npm pack:** `@ng-stack/forms` use Angular-CLI v7 git mono repository and build npm pack with it.
