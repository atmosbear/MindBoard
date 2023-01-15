type Entry = {
    title: string
    parents: Entry[]
    children: Entry[]
}
/** A piece of information that has relations to other information. Typically user created. */
export function Entry(title: string): Entry {
    /** Returns a new entry object. */
    function createNewEntryObject() {
        let newEntry = { title, parents: [], children: [] }
        ENTRIES.push(newEntry)
        return newEntry
    }
    let alreadyExistingEntry = findEntryByTitle(title)
    if (alreadyExistingEntry) {
        return alreadyExistingEntry
    } else {
        return createNewEntryObject()
    }
}
/**
 * Searches the global ENTRIES array for an entry with the requested title and returns it if it exists. Otherwise, returns undefined.
 */
export function findEntryByTitle(title: string): undefined | Entry {
    let requestedEntry: Entry | undefined
    ENTRIES.forEach(entry => {
        if (entry.title === title) {
            requestedEntry = entry
        }
    })
    return requestedEntry
}
/** Returns the opposite relation - parent or child - that is given. */
function reverseRelation(relation: "parents" | "children"): "parents" | "children" {
    switch (relation) {
        case "parents":
            return "children"
        case "children":
            return "parents"
    }
}

/**
 * Removes an element from an array.
 */
export function removeFromArray<G>(A: G, fromB: any[G]): void {
    fromB.splice(fromB[fromB.indexOf(A)], 1)
}

/** If both the winning and losing array contain the same entry, remove it from the losing array so that only the winning one remains for the user to see. For example, children and grandparents. */
function aTakesPrecedenceOverB(winningArray: Entry[], losingArray: Entry[]): void {
    console.warn("Why does this require two loops? After testing, perhaps it doesn't? Experiment.")
    losingArray.forEach(loser => {
        if (winningArray.includes(loser)) {
            removeFromArray(loser, losingArray)
        }
    })
}
/** Extraneous relations calculated from only from the perspective of one entry's parents and children - and their parents and children. */
type RelationsFromThePerspectiveOfAnEntry = {
    fromThePerspectiveOf: Entry;
    grandparents: Entry[];
    grandchildren: Entry[];
    siblings: Entry[];
    spouses: Entry[];
    greatgrandparents: Entry[];
    greatgrandchildren: Entry[];
    auncles: Entry[];
    parentsinlaw: Entry[];
    stepparents: Entry[];
    niblings: Entry[];
    stepchildren: Entry[];
    childreninlaw: Entry[];
}
/** Erases all elements onscreen. Does not clear the global entries array. */
export function clearScreen(): void {
    Array.from(document.getElementsByClassName("entry")).forEach((onscreenEntryElement: HTMLDivElement) => { onscreenEntryElement.remove() })
}
/** Returns all elements within a column. */
export function getEntryElementsWithinColumn(columnName: ColumnName): HTMLDivElement[] {
    return Array.from(getColumnElement(columnName).children) as HTMLDivElement[]
}
export type ColumnName = "parents" | "children" | "center" | "grandparents" | "grandchildren"

/** Returns the column element requested. */
export function getColumnElement(columnName: ColumnName): HTMLDivElement {
    return document.getElementById(columnName + "-column")! as HTMLDivElement
}
/** Returns a HMTLDiv representing the entry, but does not put it on screen. */
function createEntryDiv(entry: Entry): HTMLDivElement {
    let entryElement = document.createElement("div")
    entryElement.classList.add("entry")
    entryElement.innerText = entry.title
    entryElement.onclick = () => {
        clearScreen()
        render(discoverRelationsFromEverythingToEntry(entry))
    }
    return entryElement
}
/** Returns an array of the given properties. For example, passing an array of Elements and requesting the "innerHTML" property will return an array of all the innerHTML properties found in that array, unorganized. */
function getArrayOfSpecificPropertiesInArray(array: any[], property: string): any[] {
    let propertiesRequested = []
    array.forEach(entryInArray => {
        propertiesRequested.push(entryInArray[property])
    })
    return propertiesRequested
}

