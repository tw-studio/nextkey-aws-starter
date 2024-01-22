#!/bin/bash
#
# push-private-to-public.sh
# Pushes the latest changes to a public remote in a custom Git workflow.

# |0| Set errexit and start time
set -e # enable errexit
START_TIME=$(date +%s)

# |1| Prepare formatting variables
# Colors
blue="\033[0;34m"
color_reset="\033[0m"
cyan="\033[0;36m"
green="\033[0;32m"
red="\033[0;31m"
white="\033[0;37m"
yellow="\033[0;33m"
# Content
arrow="\xE2\x86\x92"
checkmark="\xE2\x9C\x94"
chevron="\xE2\x80\xBA"
done="done"
info="info"
success="Success!"
xmark="\xE2\x9C\x97"

# |2| Introduction
echo "This script will publish the latest changes in the active development branch to a designated publish remote and branch meant only to hold a cleaned up commit history."
echo ""
echo "This custom Git publishing workflow will:"
echo "- (optional) Fast-forward merge the changes from the active branch into the main branch."
echo "- (optional) Fixup the changes into a single commit."
echo "- (optional) Add an internal tag to the latest commit in the development branch."
echo "- (optional) Add a public-facing tag to the latest commit in the publish branch."
echo "- Designate a publish remote and branch different from the development remote and branch."
echo "- Copy the latest changes from the development branch into the publish branch."
echo "- Fixup the new changes to the publish branch into a single commit."
echo "- Push all changes to their respective remotes and branches."
echo ""
echo -ne "Continue? ${cyan}(Y/n)$color_reset "
read -r YES_RUN_SCRIPT
YES_RUN_SCRIPT=${YES_RUN_SCRIPT:-y}
[[ ! $YES_RUN_SCRIPT =~ ^[yY]$ ]] && exit 1
echo ""

# |3| Confirm git status is clean
if git status --porcelain | grep -q '^[ ]*[AMDRCU\?]'; then
  echo "Uncommitted changes or untracked files are detected in the active branch. Please commit or remove them before trying again."
  exit 1
fi

