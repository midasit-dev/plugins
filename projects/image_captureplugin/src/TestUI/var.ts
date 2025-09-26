import { atom } from 'recoil';

export const VarTabGroupMain = atom({
	key: 'VarTabGroupMain',
	default: "MODEL"
});

export const VarTabGroupDB = atom({
	key: 'VarTabGroupDB',
	default: "REACTIONS"
});

export const VarTabGroupView = atom({
	key: 'VarTabGroupView',
	default: "REACTIONS"
});

export const VarCompListReaction = atom({
	key: 'VarCompListReaction',
	default: "REACTIONS"
});
