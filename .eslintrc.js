/**
 ** - Please Read ESLint Enable for WebStorm here: {@link https://stackoverflow.com/questions/41735890/how-to-make-webstorm-format-code-according-to-eslint}
 ** - [Settings || Preferences] > Language & Frameworks > JavaScript > Code Quality Tools > ESLint > Automatic ESLint Configuration (X)
 ** - [Settings || Preferences] > Keymap > Plugins > JavaScript and TypeScript > Apply ESLint Code Style Rules (Ctrl + Alt + Shift + E)
 ** - [Settings || Preferences] > Keymap > Plugins > JavaScript and TypeScript > Fix ESLint Problems (Shift + F)
 ** @type {Object<*>}
 **/
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    // "plugin:@typescript-eslint/recommended",
  ],
  parserOptions: {
    ecmaVersion: 11,
    ecmaFeatures: {
      jsx: true
    },
    sourceType: "module",
  },
  globals: {
    page: true,
    NodeJS: true,
    WeakMap: false,
    WeakSet: false,
    REACT_APP_ENV: true,
    VisibleError: "readonly",
    NonExposeError: "readonly",
    ClientError: "readonly",
    SystemError: "readonly",
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    mocha: true,
    jest: true,
    jasmine: true,
  },
  rules: {
    "@typescript-eslint/naming-convention": ["error", {
      selector: "interface",
      format: ["PascalCase"],
      custom: {
        regex: "^I[A-Z]",
        match: true,
      },
    }],
    /** @see {@link https://stackoverflow.com/questions/65388160/how-to-enforce-semicolon-in-typescript-interface/} !*/
    "@typescript-eslint/member-delimiter-style": ["warn", {
      multiline: {
        delimiter: "semi",
        requireLast: true,
      },
      singleline: {
        delimiter: "comma",
        requireLast: false,
      }
    }],
    // eslint-disable-next-line no-magic-numbers
    indent: ["error", 4, {SwitchCase: 1}],
    // eslint-disable-next-line no-magic-numbers
    complexity: ["error", 12],
    // eslint-disable-next-line no-magic-numbers
    semi: ["error", "always"],
    "react/prop-types": 0,
    "react/display-name": 0,

    /** Max Rules & Number Rules !*/
    "id-length": 0,
    // "func-style": [2, "declaration", {"allowArrowFunctions": true}],
    // "no-magic-numbers": [2, {ignore: [0, 1], ignoreArrayIndexes: true}],
    "object-curly-spacing": ["error", "never"],
    "operator-linebreak": [2, "before"],
    "max-params": [2, 6],
    "max-statements-per-line": [2, {max: 2}],
    "new-cap": [0, {"capIsNewExceptions": ["GetIntrinsic"]}],
    "keyword-spacing": ["error", {
      after: true,
      before: true,
    }],
    "space-before-function-paren": ["error", {
      named: "never",
      anonymous: "always",
      asyncArrow: "always",
    }],

    "arrow-spacing": 2,
    "constructor-super": 2,
    "eol-last": 2,
    "eqeqeq": 2,
    "for-direction": 2,
    "func-call-spacing": 2,
    "getter-return": 2,
    "no-array-constructor": 2,
    "no-async-promise-executor": 2,
    "no-case-declarations": 0,
    "no-class-assign": 2,
    "no-compare-neg-zero": 2,
    "no-cond-assign": 2,
    "no-const-assign": 2,
    "no-constant-condition": 2,
    "no-control-regex": 2,
    "no-debugger": 2,
    "no-delete-var": 2,
    "no-dupe-args": 2,
    "no-dupe-class-members": 0,
    "no-dupe-keys": 2,
    "no-duplicate-case": 2,
    "no-empty-character-class": 2,
    "no-empty-pattern": 2,
    "no-eval": 2,
    "no-ex-assign": 2,
    "no-extra-boolean-cast": 2,
    "no-extra-label": 2,
    "no-extra-semi": 2,
    "no-fallthrough": 2,
    "no-func-assign": 2,
    "no-global-assign": 2,
    "no-implied-eval": 2,
    "no-inner-declarations": 2,
    "no-invalid-regexp": 2,
    "no-irregular-whitespace": 2,
    "no-misleading-character-class": 2,
    "no-mixed-spaces-and-tabs": 2,
    "no-multi-assign": 2,
    "no-multi-spaces": 2,
    "no-multi-str": 2,
    "no-new-object": 2,
    "no-new-symbol": 2,
    "no-new-wrappers": 2,
    "no-obj-calls": 2,
    "no-octal": 2,
    "no-proto": 2,
    "no-prototype-builtins": 2,
    "no-redeclare": 2,
    "no-regex-spaces": 2,
    "no-return-assign": 0,
    "no-script-url": 2,
    "no-self-assign": 2,
    "no-shadow-restricted-names": 2,
    "no-sparse-arrays": 2,
    "no-this-before-super": 2,
    "no-trailing-spaces": 2,
    "no-undef": 2,
    "no-unexpected-multiline": 2,
    "no-unreachable": 2,
    "no-unsafe-finally": 2,
    "no-unsafe-negation": 2,
    "no-unused-labels": 2,
    "no-useless-catch": 2,
    "no-useless-escape": 2,
    "no-useless-return": 2,
    "no-var": 2,
    "no-with": 2,
    "require-atomic-updates": 0,
    "require-yield": 2,
    "space-before-blocks": 2,
    "space-infix-ops": 2,
    "symbol-description": 2,
    "use-isnan": 2,
    "valid-typeof": 2,
  },
  settings: {
    // Support import modules from TypeScript files in JavaScript files
    "import/resolver": {node: {extensions: [".js", ".jsx", ".ts", ".tsx"]}},
    polyfills: ["fetch", "Promise", "URL", "object-assign"],
  },
  overrides: [
    {
      files: [".eslintrc.js", "**.config.js", "**.config.ts", "**.json", "**.jsx", "**.tsx"],
      rules: {
        indent: ["error", 2, {SwitchCase: 1}],
        "no-console": 0,
        "no-magic-numbers": 0,
      }
    },
    {
      files: ["config/**/**(.js|.ts)"],
      rules: {
        indent: ["error", 2, {SwitchCase: 1}],
        "no-console": 0,
        "no-magic-numbers": 0,
      },
    },
    {
      files: ["./**.json"],
      rules: {
        indent: ["error", 2, {SwitchCase: 1}],
        "semi": 0,
      },
    },
  ],
};
