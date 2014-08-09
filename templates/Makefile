MOD = <%= name %>

NPM = npm
BROWSERIFY = ./node_modules/browserify/bin/cmd.js
JSHINT = ./node_modules/jshint/bin/jshint
JSCS = ./node_modules/jscs/bin/jscs
MOCHA = ./node_modules/mocha/bin/_mocha
UGLIFY = ./node_modules/uglify-js/bin/uglifyjs

BUILD_DIR = build

SRC_FILES = index.js lib/version.js $(shell find lib -type f -name '*.js')
TEST_FILES = $(shell find test -type f -name '*.js')
BUILD_FILES = $(addprefix $(BUILD_DIR)/, $(MOD).js $(MOD).min.js)

.PHONY: all clean

all: $(BUILD_FILES)

lib/version.js: package.json
	src/version.js > $@

build/$(MOD).js: browser.js $(SRC_FILES) $(TEST_FILES) node_modules | build
	$(MOCHA) $(TEST_FILES)
	$(JSHINT) $(filter-out node_modules, $?) 
	$(JSCS) $(filter-out node_modules, $?) 
	$(BROWSERIFY) $< > $@

build/$(MOD).min.js: build/$(MOD).js
	$(UGLIFY) $< --comments '@license' > $@

build:
	mkdir $@

clean:
	rm -rf $(BUILD_DIR)

node_modules: package.json
	$(NPM) install
	touch $@
