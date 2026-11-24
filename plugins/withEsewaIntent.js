const { withAndroidManifest } = require("@expo/config-plugins");

/**
 * Expo Config Plugin to add Android 11+ (API Level 30+) <queries>
 * for eSewa package ("com.f1soft.esewa") and "esewa://" scheme.
 * Ensures Linking.canOpenURL("esewa://") returns true and allows
 * direct app-to-app Intent launching without OS permission blocks.
 */
const withEsewaIntent = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;

    if (!androidManifest.queries) {
      androidManifest.queries = [];
    }

    const queries = androidManifest.queries;

    // Check if package query already added
    const hasPackage = queries.some(
      (q) =>
        q.package &&
        q.package.some((p) => p.$ && p.$["android:name"] === "com.f1soft.esewa")
    );
    if (!hasPackage) {
      queries.push({
        package: [{ $: { "android:name": "com.f1soft.esewa" } }],
      });
    }

    // Check if esewa scheme query already added
    const hasScheme = queries.some(
      (q) =>
        q.intent &&
        q.intent.some(
          (i) =>
            i.data &&
            i.data.some((d) => d.$ && d.$["android:scheme"] === "esewa")
        )
    );
    if (!hasScheme) {
      queries.push({
        intent: [
          {
            action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
            data: [{ $: { "android:scheme": "esewa" } }],
          },
        ],
      });
    }

    return config;
  });
};

module.exports = withEsewaIntent;
