* docs/combat_loop.md



## CombatLoop Phases

1. Turn Decision Phase

This is when Players and Encounters choose their move choices.
they get one of these three choices:

  1. focus: skip turn to gain 1 energy. 
  2. activateMove: place a banked move into the active pool, then use the 'fromBanked' operations
  3. castMove: un-hide an active move if it is hidden, then use the 'fromActive' operations

key rules:
  1. focus can only be used for the first choice of the turn
  2. bound moves can be chosen, but will not execute
  3. moves on cooldown will execute their 'onCooldown' operations regardless of zone
  4. energy is paid on execution - if energy is lost before the operations execute, moves beyond the payable costs will be skipped
  5. focus can be used while asleep
  6. any number of moves can be chosen, but only 4 will ever typically take place as the energy costs limit

2. Turn Order Calculation

function calculateTurnOrder (
  combat: CombatState
): Array<number> {
  const calculatedSpeeds: Array<number> = [];
  for (const entity of combat.entities) {
    let speed = 0;
    const entityIndex = entity.index;
    const moveSpeed = combat.moves[combat.choices[entityIndex][0].speed];
    switch (true) {
      case (combat.hasPriority === entity.index):
        speed += 1;
      case (entity.hasStatus.quick):
        speed += 2;
      case (entity.hasStatus.slow):
        speed -= 2;
      case (moveSpeed === 'quick'):
        speed += 2;
      case (moveSpeed === 'slow'):
        speed -= 2;
      default:
        break;
    }
    calculatedSpeeds.push(speed);
  }
  return indexesFromCalculatedSpeeds(calculatedSpeeds);
}

3. Turn Execution

function elementIndex (
  element: DamageElement,
): number {
  switch (element) {
    case 'water':   return 0;
    case 'stone':   return 1;
    case 'fire':    return 2;
    case 'plant':   return 3;
    case 'force':   return 4;
    case 'thunder': return 5;
  }
}

function applyElementTax (
  lastElement: DamageElement | any,
  nextElement: DamageElement | any,
  energyCost: number,
): number {
  if (lastElement === '') {
    return energyCost;
  }
  if (nextElement === 'vital' || lastElement === 'vital') {
    casterPaysLife(energyCost);
    return energyCost;
  }
  if (lastElement === nextElement) {
    return energyCost;
  }
  if (elementIndex(lastElement) - elementIndex(nextElement) in [-1, 0, 1]) {
    return energyCost;
  }
  return energyCost + 1;
}


function executeEntityTurn (
  combat: CombatState,
  entityIndex: number,
): void {
  const entity = combat.entities[i];
  // we actually need to cast this as an actor i believe
  const counters = auditCounters(entity);

  if (entity.hasStatus.sleep) {
    heal({
      combat: combat,
      caster: entity,
      targets: [entity],
      amount: 1,
    });
  }

  if (tickDamageStatuses({
    combat: combat,
    caster: entity,
    targets: [entity],
  }).breaks) {
    // todo: close turn here if an entity dies from damage statuses
    // this should only happen with death
    break;
  }

  if (executeEntityChoices({
    combat: combat,
    entity: entity
  }).breaks) {
    // as above, break the turn if entity dies or otherwise turn chain is broken
    // as second though, we will need something more than 'breaks' to be granual enough to capture death
    break;
  }  

  resolveCounters(combat, entity, counters);
}

function resolveCounters (
  combat: CombatState,
  entity: CombatEntity,
  counters: Object
): void {
  for (const element of counters.attunements) {
    if (entity.attunedTo[element]) {
      entity.turnsAttuned[element] += 1
    };
  }
  for (const status of counters.statuses) {
    if (entity.hasStatus[status]) {
      reduceStatus({
        combat: combat,
        caster: entity,
        target: entity,
        status: status,
        amount: 1,
      });
    }
  }
  for (const moveIndex of counters.movesOnCooldown) {
    const move = combat.moves[moveIndex];
    reduceCooldown({
      combat: combat,
      caster: entity,
      target: move,
      amount: 1,
    });
  }
}

function auditCounters (
  entity: CombatEntity
) {
  const held = {
    attunements = currentAttunements(entity),
    statuses = currentStatuses(entity),
    movesOnCooldown: Array<number> = movesOnCooldown(entity),
  };
  return held;
}

function moveDisqualified (
  entity: CombatEntity,
  move: CombatMove,
): boolean {
  // simple for now, later we will add support for emitter signals
  switch (true) {
    case (move.isBound):
      return true;
    case (entity.hasStatus.sleep):
      return true;
    case (move.type === 'attack' && entity.hasStatus.stun):
      return true;
    case (move.type === 'utility' && entity.hasStatus.anger):
      return true;
    default:
      return false;
  }
}

function executeEntityChoices (
  combat: CombatState,
  entity: CombatEntity,
): OperationResult {
  const choices = combat.turnChoices[i];

  if (choices[0].type === 'focus') {
    return applyEnergy({
      combat: combat,
      caster: entity,
      targets: [entity],
      amount: 1
    });
  else {
    let actionCount = 0;
    let lastMoveElement = '';
    for (const choice.type of choices) {
      if (choice === 'executeMove') {
        const energyCost = applyElementTax(
          lastMoveElement,
          choice.move.element,
          actionCount,
        );
        if (entity.energy < energyCost) {
          // skip action if cannot pay costs
        }
        else {
          reduceEnergy({
            combat: combat,
            caster: entity,
            targets: [entity],
            amount: energyCost,
          });
          const results = executeMove({
            combat: combat,
            caster: entity,
            targets: choice.targets,
          });
        }
        // Eval Results and find out if we can keep going.
        if (results.break) {
          return results;
        }
        actionCount += 1;
      }
    }
  }
}

export function executeEntityTurns (
  combat: CombatState,
): void {
  for (const entityIndex of combat.calculatedTurnOrder) {
    if (combat.entities[entityIndex].hp !== 0) {
      executeEntityTurn(combat, entityIndex);
    }
  }
}

4. Update variables

function calculatePriority (
  current: number,
): number {
  while (true) {
    current += 1;
    const i = combat.entities.length % current;
    if (combat.entities[i].hp > 0) {
      return i;
    }
  }
}

function updateVariables (
  combat: CombatState
): void {
  combat.turn += 1;
  combat.hasPriority = calculatePriority(combat.hasPriority);
}

5. End

