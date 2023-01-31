const rollup = require('rollup');

const rollupConfig = {
  input: 'app.js',
  output: {
    file: 'bundle.js',
    format: 'cjs',
  },
  external: ['socket.io'],
};

async function build() {
  const bundle = await rollup.rollup(rollupConfig);
  await bundle.write(rollupConfig.output);
}

build();