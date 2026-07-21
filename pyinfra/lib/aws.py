from lib.fs import Dest, put_files
from lib.paths import HOME, SHARED_FILES


def aws_profile() -> None:
    put_files(
        {
            SHARED_FILES / "aws_config": Dest(HOME / ".aws/config", mode="600"),
            SHARED_FILES / "aws_credentials": Dest(HOME / ".aws/credentials", mode="600"),
        },
        dir_mode="700",
    )
