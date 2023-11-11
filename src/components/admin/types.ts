import type { WarningBox } from "../warningbox/warningBox";

export type FieldType = 
    "text" 
    | "textarea"
    | "text[]" 
    | "number"
    | "boolean"
    | {
        "select": {
            options: string[]
        }
    };

/**
 * How the field is rendered in the data table
 * 
 * Defaults: text as default, unordered-list for array
 */
export type FieldRenderMethod = "text" | "unordered-list" | "ordered-list" | "none"

export type Capability = "view" | "create" | "update" | "delete";

export type FieldFetch = ((cap: Capability) => Field | Field)[]

export interface Field {
    /**
     * The id of the field
     */
    id: string,
    /**
     * The label of the field
     */
    label: string,
    /**
     * The 'array' label of the field. Is optional
     */
    arrayLabel?: string,
    /**
     * The type of the field
     */
    type: FieldType,
    /**
     * Placeholder/help text of the field
     */
    helpText: string,
    /**
     * Whether or not the field is required
     * 
     * This flag is frontend only and is not currently respected at all
     */
    required: boolean,
    /**
     * Whether or not the field is disabled
     * 
     * This flag is frontend only
     */
    disabled: boolean,
    /**
     * Render method, is optional
     * 
     */
    renderMethod: FieldRenderMethod
}

export interface BaseSchema<T> {
    /**
     * The name of the schema
     */
    name: string,
    /**
     * The fields of the schema   
     */
    fields: FieldFetch,
    /** 
     * Strictly verify that data has same keys as schema 
    */
    strictSchemaValidation: boolean,
    /**
     * Returns the capabilities the user has regarding the schema
     * 
     * @returns The capabilities of the schema
     */
    getCaps(): Capability[],
    /**
     * Returns the primary key of the schema
     * 
     * @param cap The capability that is being exercised
     * @returns The id/name of the primary key
     */
    getPrimaryKey: (cap: Capability) => string,
    /**
     * The function to fetch all data currently present in the database
     * 
     * @returns A list of data entries corresponding to the schema
     */
    viewAll: () => Promise<T[]>,
    /**
     * The function to fetch a specific row by pkey value
     * 
     * @return A data entry
     */
    view: (key: string, value: string) => Promise<T>
    /**
     * A function to create a new data entry in the database
     * 
     * @param data The data to add
     * @returns Whether the data was added successfully
     */
    create: (data: T) => Promise<boolean>,
    /**
     * A function to update an existing data entry in the database
     * 
     * @param data The data to update
     * @returns Whether the data was updated successfully
     */
    update: (data: T) => Promise<boolean>,
    /**
     * A function to delete an existing data entry in the database
     * 
     * @param data The data to delete
     * @returns Whether the data was deleted successfully
     */
    delete: (data: T) => Promise<boolean>,
}

/**
 * Wrapper type to allow viewToTable to also return the fields
 */
export interface ViewToTableResponse {
    fields: FieldFetch,
    data: any[]
}

/**
 * Schema is the data that the admin panel will use to render
 * 
 * T is the type of the schema and V is the type of the data for the purpose of tabular display
 */
export interface Schema<T> extends BaseSchema<T> {
    /**
     * This function takes in viewed data and turns it into DataTable rows (which can be of any list type)
     * 
     * @param data The data to convert
     * @returns The converted data
     */
    viewToTable: (data: T[]) => Promise<ViewToTableResponse>,
    /**
     * This function takes in a capability and responds with a warningbox
     * 
     * Note that only 'delete' actually supports warnings at this time
     */
    warningBox: (cap: Capability, data: T) => WarningBox
    /**
     * This function is called as a reactive store when the management modal is opened
     */
    onManagementModalOpen: (data: T) => any
}

export interface ManageSchema<T> {
    schema: Schema<T>
    manageData: T,
}