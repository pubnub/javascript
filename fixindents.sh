find . -name "*.js" -exec sed -i -e "s/\t/    /g"  {} \;
find . -name "*.html" -exec sed -i -e "s/\t/    /g"  {} \;
find . -name "*.html" -exec sed -i 's/[ \t]*$//'  {} \;
find . -name "*.js" -exec sed -i 's/[ \t]*$//'  {} \;
