mylox053:
	@echo "Compiling mylox053..."
	@npm ci
	@printf "#!/bin/sh\n npm run --silent start rpn no-output" > mylox
	@chmod +x mylox
	@echo "Done."

mylox062:
	@echo "Compiling mylox062..."
	@npm ci
	@printf "#!/bin/sh\n npm run --silent start" > mylox
	@chmod +x mylox
	@echo "Done."

mylox071:
	@echo "Compiling mylox071..."
	@npm ci
	@printf "#!/bin/sh\n npm run --silent start" > mylox
	@chmod +x mylox
	@echo "Done."