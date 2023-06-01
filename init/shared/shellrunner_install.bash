homelab_root="${homelab_root:?}"

pip3 install --upgrade pip
pip3 install -U python-shellrunner

pth_file="$(python3 -c "import sysconfig; print(sysconfig.get_path('purelib'))")/homelab_lib.pth"
echo "${homelab_root}/lib/" | sudo tee "${pth_file}" >/dev/null
echo "Added homelab/lib/ to python search path."