/** Renders an element onscreen. */
function renderEntryEl(entry: Entry, type: string) {
    if (type === "grandchildren") {
        let childEntryElements: Element[] = getEntryElementsWithinColumn("children")
        let childEntryElementTitles = getArrayOfSpecificPropertiesInArray(childEntryElements, "innerText")
        let foundParent: Entry | undefined
        entry.parents.forEach((parentOfGC: Entry) => {
            if (childEntryElementTitles.includes(parentOfGC.title)) {
                foundParent = parentOfGC
            }
        })
        if (foundParent) {
            let grandchildrenHolders = getEntryElementsWithinColumn("grandchildren")
            let positionOfChildEntry = getArrayOfSpecificPropertiesInArray(childEntryElements, "innerHTML").indexOf(foundParent.title)
            while (grandchildrenHolders.length <= positionOfChildEntry) {
                let newGrandchildHolderElement = document.createElement("div")
                newGrandchildHolderElement.id = "grandchild-holder-" + grandchildrenHolders.length
                newGrandchildHolderElement.classList.add("grandchild-holder")
                getColumnElement("grandchildren").appendChild(newGrandchildHolderElement)
                grandchildrenHolders = getEntryElementsWithinColumn("grandchildren")
            }
            grandchildrenHolders.forEach((holder, i) => {
                if (i === positionOfChildEntry) {
                    let el = createEntryDiv(entry)
                    el.classList.add("gcentry")
                    el.classList.add("entry")
                    holder.appendChild(el)
                }
            })
        } else {
            throw new Error("No parent was found for the GC entry!")
        }
    } else {
        let newEntryElement = createEntryDiv(entry)
        if (type === "focused") {
            newEntryElement.classList.add("focused");
            document.getElementById("center-column")!.appendChild(newEntryElement)
        } else {
            document.getElementById(type + "-column")!.appendChild(newEntryElement)
        }
    }
}
/** Decides how to render each relation and dispatches it to be rendered within the proper column. */
export function render(relations: RelationsFromThePerspectiveOfAnEntry) {
    relations.grandparents.forEach(grandparent => {
        renderEntryEl(grandparent, "grandparents")
    })
    relations.fromThePerspectiveOf.parents.forEach(parent => {
        renderEntryEl(parent, "parents")
    })
    relations.fromThePerspectiveOf.children.forEach(child => {
        renderEntryEl(child, "children")
    })
    relations.grandchildren.forEach(grandchild => {
        renderEntryEl(grandchild, "grandchildren")
    })
    relations.siblings.forEach(sibling => {
        if (DEV)
            console.log("Rendering", sibling, "a sibling", "as center")
        renderEntryEl(sibling, "center")
    })
    relations.spouses.forEach(spouse => {
        if (DEV)
            console.log("Rendering", spouse, "a spouse", "as center")
        renderEntryEl(spouse, "center")
    })
    // skip GGP and GGC
    relations.auncles.forEach(auncle => {
        if (DEV)
            console.log("Rendering", auncle, "a auncle", "as parent")
        renderEntryEl(auncle, "parents")
    })
    relations.parentsinlaw.forEach(parentinlaw => {
        if (DEV)
            console.log("Rendering", parentinlaw, "a parentinlaw", "as parent")
        renderEntryEl(parentinlaw, "parents")
    })
    relations.stepparents.forEach(stepparent => {
        if (DEV)
            console.log("Rendering", stepparent, "a stepparent", "as parent")
        renderEntryEl(stepparent, "parents")
    })
    relations.niblings.forEach(nibling => {
        if (DEV)
            console.log("Rendering", nibling, "a nibling", "as child")
        renderEntryEl(nibling, "children")
    })
    relations.stepchildren.forEach(stepchild => {
        if (DEV)
            console.log("Rendering", stepchild, "a stepchild", "as child")
        renderEntryEl(stepchild, "children")
    })
    relations.childreninlaw.forEach(childinlaw => {
        if (DEV)
            console.log("Rendering", childinlaw, "a child in law", "as child")
        renderEntryEl(childinlaw, "children")
    })
    renderEntryEl(relations.fromThePerspectiveOf, "focused")
}

function keyboardControls() {
    console.error("Not implemented: keyboard controls.")
    // window.addEventListener("keydown", (e) => {
    //     if (e.key === "Enter") {
    //         console.log(e.key)
    //     }
    // })
}

