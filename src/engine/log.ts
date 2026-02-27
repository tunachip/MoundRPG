// src/engine/log.ts

export function logEvent (
	attempted: string,
	outcome: string,
	reason?: string,
): void {
	let event = '';
	event +=	 `Attempted: ${attempted}\n`;
	event +=	 `Outcome:   ${outcome}\n`;
	if (reason) {
		event += `Reason:    ${reason}`
	}
	console.log(event);
}
