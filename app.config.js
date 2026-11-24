module.exports = ({ config }) => {
  return {
    ...config,
    android: {
      ...config.android,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ||
        config.android?.googleServicesFile ||
        "./google-services.json",
    },
    ios: {
      ...config.ios,
      googleServicesFile:
        process.env.GOOGLE_SERVICES_INFO_PLIST ||
        config.ios?.googleServicesFile ||
        "./GoogleService-Info.plist",
    },
  };
};
