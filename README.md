[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/phcbcnpmcbkcnijkpfohkdmcofcofibh?logo=google&logoColor=white&label=google%20users)](https://chromewebstore.google.com/detail/asn-plus/phcbcnpmcbkcnijkpfohkdmcofcofibh)
[![Mozilla Add-on Users](https://img.shields.io/amo/users/asn-plus?logo=mozilla&label=mozilla%20users)](https://addons.mozilla.org/addon/asn-plus)
[![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/phcbcnpmcbkcnijkpfohkdmcofcofibh?label=chrome&logo=googlechrome)](https://chromewebstore.google.com/detail/asn-plus/phcbcnpmcbkcnijkpfohkdmcofcofibh)
[![Mozilla Add-on Version](https://img.shields.io/amo/v/asn-plus?label=firefox&logo=firefox)](https://addons.mozilla.org/addon/asn-plus)
[![GitHub Release Version](https://img.shields.io/github/v/release/cssnr/asn-plus?logo=github)](https://github.com/cssnr/asn-plus/releases/latest)
[![Manifest Version](https://img.shields.io/github/manifest-json/v/cssnr/asn-plus?filename=manifest.json&logo=json&label=manifest)](https://github.com/cssnr/asn-plus/blob/master/manifest.json)
[![Build](https://github.com/cssnr/asn-plus/actions/workflows/build.yaml/badge.svg)](https://github.com/cssnr/asn-plus/actions/workflows/build.yaml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=cssnr_asn-plus&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=cssnr_asn-plus)
# ASN Plus

Modern [Chrome](https://chromewebstore.google.com/detail/asn-plus/phcbcnpmcbkcnijkpfohkdmcofcofibh)
Web Extension and [Firefox](https://addons.mozilla.org/addon/asn-plus)
Browser Addon for [The Aviation Safety Network](https://aviation-safety.net/)
to enable dark mode plus add additional features.

*   [Install](#install)
*   [Features](#features)
    -   [Upcoming Features](#upcoming-features-and-ideas)
*   [Frequently Asked Questions](#frequently-asked-questions)
*   [Known Issues](#known-issues)
*   [Configuration](#configuration)
*   [Development](#development)
    -   [Building](#building)

# Install

*   [Google Chrome Web Store](https://chromewebstore.google.com/detail/asn-plus/phcbcnpmcbkcnijkpfohkdmcofcofibh)
*   [Mozilla Firefox Add-ons](https://addons.mozilla.org/addon/asn-plus)

[![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/main/src/chrome/chrome_48x48.png)](https://chromewebstore.google.com/detail/asn-plus/phcbcnpmcbkcnijkpfohkdmcofcofibh)
[![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/main/src/firefox/firefox_48x48.png)](https://addons.mozilla.org/addon/asn-plus)
[![Edge](https://raw.githubusercontent.com/alrra/browser-logos/main/src/edge/edge_48x48.png)](https://chromewebstore.google.com/detail/asn-plus/phcbcnpmcbkcnijkpfohkdmcofcofibh)
[![Chromium](https://raw.githubusercontent.com/alrra/browser-logos/main/src/chromium/chromium_48x48.png)](https://chromewebstore.google.com/detail/asn-plus/phcbcnpmcbkcnijkpfohkdmcofcofibh)
[![Brave](https://raw.githubusercontent.com/alrra/browser-logos/main/src/brave/brave_48x48.png)](https://chromewebstore.google.com/detail/asn-plus/phcbcnpmcbkcnijkpfohkdmcofcofibh)
[![Vivaldi](https://raw.githubusercontent.com/alrra/browser-logos/main/src/vivaldi/vivaldi_48x48.png)](https://chromewebstore.google.com/detail/asn-plus/phcbcnpmcbkcnijkpfohkdmcofcofibh)
[![Opera](https://raw.githubusercontent.com/alrra/browser-logos/main/src/opera/opera_48x48.png)](https://chromewebstore.google.com/detail/asn-plus/phcbcnpmcbkcnijkpfohkdmcofcofibh)

All **Chromium** Based Browsers can install the extension from the
[Chrome Web Store](https://chromewebstore.google.com/detail/asn-plus/phcbcnpmcbkcnijkpfohkdmcofcofibh).

# Features

*   Enable Dark Mode
*   Highlight Rows with Fatalities
*   Add Additional Links to Entries
*   Update Main Navigation Links
*   Hide Site Header Image
*   Search Registration/Operator from Popup

### Upcoming Features and Ideas

*   Auto Fill for New Event Submissions

> [!TIP]
> **Don't see your feature here?**
> Request one on the [Feature Request Discussion](https://github.com/cssnr/asn-plus/discussions/categories/feature-requests).

# Frequently Asked Questions

### Why are there no questions?

Nobody has asked any...

> [!TIP]
> **Don't see your question here?**
> Ask one on the [Q&A Discussion](https://github.com/cssnr/asn-plus/discussions/categories/q-a).

# Known Issues

*   Disabling some features requires a page reload before they will take effect.

> [!TIP]
> **Don't see your issue here?**
> Open one on the [Issues](https://github.com/cssnr/asn-plus/issues).

# Configuration

You can pin the Addon by clicking the `Puzzle Piece`, find the Web Extension icon, then;  
**Chrome**, click the `Pin` icon.  
**Firefox**, click the `Settings Wheel` and `Pin to Toolbar`.

To open the options, click on the icon (from above) then click `Open Options`.

You may also access the Options and Home page from a Right Click if Enabled in Options.

# Development

**Quick Start**

To install and run chrome or firefox with web-ext.
```shell
npm isntall
npm run chrome
npm run firefox
```

To Load Unpacked/Temporary Add-on make a `manifest.json` and run from the [src](src) folder.
```shell
npm run manifest:chrome
npm run manifest:firefox
```

For more information on web-ext, [read this documentation](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/).  
To pass additional arguments to an `npm run` command, use `--`.  
Example: `npm run chrome -- --chromium-binary=...`

## Building

Install the requirements and copy libraries into the `src/dist` directory by running `npm install`.
See [gulpfile.js](gulpfile.js) for more information on `postinstall`.
```shell
npm install
```

To load unpacked or temporary addon from the [src](src) folder, you must generate the `src/manifest.json` for the desired browser.
```shell
npm run manifest:chrome
npm run manifest:firefox
```

If you would like to create a `.zip` archive of the [src](src) directory for the desired browser.
```shell
npm run build
npm run build:chrome
npm run build:firefox
```

For more information on building, see the scripts in the [package.json](package.json) file.

## Chrome Setup

1.  Build or Download a [Release](https://github.com/cssnr/asn-plus/releases).
1.  Unzip the archive, place the folder where it must remain and note its location for later.
1.  Open Chrome, click the `3 dots` in the top right, click `Extensions`, click `Manage Extensions`.
1.  In the top right, click `Developer Mode` then on the top left click `Load unpacked`.
1.  Navigate to the folder you extracted in step #3 then click `Select Folder`.

## Firefox Setup

Note: Firefox Temporary addon's will **not** remain after restarting Firefox, therefore;
it is very useful to keep addon storage after uninstall/restart with `keepStorageOnUninstall`.

1.  Build or Download a [Release](https://github.com/cssnr/asn-plus/releases).
1.  Unzip the archive, place the folder where it must remain and note its location for later.
1.  Go to `about:debugging#/runtime/this-firefox` and click `Load Temporary Add-on...`
1.  Navigate to the folder you extracted earlier, select `manifest.json` then click `Select File`.
1.  Open `about:config` search for `extensions.webextensions.keepStorageOnUninstall` and set to `true`.

If you need to test a restart, you must pack the addon. This only works in ESR, Development, or Nightly.

1.  Run `npm run build:firefox` then use `web-ext-artifacts/{name}-firefox-{version}.zip`.
1.  Open `about:config` search for `xpinstall.signatures.required` and set to `false`.
1.  Open `about:addons` and drag the zip file to the page or choose Install from File from the Settings wheel.
