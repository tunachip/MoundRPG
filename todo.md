## TODO

### src/combat/operation/cooldown.ts
- [ ] Emit Trigger 'pre:move:leaveCooldown' [[src/combat/operation/cooldown.ts#L68]]

### src/combat/operation/logic.ts
- [ ] create operation resolution logic [[src/combat/operation/logic.ts#L13]]

### src/content/moves/types.ts
- [ ] Update these to use 'ConditionalOperationDefinition' [[src/content/moves/types.ts#L49]]


## Notes

```
New Systems:
1. Companion Entities
Limited Move-Pool Entities which fight in combat & offer upgrade-abilities

Example:

'Fire Keeper'
[HP: 10/10]
Moves:
  'Kindle Fire':
    extend 1 burn. if target attuned to plant, repeat.
  'Hot Shot':
    deal 1 fire damage. Heat 1. Overheat: Apply 1 Burn to target.
Non-Combat Effects:
  Player may Sacrifice Items for Essence during Upgrade Screen

2. Summoned Entities
Agentic Entities which you Summon with Moves

examples available in docs
```
