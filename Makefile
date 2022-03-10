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

challenge081:
	@echo "Compiling challenge081..."
	@npm ci
	@printf "#!/bin/sh\n npm run --silent start" > mylox
	@chmod +x mylox
	@echo "Done."

challenge08O:
	@echo "Compiling challenge08O..."
	@npm ci
	@printf "#!/bin/sh\n npm run --silent start \$$1" > mylox

challenge093:
	@echo "Compiling challenge093..."
	@npm ci
	@printf "#!/bin/sh\n npm run --silent start \$$1" > mylox
	@chmod +x mylox
	@echo "Done."

challenge09O:
	@echo "Compiling challenge09O..."
	@npm ci
	@printf "#!/bin/sh\n npm run --silent start \$$1" > mylox
	@chmod +x mylox
	@echo "Done."