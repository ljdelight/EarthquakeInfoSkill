
.PHONY: final
final: index.zip
	@echo Build complete. Upload the zip to AWS Lambda.

index.zip: src/AlexaSkill.js src/index.js
	zip --junk-paths $@ $<

.PHONY: clean
clean:
	-rm -f index.zip
