# docs/move_ideas.md



## water
chill out (utility)
  [from active]
    apply 1 cooldown to target move.
    apply 3 cooldown to this move.
    if chained:
      +1 base damage to all moves chained after this
  [while on cooldown]
    if another move gains cooldown:
      reduce cooldown on this move by 1

channel (utility)
  [from active]
    apply choice of 1-3 cooldown to this move.
  [while on cooldown]
    if another entity attuned to an element:
      apply attunement of said element onto self.

## stone
bore out (attack)
  [from active]
    bury this move (move it to banked)
  [from banked]
    activate this move.
    attune caster to stone.
    apply 1 cooldown to this move.
  [while banked]
    when this move becomes activated by self or other effect:
      loop: (iterations = times this move has been activated this match)
        deal 1 stone damage to all entities

rock swap (utility)
  [from active]
    target entity buries a move of their choice.
    if a water, stone, or plant move is buried this way:
      entity activates any move other than the just-buried move
    apply 1 cooldown to this move.

## fire


## plant


## vital


## force
see through (utility)
  [from active]
    loopable:
      reveal target move from any zone.
      apply 1 energy to move's owner.

show off (attack)
  [from active]
    attune caster to force.
    reveal any number of active hidden moves you own.
    deal x force damage where x = 2 * moves revealed this way.

## thunder


