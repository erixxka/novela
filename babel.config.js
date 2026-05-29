module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      // NativeWind v4: css-interop transformation (avoid nativewind/babel which
      // pulls in react-native-worklets/plugin — a Reanimated 4 dep we don't use)
      require.resolve('react-native-css-interop/dist/babel-plugin'),
      'react-native-reanimated/plugin',
    ],
  };
};