# |4| Check if branch is already main
INITIAL_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
echo -e "The active branch is $white$INITIAL_BRANCH$color_reset."
echo ""
if [[ "$INITIAL_BRANCH" == main || "$INITIAL_BRANCH" == master ]]; then
  echo -ne "Is this the main development branch (and not a feature branch)? ${cyan}(Y/n)$color_reset "
  read -r YES_THIS_IS_MAIN
  YES_THIS_IS_MAIN=${YES_THIS_IS_MAIN:-y}
  [[ ! $YES_THIS_IS_MAIN =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1
else
  echo -ne "Is this a feature branch? ${cyan}(Y/n)$color_reset "
  read -r YES_IS_FEATURE_BRANCH
  YES_IS_FEATURE_BRANCH=${YES_IS_FEATURE_BRANCH:-y}
  [[ ! $YES_IS_FEATURE_BRANCH =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1

  if [[ $YES_IS_FEATURE_BRANCH =~ ^[nN]$ ]]; then
    echo -ne "Is this the main development branch (and not a feature branch)? ${cyan}(Y/n)$color_reset "
    read -r YES_THIS_IS_MAIN
    YES_THIS_IS_MAIN=${YES_THIS_IS_MAIN:-y}
    [[ ! $YES_THIS_IS_MAIN =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1

    if [[ $YES_THIS_IS_MAIN =~ ^[nN]$ ]]; then
      echo -ne "Is this the publish branch? And do you wish to proceed to publishing to a remote? ${cyan}(Y/n)$color_reset "
      read -r YES_IS_PUBLISH_BRANCH
      YES_IS_PUBLISH_BRANCH=${YES_IS_PUBLISH_BRANCH:-y}
      [[ ! $YES_IS_PUBLISH_BRANCH =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1
      [[ $YES_IS_PUBLISH_BRANCH =~ ^[nN]$ ]] && echo "Branch must be one of these options" && exit 1
    fi
  fi
  
fi

# |5| Merge changes into main
YES_IS_FEATURE_BRANCH=${YES_IS_FEATURE_BRANCH:-n}
YES_THIS_IS_MAIN=${YES_THIS_IS_MAIN:-n}
if [[ $YES_IS_FEATURE_BRANCH =~ ^[yY]$ || $YES_THIS_IS_MAIN =~ ^[yY]$ ]]; then
  if [[ $YES_IS_FEATURE_BRANCH =~ ^[yY]$ ]]; then
    echo -ne "Do you wish to merge the latest changes from $white$INITIAL_BRANCH$color_reset into a main development branch? ${cyan}(Y/n)$color_reset "
    read -r YES_MERGE_TO_MAIN
    YES_MERGE_TO_MAIN=${YES_MERGE_TO_MAIN:-y}
    [[ ! $YES_MERGE_TO_MAIN =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1

    if [[ $YES_MERGE_TO_MAIN =~ ^[yY]$ ]]; then
      echo -ne "Enter the name of the main development branch: ${cyan}(main)$color_reset "
      read -r MAIN_BRANCH
      MAIN_BRANCH=${MAIN_BRANCH:-main}
      if ! git rev-parse --verify $MAIN_BRANCH > /dev/null 2>&1; then
        echo -e "$white$MAIN_BRANCH$color_reset branch can't be found"
        exit 1
      fi
      
      INITIAL_MAIN_HEAD=$(git rev-parse $MAIN_BRANCH 2>/dev/null)
      INITIAL_MERGE_BASE=$(git merge-base $INITIAL_BRANCH $MAIN_BRANCH 2>/dev/null)
      if [[ $INITIAL_MAIN_HEAD != $INITIAL_MERGE_BASE ]]; then
        echo -e "This script only supports fast-forward merges. First merge changes from $white$MAIN_BRANCH$color_reset into $white$INITIAL_BRANCH$color_reset before trying again."
        exit 1
      fi

      echo -e "$cyan$chevron$white git switch $MAIN_BRANCH$color_reset"
      git switch $MAIN_BRANCH
      echo ""

      echo -e "$cyan$chevron$white git merge --ff-only $INITIAL_BRANCH$color_reset"
      git merge --ff-only $INITIAL_BRANCH
      echo ""

      POST_MERGE_MAIN_HEAD=$(git rev-parse $MAIN_BRANCH)
      if [[ $INITIAL_MAIN_HEAD != $POST_MERGE_MAIN_HEAD ]]; then
        echo -ne "Do you wish to fix up the new changes in $white$MAIN_BRANCH$color_reset into a single commit? ${cyan}(Y/n)$color_reset "
        read -r YES_MAIN_FIXUP
        YES_MAIN_FIXUP=${YES_MAIN_FIXUP:-y}
        [[ ! $YES_MAIN_FIXUP =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1
        if [[ $YES_MAIN_FIXUP =~ ^[yY]$ ]]; then
          echo -n "Enter a message to summarize the changes in this commit: "
          read -r MAIN_COMMIT_MESSAGE
          [[ -z $MAIN_COMMIT_MESSAGE ]] && echo "Message can't be empty" && exit 1
          if [[ $MAIN_COMMIT_MESSAGE =~ ^\".+\"$ ]]; then
            # Strip outside quotation marks when given
            MAIN_COMMIT_MESSAGE=${MAIN_COMMIT_MESSAGE:1:-1}
          fi

          echo -e "$cyan$chevron$white git reset --soft $INITIAL_MAIN_HEAD$color_reset"
          git reset --soft $INITIAL_MAIN_HEAD
          echo ""
          
          echo -e "$cyan$chevron$white git commit -m \"$MAIN_COMMIT_MESSAGE\"$color_reset"
          git commit -m "$MAIN_COMMIT_MESSAGE"
          echo ""
        fi
      fi
    else
      MAIN_BRANCH=$INITIAL_BRANCH
    fi
  else
    MAIN_BRANCH=$INITIAL_BRANCH
  fi
  
  # |6| Tag the latest commit
  NEW_MAIN_HEAD=$(git rev-parse $MAIN_BRANCH)
  echo -ne "Do you wish to tag the latest commit in $white$MAIN_BRANCH${color_reset}, such as with an internal version number (ex: #.#.#-dev)? ${cyan}(Y/n)$color_reset "
  read -r YES_MAIN_TAG
  YES_MAIN_TAG=${YES_MAIN_TAG:-y}
  [[ ! $YES_MAIN_TAG =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1

  if [[ $YES_MAIN_TAG =~ ^[yY]$ ]]; then
    echo -n "Enter a tag for the latest commit: "
    read -r MAIN_TAG
    [[ -z $MAIN_TAG ]] && echo "Tag can't be empty" && exit 1

    echo -ne "Annotate the tag with a message? ${cyan}(Y/n)$color_reset "
    read -r YES_MAIN_ANNOTATION
    YES_MAIN_ANNOTATION=${YES_MAIN_ANNOTATION:-y}
    [[ ! $YES_MAIN_ANNOTATION =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1
    
    if [[ $YES_MAIN_ANNOTATION =~ ^[yY]$ ]]; then
      echo -ne "Write an annotation for $white$MAIN_TAG${color_reset}: "
      read -r MAIN_ANNOTATION
      [[ -z $MAIN_ANNOTATION ]] && echo "Annotation can't be empty" && exit 1
      if [[ $MAIN_ANNOTATION =~ ^\".+\"$ ]]; then
        MAIN_ANNOTATION=${MAIN_ANNOTATION:1:-1}
      fi
      
      echo -e "$cyan$chevron$white git tag -a $MAIN_TAG -m \"$MAIN_ANNOTATION\"$color_reset"
      git tag -a $MAIN_TAG -m "$MAIN_ANNOTATION"
      echo ""
    else
      echo -e "$cyan$chevron$white git tag $MAIN_TAG$color_reset"
      git tag $MAIN_TAG
      echo ""
    fi
  fi

  # |7| Push changes so far to remote
  if [[ $YES_MERGE_TO_MAIN =~ ^[yY]$ || $YES_MAIN_TAG =~ ^[yY]$ ]]; then
    PRIVATE_REMOTE=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} | cut -d'/' -f1)
    if [[ -n $PRIVATE_REMOTE ]]; then
      echo -ne "Push the changes in $white$MAIN_BRANCH$color_reset so far to $white$PRIVATE_REMOTE$color_reset? ${cyan}(Y/n)$color_reset "
      read -r YES_PUSH_MAIN
      YES_PUSH_MAIN=${YES_PUSH_MAIN:-y}
      [[ ! $YES_PUSH_MAIN =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1
    else
      echo -e "Upstream remote for $white$MAIN_BRANCH$color_reset is not detected."
      echo -ne "Do you wish to push the changes in $white$MAIN_BRANCH$color_reset so far to a remote? ${cyan}(Y/n)$color_reset "
      read -r YES_PUSH_MAIN
      YES_PUSH_MAIN=${YES_PUSH_MAIN:-y}
      [[ ! $YES_PUSH_MAIN =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1

      if [[ $YES_PUSH_MAIN =~ ^[yY]$ ]]; then
        echo -ne "Enter the remote to push changes to: ${cyan}(origin)$color_reset "
        read -r PRIVATE_REMOTE
        PRIVATE_REMOTE=${PRIVATE_REMOTE:-origin}
      fi
    fi 

    if [[ $YES_PUSH_MAIN =~ ^[yY]$ && -n $PRIVATE_REMOTE ]]; then
      echo -e "$cyan$chevron$white git push $PRIVATE_REMOTE$color_reset"
      git push $PRIVATE_REMOTE
      echo ""
      if [[ $YES_MAIN_TAG =~ ^[yY]$ ]]; then
        echo -e "$cyan$chevron$white git push $PRIVATE_REMOTE refs/tags/$MAIN_TAG$color_reset"
        git push $PRIVATE_REMOTE refs/tags/$MAIN_TAG
        echo ""
      fi
    fi
  fi
fi

# |8| Configure remotes and branches for publish
echo "This script is intended to publish changes to a different remote than that of development."
echo -ne "Is a separate remote repository for published changes already created? ${cyan}(Y/n)$color_reset "
read -r YES_PUBLISH_REPO_CREATED
YES_PUBLISH_REPO_CREATED=${YES_PUBLISH_REPO_CREATED:-y}
[[ ! $YES_PUBLISH_REPO_CREATED =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1
if [[ $YES_PUBLISH_REPO_CREATED =~ ^[nN]$ ]]; then
  echo "Please set up a remote repository that will host the published changes before continuing."
  exit 1
fi

echo -ne "Is a remote already configured to track this repository? ${cyan}(Y/n)$color_reset "
read -r YES_PUBLISH_REMOTE_CREATED
YES_PUBLISH_REMOTE_CREATED=${YES_PUBLISH_REMOTE_CREATED:-y}
[[ ! $YES_PUBLISH_REMOTE_CREATED =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1

if [[ $YES_PUBLISH_REMOTE_CREATED =~ ^[nN]$ ]]; then
  echo -ne "Enter a name for the remote that will be created to track the publish repository: ${cyan}(public)$color_reset "
  read -r PUBLISH_REMOTE
  PUBLISH_REMOTE=${PUBLISH_REMOTE:-public}

  echo -n "Enter the url of the publish repository: "
  read -r PUBLISH_URL
  [[ -z $PUBLISH_URL ]] && echo "Url can't be empty" && exit 1

  echo -e "$cyan$chevron$white git remote add $PUBLISH_REMOTE $PUBLISH_URL$color_reset"
  git remote add $PUBLISH_REMOTE $PUBLISH_URL
  echo ""
else
  echo -ne "Enter the name of the remote that is tracking the publish repository: ${cyan}(public)$color_reset "
  read -r PUBLISH_REMOTE
  PUBLISH_REMOTE=${PUBLISH_REMOTE:-public}
  EXISTING_REMOTES=$(git remote)
  if ! echo "$EXISTING_REMOTES" | grep -qx "$PUBLISH_REMOTE"; then
    echo -e "$white$PUBLISH_REMOTE$color_reset remote not found"
    exit 1
  fi
fi

echo -ne "Is a local branch already configured for publishing changes (important: it should not share common ancestors with other branches)? ${cyan}(Y/n)$color_reset "
read -r YES_PUBLISH_LOCAL_BRANCH_CREATED
YES_PUBLISH_LOCAL_BRANCH_CREATED=${YES_PUBLISH_LOCAL_BRANCH_CREATED:-y}
[[ ! $YES_PUBLISH_LOCAL_BRANCH_CREATED =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1

# |9| Commit changes to publish branch
if [[ $YES_PUBLISH_LOCAL_BRANCH_CREATED =~ ^[nN]$ ]]; then
  echo -ne "Do you wish to create a publish branch now? This will add all files from $white$MAIN_BRANCH$color_reset into a single commit in the new branch. ${cyan}(Y/n)$color_reset "
  read -r YES_CREATE_PUBLISH_BRANCH
  YES_CREATE_PUBLISH_BRANCH=${YES_CREATE_PUBLISH_BRANCH:-y}
  [[ ! $YES_CREATE_PUBLISH_BRANCH =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1
  if [[ $YES_CREATE_PUBLISH_BRANCH =~ ^[nN]$ ]]; then
    echo "A publish branch must exist for this script to continue."
    exit 1
  fi

  echo -ne "Enter a name for the local publish branch: ${cyan}(public)$color_reset "
  read -r PUBLISH_LOCAL_BRANCH
  PUBLISH_LOCAL_BRANCH=${PUBLISH_LOCAL_BRANCH:-public}

  echo -n "Enter a message to summarize the first commit: "
  read -r PUBLISH_COMMIT_MESSAGE
  [[ -z $PUBLISH_COMMIT_MESSAGE ]] && echo "Message can't be empty" && exit 1
  if [[ $PUBLISH_COMMIT_MESSAGE =~ ^\".+\"$ ]]; then
    PUBLISH_COMMIT_MESSAGE=${PUBLISH_COMMIT_MESSAGE:1:-1}
  fi
  
  echo -e "$cyan$chevron$white git checkout --orphan $PUBLISH_LOCAL_BRANCH$color_reset"
  git checkout --orphan $PUBLISH_LOCAL_BRANCH
  echo ""
  echo -e "$cyan$chevron$white git add -A$color_reset"
  git add -A
  echo ""
  echo -e "$cyan$chevron$white git commit -m \"$PUBLISH_COMMIT_MESSAGE\"$color_reset"
  git commit -m "$PUBLISH_COMMIT_MESSAGE"
  echo ""
else
  echo -ne "Enter the name of the local publish branch: ${cyan}(public)$color_reset "
  read -r PUBLISH_LOCAL_BRANCH
  PUBLISH_LOCAL_BRANCH=${PUBLISH_LOCAL_BRANCH:-public}
  [[ -z $PUBLISH_LOCAL_BRANCH ]] && echo "Branch name can't be empty" && exit 1
  if ! git rev-parse --verify $PUBLISH_LOCAL_BRANCH 2>/dev/null; then
    echo "Branch can't be found"
    exit 1
  fi

  echo -e "$cyan$chevron$white git switch $PUBLISH_LOCAL_BRANCH$color_reset"
  git switch $PUBLISH_LOCAL_BRANCH
  echo ""

  echo -ne "To cherry-pick changes from $white$MAIN_BRANCH$color_reset into $white$PUBLISH_LOCAL_BRANCH$color_reset, you need to identify the starting point of these changes since the last time changes were cherry-picked from $white$MAIN_BRANCH$color_reset. This requires the commit reference (hash or tag) that directly precedes the first of the new changes. To assist in identifying this commit, you might find it helpful to use a Git commit history visualizer, like Git Graph in VSCode, which provides a clearer view of the chronological history of commits across branches. If you haven't cherry-picked into $white$PUBLISH_LOCAL_BRANCH$color_reset before, please provide the hash of the initial commit of $white$MAIN_BRANCH$color_reset, appending a '^', to include the very first commit in the cherry-pick: "
  read -r CHERRY_PICK_START
  [[ -z $CHERRY_PICK_START ]] && echo "Commit reference can't be empty" && exit 1

  echo -ne "Proceed with cherry-picking changes from $white$MAIN_BRANCH$color_reset to $white$PUBLISH_LOCAL_BRANCH$color_reset? ${cyan}(Y/n)$color_reset "
  read -r YES_RUN_CHERRY_PICK
  YES_RUN_CHERRY_PICK=${YES_RUN_CHERRY_PICK:-y}
  [[ ! $YES_RUN_CHERRY_PICK =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1
  [[ $YES_RUN_CHERRY_PICK =~ ^[nN]$ ]] && echo "Aborted" && exit 1

  INITIAL_PUBLISH_HEAD=$(git rev-parse $PUBLISH_LOCAL_BRANCH)

  if [[ ${CHERRY_PICK_START: -1} == "^" ]]; then
    echo -e "$cyan$chevron$white git cherry-pick $CHERRY_PICK_START$color_reset"
    git cherry-pick $CHERRY_PICK_START
    echo ""
  fi
  
  echo -e "$cyan$chevron$white git cherry-pick $CHERRY_PICK_START..$NEW_MAIN_HEAD --strategy-option=theirs --allow-empty --keep-redundant-commits$color_reset"
  git cherry-pick $CHERRY_PICK_START..$NEW_MAIN_HEAD --strategy-option=theirs --allow-empty --keep-redundant-commits
  echo ""

  echo -ne "Do you wish to fix up the new changes in $white$PUBLISH_LOCAL_BRANCH$color_reset into a single commit? ${cyan}(Y/n)$color_reset " 
  read -r YES_PUBLISH_FIXUP
  YES_PUBLISH_FIXUP=${YES_PUBLISH_FIXUP:-y}
  [[ ! $YES_PUBLISH_FIXUP =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1

  if [[ $YES_PUBLISH_FIXUP =~ ^[yY]$ ]]; then
    echo -n "Enter a message to describe the single commit: "
    read -r PUBLISH_COMMIT_MESSAGE
    [[ -z $PUBLISH_COMMIT_MESSAGE ]] && echo "Message can't be empty" && exit 1
    if [[ $PUBLISH_COMMIT_MESSAGE =~ ^\".+\"$ ]]; then
      PUBLISH_COMMIT_MESSAGE=${PUBLISH_COMMIT_MESSAGE:1:-1}
    fi

    echo -e "$cyan$chevron$white git reset --soft $INITIAL_PUBLISH_HEAD$color_reset"
    git reset --soft $INITIAL_PUBLISH_HEAD
    echo ""
    
    echo -e "$cyan$chevron$white git commit -m \"$PUBLISH_COMMIT_MESSAGE\"$color_reset"
    git commit -m "$PUBLISH_COMMIT_MESSAGE"
    echo ""
  fi
fi

# |10| Tag commit
echo -ne "Do you wish to tag the latest commit, such as with a version number (ex: #.#.#)? ${cyan}(Y/n)$color_reset "
read -r YES_PUBLISH_TAG
YES_PUBLISH_TAG=${YES_PUBLISH_TAG:-y}
[[ ! $YES_PUBLISH_TAG =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1
if [[ $YES_PUBLISH_TAG =~ ^[yY]$ ]]; then
  echo -n "Enter a tag for the latest commit: "
  read -r PUBLISH_TAG
  [[ -z $PUBLISH_TAG ]] && echo "Tag can't be empty" && exit 1

  echo -ne "Annotate the tag with a message? ${cyan}(Y/n)$color_reset "
  read -r YES_ANNOTATE_PUBLISH_TAG
  YES_ANNOTATE_PUBLISH_TAG=${YES_ANNOTATE_PUBLISH_TAG:-y}
  [[ ! $YES_ANNOTATE_PUBLISH_TAG =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1

  if [[ $YES_ANNOTATE_PUBLISH_TAG =~ ^[yY]$ ]]; then
    echo -ne "Write an annotation for $white$PUBLISH_TAG${color_reset}: "
    read -r PUBLISH_ANNOTATION
    [[ -z $PUBLISH_ANNOTATION ]] && echo "Annotation can't be empty" && exit 1
    if [[ $PUBLISH_ANNOTATION =~ ^\".+\"$ ]]; then
      PUBLISH_ANNOTATION=${PUBLISH_ANNOTATION:1:-1}
    fi

    echo -e "$cyan$chevron$white git tag -a $PUBLISH_TAG -m \"$PUBLISH_ANNOTATION\"$color_reset"
    git tag -a $PUBLISH_TAG -m "$PUBLISH_ANNOTATION"
    echo ""
  else
    echo -e "$cyan$chevron$white git tag $PUBLISH_TAG$color_reset"
    git tag $PUBLISH_TAG
    echo ""
  fi
fi

# |11| Push to remote
echo -e "The branch on the remote $white$PUBLISH_REMOTE$color_reset that will receive the published changes can have a different name (ex: main)."
echo -ne "Enter the name of the branch on $white$PUBLISH_REMOTE$color_reset which will receive the published changes (it will be created if it doesn't exist): ${cyan}(main)$color_reset "
read -r PUBLISH_REMOTE_BRANCH
PUBLISH_REMOTE_BRANCH=${PUBLISH_REMOTE_BRANCH:-main}

echo -ne "(last step) Do you wish to push this commit to $white${PUBLISH_REMOTE}:${PUBLISH_REMOTE_BRANCH}${color_reset}? ${cyan}(Y/n)$color_reset "
read -r YES_PUSH_TO_PUBLISH
YES_PUSH_TO_PUBLISH=${YES_PUSH_TO_PUBLISH:-y}
[[ ! $YES_PUSH_TO_PUBLISH =~ ^[yYnN]$ ]] && echo "Invalid input" && exit 1
[[ $YES_PUSH_TO_PUBLISH =~ ^[nN]$ ]] && echo "Aborted" && exit 1

echo -e "$cyan$chevron$white git push $PUBLISH_REMOTE ${PUBLISH_REMOTE}:${PUBLISH_REMOTE_BRANCH}$color_reset"
git push $PUBLISH_REMOTE ${PUBLISH_REMOTE}:${PUBLISH_REMOTE_BRANCH}
echo ""

if [[ $YES_PUBLISH_TAG =~ ^[yY]$ ]]; then
  echo -e "$cyan$chevron$white git push $PUBLISH_REMOTE refs/tags/$PUBLISH_TAG$color_reset"
  git push $PUBLISH_REMOTE refs/tags/$PUBLISH_TAG
  echo ""
fi

# |12| Done
END_TIME=$(date +%s)
RUN_TIME=$((END_TIME - START_TIME))
echo ""
echo "Done in ${RUN_TIME}s."
