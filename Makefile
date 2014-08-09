JSHINT = node_modules/jshint/bin/jshint
JSCS = node_modules/jscs/bin/jscs

.PHONY: all test lint

all: test

test: lint

lint: lib/cli.js lib/input.js
	$(JSHINT) $?
	$(JSCS) $?
