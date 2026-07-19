# Security Specification for Enriched Words

## Data Invariants
1. A word document must be keyed by the word itself.
2. A word document must contain meaning, synonyms, example, and mnemonic.
3. Synonyms must be a list of strings.

## The Dirty Dozen Payloads
- P1: Word with 1MB meaning (Resource Poisoning)
- P2: Word with empty synonyms (Schema breach)
- P3: Word with non-string synonyms (Type breach)
- P4: Random document ID not matching word field (Identity breach)
- P5: Update of an existing word with junk data (State poisoning)

## Security Rules Strategy
- `read`: Public (everyone benefits from the cache).
- `create`: Any authenticated user can contribute.
- `update`: Denied (once enriched, it's locked to prevent tampering, or maybe allow if data is better? No, let's keep it locked for now to prevent spam).
- `delete`: Denied.
