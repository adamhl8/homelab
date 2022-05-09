#!/bin/bash

mkdir ~/bin/

sudo apt install git htop zip unzip -y

echo "alias l='LC_COLLATE=C ls -ahlF'" | tee -a ~/.bash_aliases

tee ~/bin/x << 'EOF'
#!/bin/bash
chmod +x $1
source $1
EOF
chmod 755 ~/bin/x