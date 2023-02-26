from X import X

X('fisher install jorgebucaran/nvm.fish')

X('set -U nvm_default_version latest')
X('set -U nvm_default_packages pnpm')
X('mkdir $PNPM_HOME')

X('nvm install latest; npm install -g npm')

