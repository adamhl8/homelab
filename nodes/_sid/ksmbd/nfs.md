sudo apt install nfs-kernel-server
sudo systemctl enable --now nfs-server
echo '/mnt/storage 10.8.8.0/24(rw,insecure,sync,no_subtree_check,all_squash,anonuid=1000,anongid=1000,fsid=1)' | sudo tee -a /etc/exports >/dev/null
sudo exportfs -arv

# https://serverfault.com/questions/240897/how-to-properly-set-permissions-for-nfs-folder-permission-denied-on-mounting-en/241272
