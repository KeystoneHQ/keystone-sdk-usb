import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const external = [
  '@emurgo/cardano-serialization-lib-browser',
  '@emurgo/cardano-serialization-lib-nodejs',
];

export default [
    // Browser build
    {
      input: 'src/browser/index.ts',
      output: [
        {
          dir: 'lib/browser',
          format: 'es',
          sourcemap: true,
          entryFileNames: 'index.js',
        },
        {
          dir: 'lib/browser',
          format: 'cjs',
          sourcemap: true,
          entryFileNames: 'index.cjs',
        },
      ],
      external,
      plugins: [
        peerDepsExternal(),
        typescript({
          declaration: false,
          outDir: 'lib/browser',
        }),
        resolve({
          browser: true,
        }),
        commonjs(),
      ],
    },
    // Node.js build
    {
      input: 'src/node/index.ts',
      output: [
        {
          dir: 'lib/node',
          format: 'es',
          sourcemap: true,
          entryFileNames: 'index.js',
        },
        {
          dir: 'lib/node',
          format: 'cjs',
          sourcemap: true,
          entryFileNames: 'index.cjs',
        },
      ],
      external,
      plugins: [
        peerDepsExternal(),
        typescript({ declaration: false, outDir: 'lib/node' }),
        resolve({ browser: false }),
        commonjs(),
      ],
    },
    // build node declaration types
    {
      input: 'src/node/index.ts',
      output: {
        file: 'lib/node/index.d.ts',
        format: 'es',
      },
      external, // 添加 external 配置
      plugins: [dts()],
    },
    // build browser declaration types
    {
      input: 'src/browser/index.ts',
      output: {
        file: 'lib/browser/index.d.ts',
        format: 'es',
      },
      external, // 添加 external 配置
      plugins: [dts()],
    },
];