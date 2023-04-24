homelab_root="${homelab_root:?}"

export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
pyenv install -s 3.10
pyenv global 3.10
pip install --upgrade pip
pip install -U python-shellrunner

pth_file="$(python -c "import sysconfig; print(sysconfig.get_path('purelib'))")/homelab_lib.pth"
echo "${homelab_root}/lib/" | sudo tee "${pth_file}" >/dev/null
echo "Added homelab/lib/ to python search path."
