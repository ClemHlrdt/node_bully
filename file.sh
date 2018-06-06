#!/bin/bash
i="0"

while [ $i -lt 100 ]
do
echo "Hello World" &
i=$[$i+1]
done