/**Dynamically calculates extraneous relations using only the original entry's parents and children (and their parents and children). */
export function discoverRelationsFromEverythingToEntry(entry: Entry): RelationsFromThePerspectiveOfAnEntry {
    let grandparents: Entry[] = []
    let grandchildren: Entry[] = []
    let greatgrandparents: Entry[] = []
    let greatgrandchildren: Entry[] = []
    let siblings: Entry[] = []
    let spouses: Entry[] = []
    let stepparents: Entry[] = []
    let auncles: Entry[] = []
    let parentsinlaw: Entry[] = []
    let niblings: Entry[] = []
    let stepchildren: Entry[] = []
    let childreninlaw: Entry[] = []
    entry.parents.forEach(parent => {
        parent.parents.forEach(grandparent => {
            if (!grandparents.includes(grandparent))
                grandparents.push(grandparent)
            grandparent.parents.forEach(greatgrandparent => {
                if (!greatgrandparents.includes(greatgrandparent))
                    greatgrandparents.push(greatgrandparent)
            })
            grandparent.children.forEach(auncle => {
                if (!auncles.includes(auncle) && auncle !== parent)
                    auncles.push(auncle)
            })
        })
        parent.children.forEach(sibling => {
            if (sibling !== entry) {
                if (!siblings.includes(sibling))
                    siblings.push(sibling)
                sibling.parents.forEach(stepparent => {
                    if (parent !== stepparent && !stepparents.includes(stepparent)) {
                        stepparents.push(stepparent)
                    }
                })
                sibling.children.forEach(nibling => {
                    if (!entry.children.includes(nibling) && !niblings.includes(nibling))
                        niblings.push(nibling)
                })
            }
        })
    })
    entry.children.forEach(child => {
        child.children.forEach(grandchild => {
            if (!grandchildren.includes(grandchild))
                grandchildren.push(grandchild)
            grandchild.children.forEach(greatgrandchild => {
                if (!greatgrandchildren.includes(greatgrandchild))
                    greatgrandchildren.push(greatgrandchild)
            })
            grandchild.parents.forEach(childinlaw => {
                if (childinlaw !== child && !childreninlaw.includes(childinlaw))
                    childreninlaw.push(childinlaw)
            })
        })
        child.parents.forEach(spouse => {
            if (spouse !== entry)
                if (!spouses.includes(spouse)) {
                    spouses.push(spouse)
                }
            spouse.parents.forEach(parentinlaw => {
                if (parentinlaw !== spouse && !parentsinlaw.includes(parentinlaw)) {
                    parentsinlaw.push(parentinlaw)
                }
            })
            spouse.children.forEach(stepchild => {
                if (!entry.children.includes(stepchild) && !stepchildren.includes(stepchild)) {
                    stepchildren.push(stepchild)
                }
            })
        })
    });
    function prioritize(array: Entry[][]) {
        array.forEach((arr, i) => {
            array.forEach((arr2, j) => {
                if (i < j) {
                    aTakesPrecedenceOverB(arr, arr2)
                }
            })
        })
    }
    prioritize([[entry], entry.children, entry.parents, auncles, parentsinlaw, stepparents, siblings, spouses, niblings, stepchildren, childreninlaw, grandparents, grandchildren, greatgrandparents, greatgrandchildren])
    return { fromThePerspectiveOf: entry, grandparents, grandchildren, siblings, spouses, greatgrandparents, greatgrandchildren, auncles, parentsinlaw, stepparents, niblings, stepchildren, childreninlaw }
}
/** Searches for direct (aka parent and child) links between two entries and removes them both backwards and forwards. */
export function disconnect(entry: Entry, entry2: Entry): void {
    if (entry.parents.includes(entry2)) {
        removeFromArray(entry2, entry.parents)
    }
    if (entry.children.includes(entry2)) {
        removeFromArray(entry2, entry.children)
    }
    if (entry2.parents.includes(entry)) {
        removeFromArray(entry, entry2.parents)
    }
    if (entry2.children.includes(entry)) {
        removeFromArray(entry, entry2.children)
    }
}

/** Links two entries. */
export function link(entry: Entry, childOrParentOf: string, entry2: Entry): void {
    function expandAbbreviation() {
        if (childOrParentOf === "c") {
            childOrParentOf = "children"
        }
        if (childOrParentOf === "p") {
            childOrParentOf = "parents"
        }
    }
    expandAbbreviation()
    // allow user to pass strings to get entries (which also makes them if they don't exist)
    if (typeof entry === "string") {
        entry = Entry(entry)
    }
    if (typeof entry2 === "string") {
        entry2 = Entry(entry2)
    }
    // do not allow nodes to be both parents and child of another
    if (entry.parents.includes(entry2) || entry.children.includes(entry2) || entry2.parents.includes(entry) || entry2.children.includes(entry)) {
        disconnect(entry, entry2)
    }
    // @ts-expect-error
    if (!entry[reverseRelation(childOrParentOf)].includes(entry2)) entry[reverseRelation(childOrParentOf)].push(entry2)
    if (!entry2[childOrParentOf].includes(entry)) entry2[childOrParentOf].push(entry)

}

export let ENTRIES: Entry[] = []
let DEV = false
keyboardControls()