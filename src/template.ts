import Variable from './variable';

class Template 
{
    private readonly _variablesMap: Map<string, Variable>;
    private readonly _name: string;

    /**
     * 
     * @param {Array<Variable>} variables
     * @param {string} name
     */
    constructor(variables: Array<Variable>, name: string) {
        if (variables == null || name == null)
            throw new Error("Null reference exception!");

        this._variablesMap = new Map<string, Variable>();
        for (let variable of variables)
            this._variablesMap.set(variable.name, variable);
        this._name = name;
    }

    /**
     * 
     * @returns {string}
     */
    get name(): string {
        return this._name;
    }

    /**
     * 
     * @param {string} name
     * @requires {Variable}
     */
    variable(name: string): Variable | undefined {
        if (name == null)
            throw new Error("Null reference exception!");
        
        return this._variablesMap.get(name);
    }

    /**
     * 
     * @returns {Array<Variable}
     */
    variables(): Array<Variable> {
        const variablesIter = this._variablesMap.values();
        const variables: Array<Variable> = [];
        for (let variable of variablesIter)
            variables.push(variable)
        
        return variables;
    }
}

export default Template;