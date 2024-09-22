from hl_helpers import homelab_paths as paths
from shellrunner import X


def step1() -> None:
    X("apt install smartmontools -y")
    X("mkdir -p /opt/scrutiny/bin/")
    X(
        "curl -Lo /opt/scrutiny/bin/collector https://github.com/analogj/scrutiny/releases/latest/download/scrutiny-collector-metrics-linux-amd64",
    )
    X("chmod +x /opt/scrutiny/bin/collector")
    X(
        "echo '*/15 * * * * root /opt/scrutiny/bin/collector run --api-endpoint https://scrutiny.adamhl.dev >/dev/null 2>&1' | tee -a /etc/crontab >/dev/null",  # noqa: E501
    )
