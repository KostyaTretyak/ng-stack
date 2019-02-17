Taken from [Types of Feature Modules](https://angular.io/guide/module-types):

Service modules provide utility services such as data access and messaging. Ideally, they consist entirely of providers and have no declarations. Angular's `HttpClientModule` is a good example of a service module.

The root `AppModule` is the only module that should import service modules.
