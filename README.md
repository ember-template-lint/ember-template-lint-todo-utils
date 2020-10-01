# @ember-template-lint/pending-utils

![CI Build](https://github.com/ember-template-lint/ember-template-lint-pending-utils/workflows/CI%20Build/badge.svg)

A collection of utilities to generate and store lint item metadata.

Those utilities are:

<dl>
<dt><a href="#buildPendingLintMessage">buildPendingLintMessage(lintResult, lintMessage)</a></dt>
<dd><p>Adapts an {ESLint.LintResult} or {TemplateLintResult} to a {PendingLintMessage}</p>
</dd>
<dt><a href="#buildPendingLintMessages">buildPendingLintMessages(lintResults)</a></dt>
<dd><p>Adapts a list of {ESLint.LintResult} or {TemplateLintResult} to a list of {PendingLintMessage}</p>
</dd>
<dt><a href="#ensurePendingDir">ensurePendingDir(baseDir)</a></dt>
<dd><p>Creates, or ensures the creation of, the .lint-pending directory.</p>
</dd>
<dt><a href="#generateFileName">generateFileName(pendingLintMessage)</a></dt>
<dd><p>Generates a unique filename for a pending lint message.</p>
</dd>
<dt><a href="#generatePendingFiles">generatePendingFiles(baseDir, pendingLintMessages, filePath?)</a></dt>
<dd><p>Generates files for pending lint violations. One file is generated for each violation, using a generated
hash to identify each.</p>
<p>Given a list of pending lint violations, this function will also delete existing files that no longer
have a pending lint violation.</p>
</dd>
<dt><a href="#readPendingFiles">readPendingFiles(baseDir, filePath?)</a></dt>
<dd><p>Reads all pending files in the .lint-pending directory.</p>
</dd>
<dt><a href="#getPendingBatches">getPendingBatches(lintResults, existing)</a></dt>
<dd><p>Gets 3 maps containing pending items to add, remove, or those that are stable (not to be modified).</p>
</dd>
</dl>

<a name="buildPendingLintMessage"></a>

## buildPendingLintMessage(lintResult, lintMessage)

**Kind**: global function

| Param       | Type                           | Description                                                         |
| ----------- | ------------------------------ | ------------------------------------------------------------------- |
| lintResult  | <code>ESLint.LintResult</code> | The lint result object, either an or an {TemplateLintResult}.       |
| lintMessage |                                | A lint message object representing a specific violation for a file. |

<a name="buildPendingLintMessages"></a>

## buildPendingLintMessages(lintResults)

**Kind**: global function

| Param       | Type                    | Description                                                   |
| ----------- | ----------------------- | ------------------------------------------------------------- |
| lintResults | <code>LintResult</code> | A list of objects to convert to {PendingLintMessage} objects. |

<a name="ensurePendingDir"></a>

## ensurePendingDir(baseDir)

Creates, or ensures the creation of, the .lint-pending directory.

**Kind**: global function

| Param   | Description                                                           |
| ------- | --------------------------------------------------------------------- |
| baseDir | The base directory that contains the .lint-pending storage directory. |

<a name="generateFileName"></a>

## generateFileName(pendingLintMessage)

Generates a unique filename for a pending lint message.

**Kind**: global function

| Param              | Description                                   |
| ------------------ | --------------------------------------------- |
| pendingLintMessage | The linting data for an individual violation. |

<a name="generatePendingFiles"></a>

## generatePendingFiles(baseDir, pendingLintMessages, filePath?)

Generates files for pending lint violations. One file is generated for each violation, using a generated
hash to identify each.

Given a list of pending lint violations, this function will also delete existing files that no longer
have a pending lint violation.

**Kind**: global function

| Param               | Description                                                           |
| ------------------- | --------------------------------------------------------------------- |
| baseDir             | The base directory that contains the .lint-pending storage directory. |
| pendingLintMessages | The linting data for all violations.                                  |
| filePath?           | The absolute file path of the file to update violations for.          |

<a name="readPendingFiles"></a>

## readPendingFiles(baseDir, filePath?)

Reads all pending files in the .lint-pending directory.

**Kind**: global function

| Param     | Description                                                           |
| --------- | --------------------------------------------------------------------- |
| baseDir   | The base directory that contains the .lint-pending storage directory. |
| filePath? | The absolute file path of the file to return pending items for.       |

<a name="getPendingBatches"></a>

## getPendingBatches(lintResults, existing)

Gets 3 maps containing pending items to add, remove, or those that are stable (not to be modified).

**Kind**: global function

| Param       | Description                          |
| ----------- | ------------------------------------ |
| lintResults | The linting data for all violations. |
| existing    | Existing pending lint data.          |
