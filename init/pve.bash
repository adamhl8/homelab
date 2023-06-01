shared="${shared:?}"

rm -rf ~/python/
curl -s https://api.github.com/repos/indygreg/python-build-standalone/releases/latest | grep -o -E "https://(.*)/download/(.*)cpython-3.11(.*)x86_64_v4-unknown-linux-gnu-install_only.tar.gz" | sed 1q | xargs curl -Lo ~/python.tar.gz
tar -vxzf ~/python.tar.gz
rm ~/python.tar.gz
echo 'export PATH="$HOME/python/bin:$PATH"' >>~/.bashrc
source ~/.bashrc
ln -f -rs ~/python/bin/python3 ~/python/bin/python

# shellcheck source=./shared/shellrunner_install.bash
source "${shared}/shellrunner_install.bash"
