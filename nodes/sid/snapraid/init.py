from X import X
from run import MODULES

X(f'ln -s {MODULES}/snapraid/ ~/')

# snapraid
X('~/bin/snapraid-update')