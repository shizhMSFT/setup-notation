const os = require('os');
const core = require('@actions/core');
const tc = require('@actions/tool-cache');

// Map arch to go releaser arch
// Reference: https://nodejs.org/api/os.html#os_os_arch
function mapArch(arch) {
  const mappings = {
    arm: 'armv7',
    x64: 'amd64'
  };
  return mappings[arch] || arch;
}

// Map os to go releaser os
// Reference: https://nodejs.org/api/os.html#os_os_platform
function mapOS(os) {
  const mappings = {
    win32: 'windows'
  };
  return mappings[os] || os;
}

// Get the URL to download asset
function getDownloadURL(version) {
  const platform = os.platform();
  const filename = `notation_${version}_${mapOS(platform)}_${mapArch(os.arch())}`;
  const extension = platform === 'win32' ? 'zip' : 'tar.gz';
  return `https://github.com/notaryproject/notation/releases/download/v${version}/${filename}.${extension}`;
}

// Download and install Notation CLI of the specified version
async function setup() {
  try {
    // Download Notation CLI of the specified version
    const url = core.getInput('url');
    if (url === '') {
        const version = core.getInput('version');
        const donwloadURL = getDownloadURL(version)
    } else {
        const donwloadURL = url
    }
    const assetPath = await tc.downloadTool(donwloadURL);

    // Extract the tarball/zipball onto host runner
    const extract = donwloadURL.endsWith('.zip') ? tc.extractZip : tc.extractTar;
    const pathToCLI = await extract(assetPath);

    // Expose the tool by adding it to the PATH
    core.addPath(pathToCLI);
  } catch (e) {
    core.setFailed(e);
  }
}

module.exports = setup

if (require.main === module) {
  setup();
}