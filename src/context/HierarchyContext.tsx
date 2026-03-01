import React, { createContext, useContext, useState } from "react";

export type HierarchyNode = {
    id: string;
    level: number;
    name: string;
    type: string;
};

type HierarchyContextType = {
    hierarchy: HierarchyNode[];
    setHierarchy: React.Dispatch<React.SetStateAction<HierarchyNode[]>>;
};

const defaultHierarchy: HierarchyNode[] = [
    { id: "1", level: 0, name: "Plant 1", type: "Plant" },
    { id: "1-1", level: 1, name: "test", type: "Production Area" },

    { id: "2", level: 0, name: "Plant 2", type: "Plant" },
    { id: "2-1", level: 1, name: "p11-area", type: "Production Area" },
    { id: "2-1-1", level: 2, name: "sLine 1", type: "Line" },
    { id: "2-1-2", level: 2, name: "sline 2", type: "Line" },
    { id: "2-1-3", level: 2, name: "sline 3", type: "Line" },
    { id: "2-1-4", level: 2, name: "test", type: "Line" },

    { id: "3", level: 0, name: "Plant 3", type: "Plant" },
    { id: "3-1", level: 1, name: "Lab", type: "Production Area" },
    { id: "3-1-1", level: 2, name: "lab_simulation", type: "Line" },
    { id: "3-1-1-1", level: 3, name: "Electric_furcace", type: "Workstation" },

    { id: "4", level: 0, name: "Plant 4", type: "Plant" },
    { id: "4-1", level: 1, name: "Demo area", type: "Production Area" },
    { id: "4-1-1", level: 2, name: "Demo_line", type: "Line" },
    { id: "4-1-1-1", level: 3, name: "Demo machine", type: "Workstation" },
    { id: "4-1-1-2", level: 3, name: "Demo_UTC", type: "Workstation" },

    { id: "5", level: 0, name: "Plant 5", type: "Plant" },
    { id: "5-1", level: 1, name: "plant__area", type: "Production Area" },
    { id: "5-1-1", level: 2, name: "plant_line", type: "Line" },
    { id: "5-1-1-1", level: 3, name: "electric_furance 1", type: "Workstation" },

    { id: "6", level: 0, name: "Plant 6", type: "Plant" },
    { id: "6-1", level: 1, name: "manufacturing", type: "Production Area" },
    { id: "6-1-1", level: 2, name: "line1", type: "Line" },
    { id: "6-1-1-1", level: 3, name: "cnc machine", type: "Workstation" },
];

const HierarchyContext = createContext<HierarchyContextType | undefined>(undefined);

export const HierarchyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [hierarchy, setHierarchy] = useState<HierarchyNode[]>(defaultHierarchy);

    return (
        <HierarchyContext.Provider value={{ hierarchy, setHierarchy }}>
            {children}
        </HierarchyContext.Provider>
    );
};

export const useHierarchy = () => {
    const context = useContext(HierarchyContext);
    if (!context) {
        throw new Error("useHierarchy must be used within a HierarchyProvider");
    }
    return context;
};
