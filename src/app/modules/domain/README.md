Taken from [Types of Feature Modules](https://angular.io/guide/module-types):

Domain feature modules deliver a user experience dedicated to a particular application domain like editing a customer or placing an order.
They typically have a top component that acts as the feature root and private, supporting sub-components descend from it.

Domain feature modules consist mostly of declarations. Only the top component is exported.

Domain feature modules rarely have providers. When they do, the lifetime of the provided services should be the same as the lifetime of the module.

Domain feature modules are typically imported exactly once by a larger feature module.

They might be imported by the root `AppModule` of a small application that lacks routing.
