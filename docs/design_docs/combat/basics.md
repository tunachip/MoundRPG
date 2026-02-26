# Combat Basics
---

## How Combat Functions
Combat occurs in Matches.  
At Start of Match, Entities Initialize with full HP & 0 Energy.  
From this point, Turns are taken until Combat Ends.  

## How Turns Work
Turns occur in the following Phases:  
1. Declare Actions
2. Calculate Turn Order
3. Execute Turns (In Calculated Order)
4. End

## How Combat Ends
Combat ends when one of the following conditions is met:  
1. Player CombatEntity HP == 0
2. All Non-Player CombatEntity HP == 0
3. Game Effect Declares an Entity as the Winner (Rare)

## How Entity HP is Modified
Entity HP is effected by the following actions:  
1. Combat Damage from Attacking Entities
2. HP Gain from Healing Effects (Regen, Heal)
3. Damage Based Status Effects (Burn, Wound, Decay, & Regen)
4. Reduction as Side Effect of MaxHP Reduction (Such as by Status Effect 'Curse')

## Turn Actions
During the Declare Actions Phase, one of the following Actions is Chosen:
1. Activate Banked Move
2. Cast Active Move (Chaining Possible)
3. Use Culture Special Ability

## Activating Moves
Moves in the Bank are considered 'Banked'.  
On Activation, Moves Attune their Owner to their Element Type.  
Entities already Attuned To this Element stay attuned with no effect.  
Following this, the Activated Move is pushed to the Active Pool.  
Moving a Move to the Active Pool does not reveal its Name or Effect.  
Some Moves have 'On-Activation' Effects, but it is rare.

## Active Pool Rules
Only 4 Moves may be Active per Entity at a time.  
If an Entity has 4 Active Moves, they may not Active Moves.  
If an Effect Attempts to Activate a Move Beyond this count, this is Ignored.

## Casting Moves
When Casting Spells, Targets are stated on Declaration.  
Other Variables, such as those declared during effects, are made mid-execution.  
Moves in the Active Pool can be cast regardless of Attunement State.
Moves 'On Cooldown' cannot be declared as a Cast Action.  
Attacks Typically re-attune the Caster to their given element.  
On Execution, Moves Reveal their Name and Effects.  
Moves 'On Cooldown' will not execute effects.  
Revealed Moves Stay Revealed unless otherwise instructed.  

## Move Chaining
When Deciding to Cast a Move, Players may pay energy to 'Chain' other Moves.  
Moves can be Chained into regardless of which pool they are in.  
Moves 'On Cooldown' will not Execute when Chained into.  
Chained Moves are revealed on Execution, but are not 'Activated' by Chaining.  
Some Moves have 'If Chained' Effects, but it is Rare.  

## Complimentary Elements
The following Elemental Pairs are Complimentary with Oneanother.  
Complimentary Pairs have a Discounted Rate on Move Chaining.
1. Water & Stone
2. Fire & Plant
3. Force & Thunder

## Psuedo-Compliment
Vital is 'Psuedo-Complimentary' and can Chain into / be Chained into for HP.
HP Cost pays for 'Half' of the Energy Costs for these Chains.  
The details are shown below in Chaining Costs.

## Chaining Costs
When Chaining Moves, Costs are as such:  
1. Complimentary Elements
   1st Move --> 2nd Move = 1 Energy  
   2nd Move --> 3rd Move = 2 Energy
   3rd Move --> 4th Move = 3 Energy
2. Non-Complimentary Elements
   1st Move --> 2nd Move = 2 Energy  
   2nd Move --> 3rd Move = 4 Energy
   3rd Move --> 4th Move = 6 Energy
3. Pseudo-Complimentary Elements (Vital)
   1st Move --> 2nd Move = 1 Energy, 1 HP  
   2nd Move --> 3rd Move = 2 Energy, 2 HP  
   3rd Move --> 4th Move = 3 Energy, 3 HP  

## Move Binding
Binding is an Effect which Locks Moves into their Current Pool.  
Binding can either be Perpetual or last a Turn Length.  
Bound Active Moves can still be Cast or Chained into.  
Binding bears no consequence on Cooldown.  

## Cooldown
Moves can be placed 'On Cooldown'.  
Moves 'On Cooldown' cannot be Declared as Casts or Chain Casts.  
Cooldown can be Perpetual or last a Turn Length.  
Moves placed on Cooldown a previous turn are Ticked Down at End of Turn.  

## Turn Order Calculation
After Actions are Declared, Turn Order is Calculated.  
Turn Order Calculation is factored by these values:
1. Has Priority           += 1 Speed
2. Status Effect 'Quick'  += 2 Speed
3. Status Effect 'Slow'   -= 2 Speed
4. Move Attribute 'Quick' += 2 Speed
5. Move Attribute 'Slow'  -= 2 Speed

## Turn Priority
Turn Priority is a Tie-Breaker trait for Turn Order Calculation.  
An Entity 'Has Priority' is their index value matches the Turn Number.  
It is very common for this to be the deciding factor in Turn Order.  

## Turn Execution
Turn Execution is when Actions & Tick Events Occur.  
Turns are Executed as the following Phases:
1. Audit Statuses, & Cooldowns
2. Uptick Attunement Turns
3. Tick Damage Based Status Effects (Regen, Burn, Decay)
4. Check Move Disqualifying Status Effects (Sleep, Anger, Stun)
5. If Not Disqualified, Execute Move Logic
6. Downtick Audited Statuses & Cooldowns
7. End

## Blessings
Blessings are Enchanted Items which Modify Game Rules.  
Blessings either Change Effect Outcomes or Register Future Events.  
Blessings can be put 'On Cooldown' just like Moves.  
When a Blessing is Initialized or comes off Cooldown, it registers a 'Listener'.  
Listeners sit in play waiting for Matching Emitter Events.  
Blessings un-register their Listeners when 'On Cooldown'.  

## Status Effect Caps & Thresholds
All Status Effects have Value Caps relative to the Entity.  
Some Status Effects have 'Thresholds' instead of Caps.  
When a Threshold is Exceeded, it's requisite Event Occurs.  
1. Burn   = 5   (Threshold): Entity takes Bulk Damange ('Overheat')
2. Wound  = 999 (Threshold): Entity Dies ('Death by 1000 Cuts')
3. Decay  = 5   (Cap)
4. Regen  = 5   (Cap)
5. Curse  = 3   (Cap)
6. Strong = 3   (Cap)
7. Tough  = 3   (Cap)
8. Quick  = 3   (Cap)
9. Slow   = 3   (Cap)
10. Stun  = 3   (Cap)
11. Anger = 3   (Cap)
12. Sleep = 3   (Cap)

## Burnout
Occurs whenever an Entity exceeds their Burn Cap.  
On Burnout, Entity takes Fire Damage Equal to the Current Cap.  
After this, their Burn Count Reduces to the Excess Value of Applied Burn.

## Death by 1000 Cuts
More of a Meme / Easter Egg than a genuine strategy.  
When an Entity hits 1000 Wounds, they Die Instantly.  

