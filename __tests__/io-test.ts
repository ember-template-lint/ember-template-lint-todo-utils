import { existsSync, statSync, readdirSync, readdir } from 'fs-extra';
import { join } from 'path';
import { generateFileName, generatePendingFiles } from '../src';
import { PendingLintMessage } from '../src/types';
import { createTmpDir } from './__utils__/tmp-dir';
import fixtures from './__fixtures__/fixtures';
import { updatePendingForFile } from '../src/io';

const PENDING_LINT_MESSAGE: PendingLintMessage = {
  engine: 'eslint',
  filePath: '/Users/fake/app/controllers/settings.js',
  ruleId: 'no-prototype-builtins',
  line: 25,
  column: 21,
  createdDate: 1601324202150,
};

describe('io', () => {
  describe('generateFileName', () => {
    it('can generate a unique hash for pending lint message', () => {
      const fileName = generateFileName(PENDING_LINT_MESSAGE);

      expect(fileName).toEqual('1fa0a511346d560f2e57fc9d025c54950347ae2b');
    });

    it('generates idempotent file names', () => {
      const fileName = generateFileName(PENDING_LINT_MESSAGE);
      const secondFileName = generateFileName(PENDING_LINT_MESSAGE);

      expect(fileName).toEqual('1fa0a511346d560f2e57fc9d025c54950347ae2b');
      expect(secondFileName).toEqual('1fa0a511346d560f2e57fc9d025c54950347ae2b');
    });
  });

  describe('generatePendingFiles', () => {
    let tmp: string;

    beforeEach(() => {
      tmp = createTmpDir();
    });

    it("creates .lint-pending directory if one doesn't exist", async () => {
      const lintPendingDir = await generatePendingFiles(tmp, []);

      expect(existsSync(lintPendingDir)).toEqual(true);
    });

    it("doesn't write files when no pending items provided", async () => {
      const lintPendingDir = await generatePendingFiles(tmp, []);

      expect(readdirSync(lintPendingDir)).toHaveLength(0);
    });

    it('generates pending files when pending items provided', async () => {
      const lintPendingDir = await generatePendingFiles(tmp, fixtures.pending);

      expect(readdirSync(lintPendingDir)).toHaveLength(18);
    });

    it("generates pending files only if previous pending file doesn't exist", async () => {
      const initialPendingItems: PendingLintMessage[] = [
        {
          engine: 'eslint',
          filePath: '/Users/fake/app/controllers/settings.js',
          ruleId: 'no-prototype-builtins',
          line: 25,
          column: 21,
          createdDate: 1601332963373,
        },
        {
          engine: 'eslint',
          filePath: '/Users/fake/app/controllers/settings.js',
          ruleId: 'no-prototype-builtins',
          line: 26,
          column: 19,
          createdDate: 1601332963373,
        },
      ];

      const lintPendingDir = await generatePendingFiles(tmp, initialPendingItems);

      const initialFiles = readdirSync(lintPendingDir);

      expect(initialFiles).toHaveLength(2);

      const initialFileStats = initialFiles.map((file) => {
        return {
          fileName: file,
          ctime: statSync(join(lintPendingDir, file)).ctime,
        };
      });

      await generatePendingFiles(tmp, fixtures.pending);

      const subsequentFiles = readdirSync(lintPendingDir);

      expect(subsequentFiles).toHaveLength(18);

      initialFileStats.forEach((initialFileStat) => {
        const subsequentFile = statSync(join(lintPendingDir, initialFileStat.fileName));

        expect(subsequentFile.ctime).toEqual(initialFileStat.ctime);
      });
    });

    it('removes old pending files if pending items no longer contains violations', async () => {
      const lintPendingDir = await generatePendingFiles(tmp, fixtures.pending);

      const initialFiles = readdirSync(lintPendingDir);

      expect(initialFiles).toHaveLength(18);

      const half = Math.ceil(fixtures.pending.length / 2);
      const firstHalf = fixtures.pending.slice(0, half);
      const secondHalf = fixtures.pending.slice(half, fixtures.pending.length);

      await generatePendingFiles(tmp, firstHalf);

      const subsequentFiles = readdirSync(lintPendingDir);

      expect(subsequentFiles).toHaveLength(9);

      secondHalf.forEach((pendingLintMessage) => {
        expect(
          !existsSync(join(lintPendingDir, `${generateFileName(pendingLintMessage)}.json`))
        ).toEqual(true);
      });
    });
  });

  describe('updatePendingForFile', () => {
    let tmp: string;

    beforeEach(() => {
      tmp = createTmpDir();
    });

    it("creates .lint-pending directory if one doesn't exist", async () => {
      const lintPendingDir = await generatePendingFiles(tmp, []);

      expect(existsSync(lintPendingDir)).toEqual(true);
    });

    it("doesn't write files when no pending items provided", async () => {
      const lintPendingDir = await generatePendingFiles(tmp, []);

      expect(readdirSync(lintPendingDir)).toHaveLength(0);
    });

    it('updates specific pending files for a specific filePath', async () => {
      const lintPendingDir = await generatePendingFiles(tmp, fixtures.singleFilePending);

      expect(await readdir(lintPendingDir)).toMatchInlineSnapshot(`
        Array [
          "1fa0a511346d560f2e57fc9d025c54950347ae2b.json",
          "a51d0173759432bd1e160c56f4642427e83544d9.json",
          "a72d388d48e71caa653cff498b756bc479216a00.json",
        ]
      `);

      await updatePendingForFile(
        tmp,
        '/Users/fake/app/controllers/settings.js',
        fixtures.singleFilePendingUpdated
      );

      expect(await readdir(lintPendingDir)).toMatchInlineSnapshot(`
        Array [
          "1fa0a511346d560f2e57fc9d025c54950347ae2b.json",
          "8d86d32b87429a038840a1c17903e93e7dc6ac5b.json",
          "a51d0173759432bd1e160c56f4642427e83544d9.json",
        ]
      `);
    });
  });
});
