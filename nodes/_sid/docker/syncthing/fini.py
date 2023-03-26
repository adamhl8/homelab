from time import sleep

from shellrunner import X

print("Waiting for Syncthing to start...")
sleep(5)
# Set insecureAdminAccess
X(
    r"sed -i '\|<address>127\.0\.0\.1.*</address>|a\        <insecureAdminAccess>true</insecureAdminAccess>' ~/apps/syncthing/data/config/config.xml",
)
X("docker restart syncthing")
