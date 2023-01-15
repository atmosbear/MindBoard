type Entry = {
    title: string
    p: Entry[]
    c: Entry[]
}

/** A piece of information that has relations to other information. Typically user created. */
export function Entry(title: string): Entry {
    let alreadyExistingEntry = findEntryByTitle(title)
    if (alreadyExistingEntry === undefined) {
        let newEntry = { title, p: [], c: [] }
        ENTRIES.push(newEntry)
        return newEntry
    } else {
        return alreadyExistingEntry
    }
}

/**
 * Searches the global ENTRIES array for an entry with the requested title and returns it if it exists.
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

function reverseRelation(relation: "p" | "c") {
    switch (relation) {
        case "p":
            return "c"
        case "c":
            return "p"
    }
}

/**
 * Removes an element from the array - just a shortcut method..
 */
export function removeFromArray<G>(A: G, fromB: any[G]) {
    fromB.splice(fromB[fromB.indexOf(A)], 1)
}

/** If both the winning and losing array contain the same entry, remove it from the losing array so that the user only sees one. For example, children and grandparents. */
function aTakesPrecedenceOverB(winningArray: Entry[], losingArray: Entry[]) {
    losingArray.forEach(loser => {
        if (winningArray.includes(loser)) {
            removeFromArray(loser, losingArray)
        }
    })
    losingArray.forEach(loser => {
        if (winningArray.includes(loser)) {
            removeFromArray(loser, losingArray)
        }
    })
}

type RelationsList = {
    fromThePerspectiveOf: Entry;
    gp: Entry[];
    gc: Entry[];
    sib: Entry[];
    sp: Entry[];
    ggp: Entry[];
    ggc: Entry[];
    auncles: Entry[];
    parentsinlaw: Entry[];
    stepparents: Entry[];
    niblings: Entry[];
    stepchildren: Entry[];
    childreninlaw: Entry[];
}
function clearScreen(): void {
    Array.from(document.getElementsByClassName("entry")).forEach(el => { el.remove() })
}
function renderEntryEl(entry: Entry, type: string) {
    if (type === "gc") {

    } else {
        let el = document.createElement("div")
        el.classList.add("entry")
        el.innerText = entry.title
        el.onclick = () => {
            clearScreen()
            render(discoverRelationsFromEverythingToEntry(entry))
        }
        if (type === "focused") {
            el.classList.add("focused");
            document.getElementById("centcol")!.appendChild(el)
        } else {
            document.getElementById(type + "col")!.appendChild(el)
        }
    }
}
export function render(relations: RelationsList) {
    relations.gp.forEach(gp => {
        renderEntryEl(gp, "gp")
    })
    relations.fromThePerspectiveOf.p.forEach(parent => {
        renderEntryEl(parent, "p")
    })
    relations.fromThePerspectiveOf.c.forEach(child => {
        renderEntryEl(child, "c")
    })
    relations.gc.forEach(gc => {
        renderEntryEl(gc, "gc")
    })
    relations.sib.forEach(sib => {
        console.log("Rendering", sib, "a sibling", "as center")
        renderEntryEl(sib, "cent")
    })
    relations.sp.forEach(spouse => {
        console.log("Rendering", spouse, "a spouse", "as center")
        renderEntryEl(spouse, "cent")
    })
    // skip GGP and GGC
    relations.auncles.forEach(auncle => {
        console.log("Rendering", auncle, "a auncle", "as parent")
        renderEntryEl(auncle, "p")
    })
    relations.parentsinlaw.forEach(parentinlaw => {
        console.log("Rendering", parentinlaw, "a parentinlaw", "as parent")
        renderEntryEl(parentinlaw, "p")
    })
    relations.stepparents.forEach(stepparent => {
        console.log("Rendering", stepparent, "a stepparent", "as parent")
        renderEntryEl(stepparent, "p")
    })
    relations.niblings.forEach(nibling => {
        console.log("Rendering", nibling, "a nibling", "as child")
        renderEntryEl(nibling, "c")
    })
    relations.stepchildren.forEach(stepchild => {
        console.log("Rendering", stepchild, "a stepchild", "as child")
        renderEntryEl(stepchild, "c")
    })
    relations.childreninlaw.forEach(childinlaw => {
        console.log("Rendering", childinlaw, "a child in law", "as child")
        renderEntryEl(childinlaw, "c")
    })
    renderEntryEl(relations.fromThePerspectiveOf, "focused")
}

