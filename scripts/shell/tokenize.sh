#!/bin/bash

DOC_PATH=$1

sed -i -e s/👶/%introduction%/g $DOC_PATH
sed -i -e s/✨/%new%/g $DOC_PATH
sed -i -e s/💪/%workout%/g $DOC_PATH
sed -i -e s/🦑/%deep%/g $DOC_PATH
sed -i -e s/🐉/%obscura%/g $DOC_PATH
