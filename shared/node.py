from shellrunner import X


def main():
    X("fisher install jorgebucaran/nvm.fish")

    X("set -U nvm_default_version latest")
    X("set -U nvm_default_packages pnpm")
    X("mkdir -p $PNPM_HOME")

    X(["nvm install latest", "npm install -g npm"])


def setup_pnpm():
    X("pnpm config set enable-pre-post-scripts=true")
    X("pnpm add -g npm-check-updates")
    X("pnpm login")