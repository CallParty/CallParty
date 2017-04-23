module.exports = {
  "env": {
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
    },
    "sourceType": "module",
    "ecmaVersion": 8
  },
  "plugins": [],
  "rules": {
    "indent": [
      "error",
      2,
      { "SwitchCase": 1 }
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single",
      { "avoidEscape": true, "allowTemplateLiterals": true }
    ],
    "semi": [
      "error",
      "never"
    ],
    "no-console": 0,
    "quote-props": [
      "error",
      "as-needed"
    ]
  },
  "globals": {
    "Promise": true
  }
};
