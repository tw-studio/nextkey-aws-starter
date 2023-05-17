module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    jest: true,
    node: true,
  },
  extends: [
    'airbnb',
    'next/core-web-vitals',
    'plugin:@next/next/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  overrides: [
    {
      files: ['*.test.js', '*.spec.js'],
      rules: {
        '@typescript-eslint/no-empty-function': 'off',
        'global-require': 'off',
      },
    },
    {
      files: [
        'server/**/*.[jt]s',
        '*.node.js',
        '*.config.js',
        'db/**/*.[jt]s',
        'models/**/*.[jt]s',
      ],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  // parser: '@babel/eslint-parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    'array-element-newline': [
      'error',
      {
        ArrayExpression: 'consistent',
      },
    ],
    'global-require': ['off'],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.test.js', '**/*.spec.js', '**/jest*.js'] },
    ],
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal'],
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    indent: ['warn', 2, {
      ignoredNodes: ['ConditionalExpression'],
      SwitchCase: 1,
    }],
    'jsx-a11y/href-no-hash': ['off'],
    'lines-between-class-members': ['off'],
    'max-len': [
      'warn',
      {
        code: 120,
        tabWidth: 2,
        comments: 120,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'no-trailing-spaces': ['error', {
      skipBlankLines: true,
      ignoreComments: true,
    }],
    'no-restricted-exports': ['off'],
    'no-unused-vars': ['off'],
    '@typescript-eslint/ban-ts-comment': ['off'],
    '@typescript-eslint/no-empty-interface': ['warn', { allowSingleExtends: true }],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-unused-vars': ['warn'],
    '@typescript-eslint/no-inferrable-types': ['error', {
      ignoreParameters: true,
      ignoreProperties: true,
    }],
    'no-use-before-define': ['off'],
    'object-curly-newline': ['error', {
      consistent: true,
    }],
    'padded-blocks': ['off'],
    'react/destructuring-assignment': ['off'],
    'react/jsx-filename-extension': ['warn', { extensions: ['.js', '.jsx', '.tsx'] }],
    'react/jsx-no-useless-fragment': ['error', {
      allowExpressions: true,
    }],
    'react/jsx-props-no-spreading': ['off'],
    'react/prefer-stateless-function': ['off'],
    'react/prop-types': ['off'],
    'react/react-in-jsx-scope': ['off'],
    'react/require-default-props': ['off'],
    semi: ['error', 'never'],
    // TODO: replace sort-imports with eslint-plugin-import's import/order
    'sort-imports': ['off'],
    'spaced-comment': ['off'],
    'quote-props': ['error', 'as-needed'],
    quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['@', '.'],
          ['@components', './src/components'],
          ['@db', './db'],
          ['@models', './models'],
          ['@resources', './resources'],
          ['@server', './server'],
          ['@src', './src'],
          ['@types', './types'],
          ['@utils', './utils'],
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
    },
  },
}
