## Summon-Mudman
Stone | Utility
Attempt Negate Caster's Attunement to Stone
If Successful: Summon a 'Mudman'

### Mudman
Summoned | AttunedTo: Stone
HP: 3/3
ON NOT-ATTUNED TO STONE: 
  This Entity Dies
Moves:
  1. Pebble: Deals 1 Stone Damage [cooldown 1]
  2. Merge:  If Another Mudman is 'Ready', fuse into Mudman+1, else: set to 'Ready'

### Mudman+1
Summoned | AttunedTo: Stone
HP: 6/6 -total_damage
ON NOT-ATTUNED TO STONE: 
  This Entity Dies
ON HIT:
  Split into 2 Mudmen with half HP, rounded down/up respectively
Moves:
  1. Pummel: Deals 2 Stone Damage, Twice [cooldown 2]
  2. Merge:  If Another Mudman+1 is 'Ready', fuse into Mudman+2, else: set to 'Ready'

### Mudman+3
Summoned | AttunedTo: Stone
HP: 12/12 -total_damage
ON NOT-ATTUNED TO STONE: 
  This Entity Dies
ON HIT:
  Split into 4 Mudmen with quarter HP, rounded down/up respectively
Moves:
  1. Pulverize: Deals 10 Stone Damage, Split into 4 Mudmen

## Chain-Lightning
Thunder | Attack
Attunes Caster to Thunder
Deals 2 Thunder Damage to Target
If Chained-Into: Deals 2 Thunder Damage to Adjacent Targets

## Summon-Timebomb
Fire | Utility
Attempt Negate Caster's Attunement to Fire
If Successful: Summon a 'Timebomb'

### Timebomb
Summoned | AttunedTo: Fire
HP: 2/2
ON DEATH:
  If Death by Fire Damage:
    Deals 2 Fire Damage to Adjacent Entities
    'Timebomb' Entities Dealt Damage this way gain 1 Strong

## Quake-Up
Stone | Attack
Attunes Caster to Stone
Deals 1 Stone Damage to All Entities
'Mudmen' Hit by this move are 'Ready' Until end of turn

## Bind-Guess
Plant | Utility
Summon 'Vinewall', Assign Target Move to it
Summon 'Vinewall+1', Assign This Move to it

### Vinewall
Summoned | AttunedTo: Plant
HP: 2/2
STATIC:
  Assigned Move cannot be Cast or Change Zones
ON START-OF-TURN:
  Heals Self 1

### Vinewall+1
Summoned | AttunedTo: Plant
HP: 5/5
STATIC:
  Assigned Move cannot be Cast or Change Zones
ON START-OF-TURN:
  Heals Self 5

## Summon-Glacier
Water | Utility
Attempt Negate Caster's Attunement to Water.
If Successful: Summon a 'Glacier'
[cooldown 1]

### Glacier
Summoned | AttunedTo: Water
HP: 2/2
ON MOVE-LOSES-COOLDOWN:
  If Move owned by an adjacent entity, Ignore Reduction, this entity loses 1 HP
ON-ATTACKED:
  If Damage Type is Fire, Damage Ignores Elemental Affinity (Melts on Damage)

## Summon-Fleshkin
Vital | Utility
Deal 3 Vital Damage to Caster.
Summon a 'Fleshkin'

### Fleshkin
Summoned | AttunedTo: Vital
HP: 3/5
EN: 0/6
Moves:
  1. Make Right: Deal 2 Vital Damage. Heal X, where X is damage dealt this way [cost: 1 energy]
  2. Siphon Soul: Steal 1 Energy from all Entities [cost: 2 hp]

## Summon-Sickness
Force | Utility
Attempt Negate Caster's Attunement to Force
If Successful, Summon a 'Sickness'

### Sickness
Summoned | AttunedTo: Force
HP: 2/2
ON-DEALT-DAMAGE:
  Extend Statuses on Target by 1 Turn
Moves:
  1. Compell: Choose Target Entity. Until your Next Turn, Moves they cast Target You.
  2. Dispel: Die. Extend Statuses on All Entities by 1 Turn

## Summon-Boltrod
Thunder | Utility
Attempt Negate Caster's Attunement to Thunder
If Successful, Summon a 'Boltrod'

### Boltrod
Summoned | AttunedTo: Thunder
HP: 3/3
ON-DEALT-DAMAGE:
  If Damage is Thunder, Deal that Damage to Adjacent Entities Instead
  'Boltrod' Entities Dealt Damage this way Gain Strong


