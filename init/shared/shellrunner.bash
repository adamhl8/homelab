homelab_root="${homelab_root:?}"

purelib_path="$(python -c "import sysconfig; print(sysconfig.get_path('purelib'))")"

rye install -f shellrunner
shellrunner_pth_file="${purelib_path}/shellrunner.pth"
echo "${HOME}/.rye/tools/shellrunner/lib/python3.12/site-packages" | sudo tee "${shellrunner_pth_file}" > /dev/null
echo "Added shellrunner to python search path."

homelab_pth_file="${purelib_path}/homelab_lib.pth"
echo "${homelab_root}/lib/" | sudo tee "${homelab_pth_file}" > /dev/null
echo "Added homelab/lib/ to python search path."
