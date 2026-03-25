// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('cjs');

// Force Metro to use the CJS (CommonJS/React Native) build of firebase/auth
// instead of the ESM browser build, which doesn't register auth components
// for the React Native runtime (causing "Component auth has not been registered yet")
// Force Metro to use the CJS (CommonJS/React Native) builds of firebase
// instead of a mix of CJS and ESM browser builds. Using a mix causes silent
// component registration failures (e.g. "Component auth has not been registered yet")
config.resolver = config.resolver || {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform !== 'web') {
    if (moduleName === 'firebase/auth') {
      return { filePath: path.resolve(__dirname, 'node_modules/firebase/auth/dist/index.cjs.js'), type: 'sourceFile' };
    }
    if (moduleName === '@firebase/auth') {
      return { filePath: path.resolve(__dirname, 'node_modules/@firebase/auth/dist/rn/index.js'), type: 'sourceFile' };
    }
    if (moduleName === 'firebase/app') {
      return { filePath: path.resolve(__dirname, 'node_modules/firebase/app/dist/index.cjs.js'), type: 'sourceFile' };
    }
    if (moduleName === '@firebase/app') {
      return { filePath: path.resolve(__dirname, 'node_modules/@firebase/app/dist/index.cjs.js'), type: 'sourceFile' };
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

