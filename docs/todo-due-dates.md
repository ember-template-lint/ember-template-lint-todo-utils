- Feature Name: `todo-due-dates`
- Start Date: `2020-11-09`
- RFC PR: (leave this empty)
- Checkup Issue: (leave this empty)

# Summary

[summary]: #summary

This RFC proposes enhancing the todo functionality with due days, allowing authors to add accountability and commitment to fix the todo items by a specified amount of time.

# Motivation

[motivation]: #motivation

The lint todo functionality is intended to seamlessly integrate with existing linting tools, allowing the incremental fixing of linting errors on very large projects. However, one undesirable side effect of this is that developers may forget about fixing the todo items, leading to the accumulation of technical debt.

By adding a day threshold to the todo items, developers will now have a commitment to fix the linting problems because todo items that are past this threshold will have their severity increased accordingly.

# How We Will Teach This

[pedagogy]: #pedagogy

- There will be documentation on how to configure when todo items are due to be fixed.
- There will be a config and/or CLI argument to specify the number of days an item's severity changes, either to `warn` or to `error`.

# Requirements

[requirements]: #requirements

- When no due date configuration is present (primarily configured in package.json), todos are added with no due dates.
- Authors can specify the number of days the todos become errors after its creation date.
- Author can also specify the number of days the todos become warnings after its creation date. The error threshold must also be passed and must be greater than this threshold.
- Configuration can be specified in a common file or overriden via CLI arguments.

# Implementation

[requirements]: #implementation

## High Level Flow

When an author runs a linter with the todo functionality, all errors are converted to todos with no due date threshold unless one is present in `package.json` _or_ passed as a command line argument.

- Days to decay to warn - number of days after its creation date that a todo transitions into a `warn`
  - in package.json:
    ```js
    //...
    "daysToDecay": {
      "warn": {number}
    }
    //...
    ```
  - on command line: `--todo-days-to-warn={number}`
- Days to decay to error - number of days after its creation date that a todo transitions into an `error`
  - in package.json: 
    ```js
    //...
    "daysToDecay": {
      "error": {number}
    }
    //...
    ```
  - on command line: `--todo-days-to-error={number}`
- Days to decay to warn _and_ error - if used, error must be greater than warn.

## Workflows

### Normal todo workflow

- No due date is expected when adding todo items with no threshold provided in the `package.json` or the CLI arguments `daysToDecay.error` or `daysToDecay.warn`.

### Todos that are past-due become errors

Example use case: 20 days for todos to be considered errors since its creation date.

**Via config:**

In `package.json`:

```json
{
  "lintTodo": {
    "daysToDecay": {
      "warn": 30,
      "error": 90
    }
  }
}
```

**Via `eslint` CLI:**

```shell
# to configure todos to transition to errors 20 days after creation
UPDATE_TODO=1 TODO_DAYS_TO_ERROR=20 yarn eslint . --format eslint-formatter-todo
```

**Via `ember-template-lint` CLI:**

```shell
# to configure todos to transition to errors 20 days after creation
yarn ember-template-lint . --update-todo --todo-days-to-error 20
```

Providing configuration via the command line will override configuration in the package.json.

### Todos that are past-due become warnings, then errors

Use case: give 20 days for todos to be considered `warning`s, then 5 additional days until they are considered `error`s.

**Via config:**

```json
{
  "lintTodo": {
    "daysToDecay": {
      "warn": 20,
      "error": 25
    }
  }
}
```

**Via `eslint` CLI:**

```shell
# to configure todos to transition to warnings 20 days after creation and to errors 25 days after creation
UPDATE_TODO=1 TODO_DAYS_TO_WARN=20 TODO_DAYS_TO_ERROR=25 yarn eslint . --format eslint-formatter-todo
```

**Via `ember-template-lint` CLI:**

```shell
# to configure todos to transition to warnings 20 days after creation and to errors 25 days after creation
yarn ember-template-lint . --update-todo --todo-days-to-warn 20 --todo-days-to-error 25
```

**Via `eslint` CLI:**

```
$ UPDATE_TODO=1 TODO_DAYS_TO_WARN=20 yarn eslint . --format eslint-formatter-todo

Error: `TODO_DAYS_TO_WARN` must be used with `TODO_DAYS_TO_ERROR`.
```

**Via `ember-template-lint` CLI:**

```shell
$ yarn ember-template-lint . --update-todo --todo-days-to-warn 20

Error: `--todo-days-to-warn` must be used with `--todo-days-to-error`.
```

#### Invalid option: `warn` is greater or equal than `error`

If days to decay to warn is greater or equal than days to decay to error, an error must be produced:

**Via `eslint` CLI:**

```shell
$ UPDATE_TODO=1 TODO_DAYS_TO_WARN=20 TODO_DAYS_TO_ERROR=5 yarn eslint . --format eslint-formatter-todo

Error: `TODO_DAYS_TO_WARN` value must be less than `TODO_DAYS_TO_ERROR`.
```

**Via `ember-template-lint` CLI:**

```shell
$ yarn ember-template-lint . --update-todo --todo-days-to-warn 20 --todo-days-to-error=5

Error: `--todo-days-to-warn` value must be less than `--todo-days-to-error`.
```

## Proposed changes to the schema to include due date

```ts
interface TodoData {
  ...
  createdDate: Date;
  warnDate?: Date;
  errorDate?: Date;
}
```

# Critique

[critique]: #critique

A few other options were considered:

- Instead of due days, another option considered was passing a specific due date. Passing days is preferable because if we want to expose a config/CLI param for this, passing a date would make the config or command to run stale.
- Allow the option to pass rule id with due date associated to them. The extra rule id config is not necessary since both `ember-template-lint` and `eslint` already have options to filter by rule id.
- If extra functionality is needed we could provide a different CLI for that specific purpose. For now, the goal is to keep the todo functionality simple with a simple due date mechanism.

# Important Notes

[important notes]: #important-notes

- The dates data in todos will be lost if a user re-runs `UPDATE_TODO=1` _or_ `--update-todo`. This is expected, and can be considered a feature.
