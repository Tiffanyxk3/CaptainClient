/*
 * Purpose is to preserve the Kaboom namespace and not have it be
 * imported globally
 */

export const k = kaboom({
	// width: 640,
	// height: 480,
	global: false,
	scale: 1,
	clearColor: [0, 0, 0, 1]
});

export default k;