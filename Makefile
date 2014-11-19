# BIN = ./node_modules/.bin
BROWSERIFY_PATH = ./node_modules/.bin/browserify
.PHONY: test clean dist

dist:
	rm -rf dist
	mkdir dist
	cd dist && .$(BROWSERIFY_PATH) ../index.js > compose-shell.js
	cd dist && .$(BROWSERIFY_PATH) ../index.js -d -p [minifyify --map compose-shell.map.json --output compose-shell.map.json] > compose-shell.min.js
	cp shell.css dist/

test:
	@npm test

define release
	VERSION=`node -pe "require('./package.json').version"` && \
	NEXT_VERSION=`node -pe "require('semver').inc(\"$$VERSION\", '$(1)')"` && \
	node -e "\
		var j = require('./package.json');\
		j.version = \"$$NEXT_VERSION\";\
		var s = JSON.stringify(j, null, 2);\
		require('fs').writeFileSync('./package.json', s);" && \
	git commit -m "Version $$NEXT_VERSION" -- package.json && \
	git tag "$$NEXT_VERSION" -m "Version $$NEXT_VERSION"
endef

release-patch: test
	@$(call release,patch)

release-minor: test
	@$(call release,minor)

release-major: test
	@$(call release,major)

publish:
	git push
	git push --tags origin HEAD:master
	npm publish