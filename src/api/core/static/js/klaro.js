window.dataLayer = window.dataLayer || [];
window.gtag = function () {
  dataLayer.push(arguments);
};

var klaroSettingsElement = document.getElementById("klaro");
var hasGoogleTagManager = klaroSettingsElement
  ? klaroSettingsElement.dataset.hasGoogleTagManager == "True"
  : false;

window.klaroConfig = {
  apps: ["metton-cookies"],
  acceptAll: true,
  default: true,
  translations: {
    en: {
      // purposes: {
      //   analytics: "Analytics & Performance",
      //   marketing: "Marketing & Advertising",
      //   functional: "Essential Features",
      // },
      consentNotice: {
        description:
          "We use cookies to provide a better experience. You can accept or manage your preferences below",
      },
      decline: "Decline",
      ok: "Accept All",
    },
  },
  services: [
    {
      name: "metton-cookies",
      default: true,
      required: true,
      purposes: ["functional"],
      // cookies: ["session_id", "auth_token"],
      onAccept: function () {
        // console.log("Metton cookies enabled");
      },
      onDecline: function () {
        // console.log("Metton cookies declined (but still required).");
      },
    },
  ],
  purposes: {
    analytics: "Analytics & Performance",
    marketing: "Marketing & Advertising",
    functional: "Essential Features",
  },
};

// If GTM is enabled, add Google Tag Manager and Google Analytics
if (hasGoogleTagManager) {
  klaroConfig.apps.push("google-tag-manager", "google-analytics");
  klaroConfig.services.push(
    {
      name: "google-tag-manager",
      default: true,
      purposes: ["marketing"],
      onAccept: function () {
        if (!window.dataLayer) window.dataLayer = [];
        // console.log("GTM cookies given");
        dataLayer.push({ event: "klaro-google-tag-manager-accepted" });
      },
      onDecline: function () {
        // console.log("GTM cookies declined");
      },
    },
    {
      name: "google-analytics",
      default: true,
      cookies: [/^_ga(_.*)?/],
      purposes: ["analytics"],
      onAccept: function () {
        if (!window.dataLayer) window.dataLayer = [];
        gtag("consent", "update", { analytics_storage: "granted" });
        dataLayer.push({ event: "klaro-google-analytics-accepted" });
      },
      onDecline: function () {
        gtag("consent", "update", { analytics_storage: "denied" });
      },
    }
  );
}