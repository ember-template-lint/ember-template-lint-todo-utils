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

- `daysToWarn` - number of days after its creation date that a todo transitions into a `warn`
- `daysToError` number of days after its creation date that a todo transitions into an `error`.
- `daysToWarn` _and_ `daysToError` - if used, `daysToError` must be greater than `daysToWarn`.

## Workflows

### Normal todo workflow

- No due date is expected when adding todo items with no threshold provided in the `package.json` or the CLI arguments `daysToError` or `daysToWarn`.

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

```
# to configure todos to transition to errors 20 days after creation
UPDATE_TODO=1 DAYS_TO_ERROR_TODO=20 yarn eslint . --format eslint-formatter-todo
```

**Via `ember-template-lint` CLI:**

```
# to configure todos to transition to errors 20 days after creation
yarn ember-template-lint . --update-todo --todo-days-to-error 20
```

### Todos that are past-due become warnings, then errors

Use case: give 20 days for todos to be considered `warning`s, then 5 additional days until they are considered `error`s.

**Via config:**

```json
{
  "lintTodo": {
    "daysToWarn": 20,
    "daysToError": 25
  }
}
```

**Via `eslint` CLI:**

```
# to configure todos to transition to warnings 20 days after creation and to errors 25 days after creation
UPDATE_TODO=1 DAYS_TO_WARN_TODO=20 DAYS_TO_ERROR_TODO=25 yarn eslint . --format eslint-formatter-todo
```

**Via `ember-template-lint` CLI:**

```
# to configure todos to transition to warnings 20 days after creation and to errors 25 days after creation
yarn ember-template-lint . --update-todo --todo-days-to-warn 20 --todo-days-to-error 25
```

### Invalid option: only `daysToWarn` is present

If `daysToWarn` is passed without `daysToError` an error must be produced.

**Via `eslint` CLI:**

```
$ UPDATE_TODO=1 DAYS_TO_WARN_TODO=20 yarn eslint . --format eslint-formatter-todo

Error: `DAYS_TO_WARN_TODO` must be used with `DAYS_TO_ERROR_TODO`.
```

**Via `ember-template-lint` CLI:**

```
$ yarn ember-template-lint . --update-todo --todo-days-to-warn 20

Error: `--todo-days-to-warn` must be used with `--todo-days-to-error`.
```

#### Invalid option: `daysToWarn` is greater or equal than `daysToError`

If `daysToWarn` is greater or equal than `daysToError` an error must be produced:

**Via `eslint` CLI:**

```
$ UPDATE_TODO=1 DAYS_TO_WARN_TODO=20 DAYS_TO_ERROR_TODO=5 yarn eslint . --format eslint-formatter-todo

Error: `DAYS_TO_WARN_TODO` value must be less than `DAYS_TO_ERROR_TODO`.
```

**Via `ember-template-lint` CLI:**

```
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

# Unresolved questions

[unresolved]: #unresolved-questions

- How will we ensure that if todos are completely regenerated (we run UPDATE_TODO=1 or --update-todo`) we don't lose this data?