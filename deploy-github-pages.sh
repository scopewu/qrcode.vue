#!/usr/bin/env sh

# abort on errors
set -e

rm -rf example/dist

# build
yarn webpack --mode=production

# navigate into the build output directory
cd example/dist

git init
git add -A
git commit -m 'deploy GitHub pages'

git push -f https://github.com/scopewu/qrcode.vue.git master:gh-pages

cd -
