module.exports = {
    root: true,
    env: {
        node: true
    },
    'extends': [
        'plugin:vue/essential',
        '@vue/standard'
    ],
    rules: {
        'no-console': 'off',
        'no-debugger': 'off',
        'space-before-function-paren': 0,
        'no-unused-vars': 'off',
        'vue/no-unused-vars': 'off',
        indent: ['off', 2]
    },
    parserOptions: {
        parser: 'babel-eslint'
    }
}
