# Element Roles in Energy Production


## What is Energy Production?
Energy is a CombatEntity attribute which effects move logic, pays for costs, and allows for move chaining.  
By Default, Entities gain 1 Energy at the Start of the Turn Loop.  
The only exception: On turn 1, the Entity with Priority does not.  

## Water
Energy Spending Element.  
Could use more development, but focuses on Cooldown over Energy for now.

## Stone
Energy Spending Element.  
Could use more development, but focuses on Cooldown over Energy for now.

## Fire
Energy Used as an Effect Threshold.  
Provides Extra Energy for Self & Others, but often uses it.
- 'Gamble'      Spend X Energy, then get an added effect if RNG Value <= Spent
- 'Heat'        Gain X Energy, then 'Overheat' if RNG Value <= Current Energy

## Plant
Energy Acceleration Element.  
Produces Extra Energy for Self & Others.
Uses 'Overgrowth' (Energy Overload) as a Threshold Effect.
- 'Focus'       Status Effect which Increases Energy Production by 1 (X Turns)
- 'Overgrowth'  Condition Effects which occur when Energy Production Exceeds Max Energy

## Vital
Energy Transfer Element.  
Steals Energy as an Attack, Yields Energy as Punishments.
- 'Drain'       Enemy Loses X Energy, Caster Gains Energy Equal to Amount Lost
- 'Siphon'      Spend Enemy Energy instead of your own for a cost.
- 'Bounty'      Status Effect where If Entity is Hit for Damage the Attacker Gains a Reward

## Force
Anti-Energy Element.  
Sabotages Energy Builds with Symetrical Effects.
- 'Barren'      Status Effect which prevents Energy Production for X Turns.
- 'Tax'         Energy Costs are Increased by X Amount. If not paid, apply Punishment

## Thunder
Energy Storage Element.  
Has Access to Moves which can 'Store' Energy.  
Moves with Storage only Yield this Energy on turns where they are Cast/Chained.
- 'Charge'      Spend X Energy on execution to Store Energy in a move.
- 'If Charged'  Conditional Effects which occur when the Move has Energy.
- 'WhileCharged'Conditional EventListeners which are Online when a move has Energy.

