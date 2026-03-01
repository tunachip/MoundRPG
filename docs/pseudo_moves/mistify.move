[NOTES]
Evasive Water Utility.
When Cast, Goes on Cooldown.
When on Cooldown, provides owner a 25% change of Dodging Damage.

[METADATA]

NAME									Mistify
TYPE									utility
SPEED									normal
ELEMENT								water
BASE_DAMAGE						0
BASE_ITERATIONS				1
CAN_CHAIN							true
CAN_BE_CHAINED_INTO		true

[OPERATIONS]

FROM_ACTIVE
	1. applyCooldown
		TARGET				this
		TURNS					2

FROM_BANKED
	1. applyAttunement
		TARGET			caster
		ELEMENT			this.element

	2. activateMove
		TARGET			this

FROM_ON_COOLDOWN

WHILE_ACTIVE

WHILE_BANKED

WHILE_ON_COOLDOWN
	CONDITIONS
		1. entityAttacked
			TARGET		this.owner
		EXPECTS			true
	
	OPERATIONS
		1. condition
		IF
			1. rngBoolean
				TRUE		1
				FALSE		3
			EXPECTS		true
		
		THEN
			1. ignoreNextDamage
			TARGET:			this.owner

		ELSE
			1. continue
