const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    name: 'Electron Screen Recorder',
    executableName: 'electron-screen-recorder',
    appBundleId: 'com.electron.screen-recorder',
    appCategoryType: 'public.app-category.utilities',
    win32metadata: {
      CompanyName: 'Electron Screen Recorder',
      FileDescription: 'Screen Recording Application',
      OriginalFilename: 'electron-screen-recorder.exe',
      ProductName: 'Electron Screen Recorder',
      InternalName: 'electron-screen-recorder'
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'electron-screen-recorder',
        authors: 'Electron Screen Recorder Team',
        description: 'A powerful screen recording application'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Electron Screen Recorder Team',
          homepage: 'https://github.com/iamshubham1704/electron-screen-recorder'
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          homepage: 'https://github.com/iamshubham1704/electron-screen-recorder'
        }
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
