homelab_root="${homelab_root:?}"

brew install python@3.11
pip install --upgrade pip
pip install -U python-shellrunner

pth_file="$(python -c "import sysconfig; print(sysconfig.get_path('purelib'))")/homelab_lib.pth"
echo "${homelab_root}/lib/" | sudo tee "${pth_file}" >/dev/null
echo "Added homelab/lib/ to python search path."
