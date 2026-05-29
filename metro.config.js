const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.platforms = [...(config.resolver.platforms ?? []), 'web'];

const RNW_DIST   = path.resolve(__dirname, 'node_modules/react-native-web/dist');
const RN_PKG     = path.resolve(__dirname, 'node_modules/react-native').toLowerCase() + path.sep;
const BRIDGE_DIR = path.resolve(__dirname, 'node_modules/react-native/Libraries/BatchedBridge').toLowerCase() + path.sep;
const TURBO_DIR  = path.resolve(__dirname, 'node_modules/react-native/Libraries/TurboModule').toLowerCase() + path.sep;
const CORE_DIR   = path.resolve(__dirname, 'node_modules/react-native/Libraries/Core').toLowerCase() + path.sep;
const UTILS_DIR  = path.resolve(__dirname, 'node_modules/react-native/Libraries/Utilities').toLowerCase() + path.sep;

const STUBS = {
  batchedBridge:        path.resolve(__dirname, 'web-stubs/BatchedBridge.js'),
  turboModuleRegistry:  path.resolve(__dirname, 'web-stubs/TurboModuleRegistry.js'),
};

// React Native core init files that overwrite browser globals (setTimeout etc.)
// and try to set up the native bridge — none of that is needed on web.
const CORE_STUB_FILES = new Set([
  'initializecore.js',
  'setuptimers.js',
  'setuperrorhandling.js',
  'setuperrorhandlingnative.js',
].map(f => CORE_DIR + f));

// Specific react-native utility files that must use react-native-web equivalents
// to get real browser values instead of native-only implementations.
const UTILS_WEB_REDIRECTS = {
  'dimensions.js': path.join(RNW_DIST, 'exports/Dimensions/index.js'),
  'pixelratio.js': path.join(RNW_DIST, 'exports/PixelRatio/index.js'),
};

const _resolveRequest = config.resolver.resolveRequest;

function defaultResolve(context, moduleName, platform) {
  return _resolveRequest
    ? _resolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform !== 'web') {
    return defaultResolve(context, moduleName, platform);
  }

  // 1. Alias react-native → react-native-web
  if (moduleName === 'react-native') {
    return { type: 'sourceFile', filePath: path.join(RNW_DIST, 'index.js') };
  }

  // 2. Resolve, then intercept by resolved file path
  try {
    const result = defaultResolve(context, moduleName, platform);
    if (result?.type === 'sourceFile') {
      const fp = result.filePath.toLowerCase();

      // BatchedBridge dir → proper no-op stub
      if (fp.startsWith(BRIDGE_DIR)) {
        if (fp.includes('batchedbridge.js')) {
          return { type: 'sourceFile', filePath: STUBS.batchedBridge };
        }
        return { type: 'empty' };
      }

      // TurboModule dir → registry gets no-op stub, rest is empty
      if (fp.startsWith(TURBO_DIR)) {
        if (fp.includes('turbomoduleregistry')) {
          return { type: 'sourceFile', filePath: STUBS.turboModuleRegistry };
        }
        return { type: 'empty' };
      }

      // React Native Core init files that overwrite browser globals
      if (CORE_STUB_FILES.has(fp)) {
        return { type: 'empty' };
      }

      // Redirect specific react-native utilities to react-native-web equivalents
      // so callers within RN's own source get real browser values.
      if (fp.startsWith(UTILS_DIR)) {
        const fileName = path.basename(fp);
        if (UTILS_WEB_REDIRECTS[fileName]) {
          return { type: 'sourceFile', filePath: UTILS_WEB_REDIRECTS[fileName] };
        }
      }
    }
    return result;
  } catch {
    // Fallback: stub unresolvable imports originating inside react-native
    const origin = (context.originModulePath ?? '').toLowerCase();
    if (origin.startsWith(RN_PKG)) {
      return { type: 'empty' };
    }
    throw new Error(
      `[metro.config.js] Cannot resolve "${moduleName}" from "${context.originModulePath}" for web`
    );
  }
};

module.exports = withNativeWind(config, { input: './global.css' });
