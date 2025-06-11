const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Добавляем это:
defaultConfig.resolver.sourceExts.push('cjs');
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;