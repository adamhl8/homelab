# gbc
tee ~/bin/gbc << 'EOF'
#!/bin/bash

branches=$(git branch -vv | grep ': gone]' | awk '{if ($1 == "*") {print $2} else {print $1} }')
git fetch -p && for branch in $branches; do git branch -D $branch; done
EOF
chmod 755 ~/bin/gbc

# gsync
tee ~/bin/gsync << 'EOF'
#!/bin/bash

originBranch=$(git remote show origin | awk '/HEAD branch/ {print $NF}')
git pull --rebase && git fetch origin $originBranch && git rebase origin/$originBranch
EOF
chmod 755 ~/bin/gsync

# gusync
tee ~/bin/gusync << 'EOF'
#!/bin/bash

upstreamBranch=$(git remote show upstream | awk '/HEAD branch/ {print $NF}')
git pull --rebase && git fetch upstream $upstreamBranch && git rebase upstream/$upstreamBranch
EOF
chmod 755 ~/bin/gusync

# gaddupstream
tee ~/bin/gaddupstream << 'EOF'
#!/bin/bash

if ! command -v jq &> /dev/null
then
  while true; do
      read -r -p "jq not found. Install now? (Y/N): " answer
      case $answer in
          [Yy]* ) sudo apt install jq -y; break;;
          [Nn]* ) exit;;
          * ) echo "Please answer Y or N.";;
      esac
  done
fi

if ! command -v jq &> /dev/null
then
  echo "jq did not install correctly. Please try again."
  exit
fi

url=$(git remote get-url origin)
repoWithOwnerExt=${url#*github.com[/:]}
repoWithOwner=${repoWithOwnerExt%.git}
remote=$(curl -s "https://api.github.com/repos/$repoWithOwner" | jq -r '.parent.clone_url')
if [ "$remote" != "null" ]; then
  git remote add upstream $remote
  echo "added upstream: $remote"
else
  echo "no upstream found"
fi
EOF
chmod 755 ~/bin/gaddupstream