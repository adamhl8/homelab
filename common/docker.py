import platform
from X import X

os_name = platform.freedesktop_os_release()['ID']

X('sudo apt install ca-certificates curl gnupg lsb-release -y')
X('sudo mkdir -p /etc/apt/keyrings')
X(f'curl -fsSL https://download.docker.com/linux/{os_name}/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg')
X(f"""echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/{os_name} $(lsb_release -cs | string replace bookworm bullseye) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null""")
X('sudo apt update')
X('sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y')
X('sudo usermod -aG docker $USER')