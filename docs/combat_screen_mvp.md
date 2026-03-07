# UI

##  entity state textbox
  1. name
  1. [ hp / maxHp ]
  1. [ energy / maxEnergy ]
  1. [ attunedTo (as icons/colored glyphs) ]
  1. [ hasStatus (as icons/colored gylphs) ]
  on hover, attunedTo shows turnsAttuned
  on hover, hasStatus shows statusTurns

## move state textboxes

### Active Move, isHidden === true
  textbox yields any information which has been revealed
  examples:
  1. on activation, entities attune to the element of the move
  1. on using a 'peek' effect, details of a move will show as a dim preview which un-dims on hover
  1. on using a move that checks if a move is an attack or utility, the discovered truth will show (there are only 2 move types)

### Active Move, isHidden === false
  1. name
  1. type
  1. element
  1. operations (as a custom parser-generated human-readable textbox)
if onCooldown:
  1. cooldown turns
if bound:
  1. bound

### Banked Move, isHidden === true
  shows as a box with no details

### Banked Move, isHidden === false
  same as active move, but dimmed and in a different zone

## blessing state textbox
  1. name
  1. operations (as a custom parser-generated human-readable textbox)
if onCooldown:
  1. cooldownTurns

## primary interface

we are building an interface inspired by games like pokemon, dragonquest, etc
simple ui state boxes
a text box prompting users for actions, and then relaying the effects of combat as text.
another text box to the right which shows options as lists
visual representations of the list are graphically highlighted as the cursor in the list corresponds to them

### prompt / list sets

cursor skips grayed out lines

1. turn choice

#prompt:
[with no actions chosen]
  'Choose a Turn Action:'
[with one or more actions chosen]
  'action_1 --> action_2 --> ...'
  'Choose Actions or Submit Turn'
#list: 
[with no actions chosen]
  '1. activate move' <-- grayed out if all active move slots are full
  '2. cast move'     <-- grayed out if all moves are invalid choices
  '3. focus'
  '4. submit'        <-- grayed out if no move choices have been made
[with one or more actions chosen]
  '1. activate move' <-- grayed out (can only be the first action)
  '2. cast move'     <-- grayed out if all moves are invalid choices
  '3. focus'         <-- grayed out (can only be the first and only action)
  '4. submit'

# activate move
#prompt
[with no actions chosen]
  'Move Name  [ .element .type ]'
  '-----------------------------'
  'Description'
#list
These entries only show if there are so many moves
Moves which cannot be activated because they are bound / onCooldown are grayed out
  '1. Banked Move 1'
  '2. Banked Move 2'
  '3. Banked Move 3'
  '4. Banked Move 4'
  '5. Banked Move 5'
  '6. Banked Move 6'

# cast move
#prompt
[with no actions chosen]
  'Move Name  [ .element .type ]'
  '-----------------------------'
  'Description'
[with prior actions chosen]
  'Move Name  [ .element .type ]'
  '-----------------------------'
  'Description'
  '[ Current Energy/HP Cost to Chain ]'
#list
These entries only show if there are so many moves
Moves which cannot be cast because they are onCooldown / cost too much energy are grayed out
  '1. Banked Move 1'
  '2. Banked Move 2'
  '3. Banked Move 3'
  '4. Banked Move 4'
  '5. Banked Move 5'
  '6. Banked Move 6'

# focus
This prompt will be skipped if no other actions are possible
#prompt
  'Skip your turn to Gain 1 Energy?'
#list
  '1. yes'
  '2. no'

### Combat Event Feedback
We want players to know how combat is going
We will feed them info in the prompt textbox as things happen so they can keep up
Here are some examples of what this looks like.
Notice that effects are phrased as attempts before the logic resolves, and then as past tense after effects resolve.

# activateMove
'${ctx.caster.name} activated a move'
'${ctx.caster.name} attuned to ${ctx.move.element}'

# cast
'${ctx.caster.name} is casting ${ctx.move.name}'
Followed by the effects of the move, such as...

# applyStatus
'${ctx.target.name} gained ${ctx.amount} ${ctx.status}!'

# attack
'${ctx.caster.name} is attacking ${ctx.target.name} for ${ctx.baseDamage} ${ctx.element} damage...'
Followed by the results of the attack...

# resolveDamage
'${ctx.target.name} took ${ctx.calculatedDamage} damage!'

# interrupter
Hypothetical Listener which triggered as someone tried to deal fire damage to a target
In this case, the result is that damage was prevented and the blessing was put on cooldown 3.
'${ctx.target.name}'s blessing {ctx.blessing.name} activated...'
'${ctx.target.name} took 0 damage!'
'${ctx.blessing.name} gained 3 cooldown'

# responder
Hypothetical Listener which triggered as a side effect of a move coming off of cooldown
In this case, the owner deals double damage this turn
'${ctx.target.name}'s move {ctx.move.name} came off cooldown'
'${ctx.target.name}'s blessing {ctx.blessing.name} activated...'
'Until end of turn, ${ctx.target.name}'s Moves Deal Double Damage!'

