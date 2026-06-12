/**
 * Conventional Commits 강제 (feat/fix/docs/chore/refactor/test/...).
 * .husky/commit-msg 훅이 커밋 메시지를 이 규칙으로 검증한다.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'docs',
        'refactor',
        'test',
        'style',
        'perf',
        'build',
        'ci',
        'revert',
      ],
    ],
  },
};
