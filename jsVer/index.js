"use strict";
exports.__esModule = true;
/** A piece of information that has relations to other information. Typically user created. */
function Entry(title) {
    var alreadyExistingEntry = findEntryByTitle(title);
    if (alreadyExistingEntry === undefined) {
        var newEntry = { title: title, p: [], c: [] };
        exports.ENTRIES.push(newEntry);
        return newEntry;
    }
    else {
        return alreadyExistingEntry;
    }
}
exports.Entry = Entry;
/**
 * Searches the global ENTRIES array for an entry with the requested title and returns it if it exists.
 */
function findEntryByTitle(title) {
    var requestedEntry;
    exports.ENTRIES.forEach(function (entry) {
        if (entry.title === title) {
            requestedEntry = entry;
        }
    });
    return requestedEntry;
}
exports.findEntryByTitle = findEntryByTitle;
function reverseRelation(relation) {
    switch (relation) {
        case "p":
            return "c";
        case "c":
            return "p";
    }
}
/**
 * Removes an element from the array - just a shortcut method..
 */
function removeFromArray(A, fromB) {
    fromB.splice(fromB[fromB.indexOf(A)], 1);
}
exports.removeFromArray = removeFromArray;
/** If both the winning and losing array contain the same entry, remove it from the losing array so that the user only sees one. For example, children and grandparents. */
function aTakesPrecedenceOverB(winningArray, losingArray) {
    losingArray.forEach(function (loser) {
        if (winningArray.includes(loser)) {
            removeFromArray(loser, losingArray);
        }
    });
    losingArray.forEach(function (loser) {
        if (winningArray.includes(loser)) {
            removeFromArray(loser, losingArray);
        }
    });
}
function clearScreen() {
    Array.from(document.getElementsByClassName("entry")).forEach(function (el) { el.remove(); });
}
function renderEntryEl(entry, type) {
    if (type === "gc") {
    }
    else {
        var el = document.createElement("div");
        el.classList.add("entry");
        el.innerText = entry.title;
        el.onclick = function () {
            clearScreen();
            render(discoverRelationsFromEverythingToEntry(entry));
        };
        if (type === "focused") {
            el.classList.add("focused");
            document.getElementById("centcol").appendChild(el);
        }
        else {
            document.getElementById(type + "col").appendChild(el);
        }
    }
}
function render(relations) {
    relations.gp.forEach(function (gp) {
        renderEntryEl(gp, "gp");
    });
    relations.fromThePerspectiveOf.p.forEach(function (parent) {
        renderEntryEl(parent, "p");
    });
    relations.fromThePerspectiveOf.c.forEach(function (child) {
        renderEntryEl(child, "c");
    });
    relations.gc.forEach(function (gc) {
        renderEntryEl(gc, "gc");
    });
    relations.sib.forEach(function (sib) {
        console.log("Rendering", sib, "a sibling", "as center");
        renderEntryEl(sib, "cent");
    });
    relations.sp.forEach(function (spouse) {
        console.log("Rendering", spouse, "a spouse", "as center");
        renderEntryEl(spouse, "cent");
    });
    // skip GGP and GGC
    relations.auncles.forEach(function (auncle) {
        console.log("Rendering", auncle, "a auncle", "as parent");
        renderEntryEl(auncle, "p");
    });
    relations.parentsinlaw.forEach(function (parentinlaw) {
        console.log("Rendering", parentinlaw, "a parentinlaw", "as parent");
        renderEntryEl(parentinlaw, "p");
    });
    relations.stepparents.forEach(function (stepparent) {
        console.log("Rendering", stepparent, "a stepparent", "as parent");
        renderEntryEl(stepparent, "p");
    });
    relations.niblings.forEach(function (nibling) {
        console.log("Rendering", nibling, "a nibling", "as child");
        renderEntryEl(nibling, "c");
    });
    relations.stepchildren.forEach(function (stepchild) {
        console.log("Rendering", stepchild, "a stepchild", "as child");
        renderEntryEl(stepchild, "c");
    });
    relations.childreninlaw.forEach(function (childinlaw) {
        console.log("Rendering", childinlaw, "a child in law", "as child");
        renderEntryEl(childinlaw, "c");
    });
    renderEntryEl(relations.fromThePerspectiveOf, "focused");
}
exports.render = render;
/**Dynamically calculates grandparent and grandchild relations. */
function discoverRelationsFromEverythingToEntry(entry) {
    var gp = [];
    var gc = [];
    var ggp = [];
    var ggc = [];
    var sib = [];
    var sp = [];
    var stepparents = [];
    var auncles = [];
    var parentsinlaw = [];
    var niblings = [];
    var stepchildren = [];
    var childreninlaw = [];
    entry.p.forEach(function (parent) {
        parent.p.forEach(function (grandparent) {
            if (!gp.includes(grandparent))
                gp.push(grandparent);
            grandparent.p.forEach(function (greatgrandparent) {
                if (!ggp.includes(greatgrandparent))
                    ggp.push(greatgrandparent);
            });
            grandparent.c.forEach(function (auncle) {
                if (!auncles.includes(auncle) && auncle !== parent)
                    auncles.push(auncle);
            });
        });
        parent.c.forEach(function (sibling) {
            if (sibling !== entry) {
                if (!sib.includes(sibling))
                    sib.push(sibling);
                sibling.p.forEach(function (stepparent) {
                    if (parent !== stepparent && !stepparents.includes(stepparent)) {
                        stepparents.push(stepparent);
                    }
                });
                sibling.c.forEach(function (nibling) {
                    if (!entry.c.includes(nibling) && !niblings.includes(nibling))
                        niblings.push(nibling);
                });
            }
        });
    });
    entry.c.forEach(function (child) {
        child.c.forEach(function (grandchild) {
            if (!gc.includes(grandchild))
                gc.push(grandchild);
            grandchild.c.forEach(function (greatgrandchild) {
                if (!ggc.includes(greatgrandchild))
                    ggc.push(greatgrandchild);
            });
            // grandchild.p.forEach(childinlaw => {
            //     if (childinlaw !== child && !childreninlaw.includes(childinlaw))
            //         childreninlaw.push(childinlaw)
            // })
        });
        child.p.forEach(function (spouse) {
            if (spouse !== entry)
                if (!sp.includes(spouse)) {
                    sp.push(spouse);
                }
            spouse.p.forEach(function (parentinlaw) {
                if (parentinlaw !== spouse && !parentsinlaw.includes(parentinlaw)) {
                    parentsinlaw.push(parentinlaw);
                }
            });
            spouse.c.forEach(function (stepchild) {
                if (!entry.c.includes(stepchild) && !stepchildren.includes(stepchild)) {
                    stepchildren.push(stepchild);
                }
            });
        });
    });
    function prioritize(array) {
        array.forEach(function (arr, i) {
            array.forEach(function (arr2, j) {
                if (i < j) {
                    aTakesPrecedenceOverB(arr, arr2);
                }
            });
        });
    }
    prioritize([[entry], entry.c, entry.p, auncles, parentsinlaw, stepparents, sib, sp, niblings, stepchildren, childreninlaw, gp, gc, ggp, ggc]);
    return { fromThePerspectiveOf: entry, gp: gp, gc: gc, sib: sib, sp: sp, ggp: ggp, ggc: ggc, auncles: auncles, parentsinlaw: parentsinlaw, stepparents: stepparents, niblings: niblings, stepchildren: stepchildren, childreninlaw: childreninlaw };
}
exports.discoverRelationsFromEverythingToEntry = discoverRelationsFromEverythingToEntry;
/** Searches for direct (aka parent and child) links between two entries and removes them both backwards and forwards. */
function disconnect(entry, entry2) {
    if (entry.p.includes(entry2)) {
        removeFromArray(entry2, entry.p);
    }
    if (entry.c.includes(entry2)) {
        removeFromArray(entry2, entry.c);
    }
    if (entry2.p.includes(entry)) {
        removeFromArray(entry, entry2.p);
    }
    if (entry2.c.includes(entry)) {
        removeFromArray(entry, entry2.c);
    }
}
exports.disconnect = disconnect;
/** Links two entries. */
function link(entry, childOrParentOf, entry2) {
    // allow user to pass strings to get entries (which also makes them if they don't exist)
    if (typeof entry === "string") {
        entry = Entry(entry);
    }
    if (typeof entry2 === "string") {
        entry2 = Entry(entry2);
    }
    // do not allow nodes to be both parents and child of another
    if (entry.p.includes(entry2) || entry.c.includes(entry2) || entry2.p.includes(entry) || entry2.c.includes(entry)) {
        disconnect(entry, entry2);
    }
    if (!entry[reverseRelation(childOrParentOf)].includes(entry2))
        entry[reverseRelation(childOrParentOf)].push(entry2);
    if (!entry2[childOrParentOf].includes(entry))
        entry2[childOrParentOf].push(entry);
}
exports.link = link;
exports.ENTRIES = [];