/**Dynamically calculates grandparent and grandchild relations. */
export function discoverRelationsFromEverythingToEntry(entry: Entry): RelationsList {
    let gp: Entry[] = []
    let gc: Entry[] = []
    let ggp: Entry[] = []
    let ggc: Entry[] = []
    let sib: Entry[] = []
    let sp: Entry[] = []
    let stepparents: Entry[] = []
    let auncles: Entry[] = []
    let parentsinlaw: Entry[] = []
    let niblings: Entry[] = []
    let stepchildren: Entry[] = []
    let childreninlaw: Entry[] = []
    entry.p.forEach(parent => {
        parent.p.forEach(grandparent => {
            if (!gp.includes(grandparent))
                gp.push(grandparent)
            grandparent.p.forEach(greatgrandparent => {
                if (!ggp.includes(greatgrandparent))
                    ggp.push(greatgrandparent)
            })
            grandparent.c.forEach(auncle => {
                if (!auncles.includes(auncle) && auncle !== parent)
                    auncles.push(auncle)
            })
        })
        parent.c.forEach(sibling => {
            if (sibling !== entry) {
                if (!sib.includes(sibling))
                    sib.push(sibling)
                sibling.p.forEach(stepparent => {
                    if (parent !== stepparent && !stepparents.includes(stepparent)) {
                        stepparents.push(stepparent)
                    }
                })
                sibling.c.forEach(nibling => {
                    if (!entry.c.includes(nibling) && !niblings.includes(nibling))
                        niblings.push(nibling)
                })
            }
        })
    })
    entry.c.forEach(child => {
        child.c.forEach(grandchild => {
            if (!gc.includes(grandchild))
                gc.push(grandchild)
            grandchild.c.forEach(greatgrandchild => {
                if (!ggc.includes(greatgrandchild))
                    ggc.push(greatgrandchild)
            })
            // grandchild.p.forEach(childinlaw => {
            //     if (childinlaw !== child && !childreninlaw.includes(childinlaw))
            //         childreninlaw.push(childinlaw)
            // })
        })
        child.p.forEach(spouse => {
            if (spouse !== entry)
                if (!sp.includes(spouse)) {
                    sp.push(spouse)
                }
            spouse.p.forEach(parentinlaw => {
                if (parentinlaw !== spouse && !parentsinlaw.includes(parentinlaw)) {
                    parentsinlaw.push(parentinlaw)
                }
            })
            spouse.c.forEach(stepchild => {
                if (!entry.c.includes(stepchild) && !stepchildren.includes(stepchild)) {
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
    prioritize([[entry], entry.c, entry.p, auncles, parentsinlaw, stepparents, sib, sp, niblings, stepchildren, childreninlaw, gp, gc, ggp, ggc])
    return { fromThePerspectiveOf: entry, gp, gc, sib, sp, ggp, ggc, auncles, parentsinlaw, stepparents, niblings, stepchildren, childreninlaw }
}
/** Searches for direct (aka parent and child) links between two entries and removes them both backwards and forwards. */
export function disconnect(entry: Entry, entry2: Entry): void {
    if (entry.p.includes(entry2)) {
        removeFromArray(entry2, entry.p)
    }
    if (entry.c.includes(entry2)) {
        removeFromArray(entry2, entry.c)
    }
    if (entry2.p.includes(entry)) {
        removeFromArray(entry, entry2.p)
    }
    if (entry2.c.includes(entry)) {
        removeFromArray(entry, entry2.c)
    }
}

/** Links two entries. */
export function link(entry: Entry, childOrParentOf: "c" | "p", entry2: Entry): void {
    // allow user to pass strings to get entries (which also makes them if they don't exist)
    if (typeof entry === "string") {
        entry = Entry(entry)
    }
    if (typeof entry2 === "string") {
        entry2 = Entry(entry2)
    }
    // do not allow nodes to be both parents and child of another
    if (entry.p.includes(entry2) || entry.c.includes(entry2) || entry2.p.includes(entry) || entry2.c.includes(entry)) {
        disconnect(entry, entry2)
    }
    if (!entry[reverseRelation(childOrParentOf)].includes(entry2))
        entry[reverseRelation(childOrParentOf)].push(entry2)
    if (!entry2[childOrParentOf].includes(entry))
        entry2[childOrParentOf].push(entry)

}

export let ENTRIES: Entry[] = []