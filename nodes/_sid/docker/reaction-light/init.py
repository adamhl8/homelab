from hl_helpers import substitute_vars


def main():
    substitute_vars("~/docker/reaction-light/config.ini", ["reaction_light_token"])


if __name__ == "__main__":
    main()
