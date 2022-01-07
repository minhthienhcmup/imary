module.exports = {
  root: true,
  extends: ['@react-native-community', 'eslint:recommended'],
  rules: {
    'react-native/no-inline-styles': 0,
    'react/jsx-props-no-spreading': 'off',
    'global-require': 0,
    'react/prop-types': 1,
    'no-console': 'off',
    'react/button-has-type': 0,
    'react/no-access-state-in-setstate': 0,
    'react/destructuring-assignment': 0,
    'react/sort-comp': 0,
    'no-eval': 1,
    'no-const-assign': 'warn',
    'react/no-did-mount-set-state': 0,
    'no-this-before-super': 'warn',
    'no-undef': 'warn',
    'no-unreachable': 'warn',
    'no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true,
      },
    ],
    'constructor-super': 'warn',
    'valid-typeof': 'warn',
    'max-len': [
      'warn',
      {
        code: 120,
      },
    ],
    'no-underscore-dangle': 'off',
    'no-nested-ternary': 'off',
    'no-implicit-globals': 'off',
    'no-mixed-operators': 'off',
    'no-shadow': 'off',
    'react/jsx-filename-extension': [
      1,
      {
        extensions: ['.js', '.jsx'],
      },
    ],
    'prefer-destructuring': [
      'error',
      {
        VariableDeclarator: {
          array: false,
          object: true,
        },
        AssignmentExpression: {
          array: false,
          object: false,
        },
      },
      {
        enforceForRenamedProperties: false,
      },
    ],
    'react/prefer-stateless-function': 'off',
    'no-param-reassign': [
      'error',
      {
        props: false,
      },
    ],
    'no-use-before-define': [
      'error',
      {
        functions: false,
        classes: false,
        variables: false,
      },
    ],
    'react-hooks/exhaustive-deps': 0,
  },
};
