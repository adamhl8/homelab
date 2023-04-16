def main():
    from shellrunner import X

    X("curl -sL https://raw.githubusercontent.com/jorgebucaran/fisher/main/functions/fisher.fish | source && fisher install jorgebucaran/fisher")
    X("fisher install IlanCosman/tide@v5")
    X("echo 2 1 4 3 1 1 1 1 1 1 y | tide configure >/dev/null")
