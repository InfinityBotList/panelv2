export interface ActionField {
	Name: string;
	Answer: string;
	Validate: () => boolean;
}

export default interface Action {
	Name: string;
	Fields: ActionField[] | null;
	Disabled: boolean;
 onSelect: async () => Promise<void>;
}
