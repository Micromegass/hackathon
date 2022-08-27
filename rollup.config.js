import resolve from '@rollup/plugin-node-resolve';
import commonjs from "@rollup/plugin-commonjs";

export default [
    {
        input: './model-viewer.js',
        output: [
            {
                format: 'esm',
                file: './bundle.js'
            },
        ],
        plugins: [
            resolve(),
            commonjs(),
        ]
    },
    {
        input: './map.js',
        output: [
            {
                format: 'esm',
                file: './bundle_map.js'
            },
        ],
        plugins: [
            resolve(),
            commonjs(),
        ]
    },
]