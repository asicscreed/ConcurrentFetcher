// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
    {
        plugins: {
          '@stylistic/ts': stylistic
        },
        rules: {
            '@stylistic/ts/indent': ['warn', 2]
        }
    }
);
