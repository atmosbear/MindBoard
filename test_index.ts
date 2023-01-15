// @ts-expect-error
import { Entry, clearScreen, getColumnElement, ColumnName, getEntryElementsWithinColumn, ENTRIES, findEntryByTitle, link, discoverRelationsFromEverythingToEntry, type Entry, render } from "./index.ts"

function assert(mustBeTrue: boolean, messageIfNot: string): void {
    console.assert(mustBeTrue, messageIfNot)
}

// A deep-equality check for two arrays. Only the order can be different.
function ensureDeepEquality<G>(values: G[], array: G[], ignoreWarnings: boolean = false): boolean {
    let isEqual = true
    let matchingValues: G[] = []
    if (array.length !== values.length) {
        isEqual = false
        if (ignoreWarnings === false)
            console.warn("The arrays are not equal - their lengths are different!!", values, array, ignoreWarnings)
    }

    // first compare V to A
    if (isEqual === true)
        values.forEach(value => {
            if (!array.includes(value)) {
                isEqual = false
                if (ignoreWarnings === false)
                    console.warn("The arrays are not equal - it's missing '" + value + "'!")
            } else {
                matchingValues.push(value)
            }
        })
    if (isEqual === true)
        if (matchingValues.length !== array.length) {
            isEqual = false
        }
    matchingValues.length = 0

    // compare the reverse just to ensure none were missed
    if (isEqual === true)
        array.forEach(arr => {
            if (!values.includes(arr)) {
                isEqual = false
                if (ignoreWarnings === false)
                    console.warn("The arrays are not equal - it's missing '" + arr + "'!")
            } else {
                matchingValues.push(arr)
            }
        })
    if (isEqual === true)
        if (matchingValues.length !== array.length) {
            isEqual = false
        }
    return isEqual
}
/**
 * Ensures that the method for testing deep array equality is correct.
 */
function testArrayHelperMethod(): void {
    let A = ["a", "b", "q"]
    let B = ["f", "a", "b"]
    let ignoreWarnings = true
    console.assert(!ensureDeepEquality(A, B, ignoreWarnings))
    console.assert(!ensureDeepEquality(B, A, ignoreWarnings))
    let C = ["a", "f", "b"]
    console.assert(ensureDeepEquality(C, B, ignoreWarnings))
    console.assert(!ensureDeepEquality(A, C, ignoreWarnings))
    C.push("q")
    console.assert(!ensureDeepEquality(A, C, ignoreWarnings))
    A.push("q")
    console.assert(!ensureDeepEquality(A, C, ignoreWarnings), "These should be not the same!")
}
testArrayHelperMethod()

function simulateTyping(message: string): void {
    Array.from(message).forEach((letter, i) => {
        setTimeout(() => {
            dispatchEvent(new KeyboardEvent("keydown", { key: letter }))
        }, Math.random() * 100 + 200 * i)
    })
}

/**
 * Resets the tests by erasing all entries; should be called after every test is done.
 */
function clearTests(): void {
    ENTRIES.length = 0
    clearScreen()
}
function runTestSuite(): void {
    function entriesShouldBeAddedToAGlobalContextDuringCreation() {
        let A = Entry("I am an entry.")
        let B = Entry("I am also an entry!")

        assert(
            ENTRIES.includes(A) && ENTRIES.includes(B),
            "The entries created were not added to the global context."
        )

        clearTests()
    }
    function testResultsShouldBeClearedBetweenTests() {
        assert(ENTRIES.length === 0, "Tests are not independent! Did you clear all previous tests?")

        clearTests()
    }
    function twoEntriesShouldNeverHaveTheSameTitle() {
        Entry("A")
        Entry("B")
        Entry("A")

        ENTRIES.forEach((entry, i) => {
            ENTRIES.forEach((entry2, j) => {
                if (i !== j)
                    assert(entry.title !== entry2.title, "There are two entries with the same title in the global array!")
            })
        })

        clearTests()
    }
    function entriesShouldBeAbleToBeFoundByTitle() {
        Entry("A")
        Entry("B")
        Entry("A")

        let C = Entry("C")
        assert(findEntryByTitle("C") === C, "The entry was not able to be found!")

        clearTests()
    }
    function requestingAnewEntryWithANameThatAlreadyExistsShouldGiveThatAlreadyExistingEntry() {
        Entry("A")
        Entry("B")
        Entry("C")
        let A = Entry("A")

        assert(A === findEntryByTitle("A"), "It did not return that same entry!")

        clearTests()
    }
    function entriesCanBeLinkedTogetherAsParentsOrChildrenAndReversesAutomatically() {
        let A = Entry("A")
        let B = Entry("B")
        link(A, "c", B)

        assert(A.parents.includes(B) && B.children.includes(A), "The links aren't working.")

        clearTests()
    }
    function entriesCannotHaveTheSamePorCTwice() {
        let A = Entry("A")
        let B = Entry("B")
        link(A, "c", B)
        link(A, "c", B)

        assert(B.children.length === 1 && A.parents.length === 1 && A.parents[0] === B && B.children[0] === A, "They're present twice!")

        clearTests()
    }
    function linkingTogetherAnEntryThatIsAlreadyDirectlyRelatedBreaksTheOldRelation() {
        let A = Entry("A")
        let B = Entry("B")

        link(A, "c", B)
        ensureDeepEquality([A], B.children)
        ensureDeepEquality([], B.parents)
        ensureDeepEquality([B], A.parents)
        ensureDeepEquality([], A.children)
        link(A, "p", B)
        ensureDeepEquality([], B.children)
        ensureDeepEquality([A], B.parents)
        ensureDeepEquality([], A.parents)
        ensureDeepEquality([B], A.children)
        link(A, "c", B)
        ensureDeepEquality([A], B.children)
        ensureDeepEquality([], B.parents)
        ensureDeepEquality([B], A.parents)
        ensureDeepEquality([], A.children)
        clearTests()
    }
    function addingGPandGCRelationsIsDoneDynamicallyBasedOnPRatherThanStoredInTheObject() { // not descriptive enough
        let A = Entry("A")
        let B = Entry("B")
        let C = Entry("C")
        let D = Entry("D")
        let E = Entry("E")
        let F = Entry("F")
        let G = Entry("G")
        link(F, "c", E)
        link(G, "c", F)
        assert(ensureDeepEquality(discoverRelationsFromEverythingToEntry(E).grandchildren, [G]), "The grandchild relation isn't being calculated correctly!")
        assert(ensureDeepEquality(discoverRelationsFromEverythingToEntry(G).grandparents, [E]), "The grandparent relation isn't being calculated correctly!")
        clearTests()
    }
    function entriesCannotBeBothTheFocusedNodesGrandparentAndGrandchildBecauseGPshouldWin() {
        link("A", "p", "B")
        link("B", "p", "C")
        link("C", "p", "D")
        link("D", "p", "A")
        assert(discoverRelationsFromEverythingToEntry(Entry("C")).grandchildren[0] !== discoverRelationsFromEverythingToEntry(Entry("C")).grandparents[0], "The focused node has the same grandparent and grandchild!")
        clearTests()
    }
    function grandRelationsShouldLoseInRankingVsParentAndChildRelations() {
        link("A", "p", "B")
        link("B", "p", "C")
        link("C", "p", "D")
        link("A", "c", "C")
        let m = discoverRelationsFromEverythingToEntry(Entry("C"))
        console.assert(Entry("C").children.includes(Entry("A")))
        console.assert(!m.grandparents.includes(Entry("A")), "There should only be a child here!")

        clearTests()
    }
    function linkingTogetherStringsShouldCreateEntriesIfTheyDontExist() {
        link("B", "c", "A")

        assert(Entry("B").parents.includes(Entry("A")), "Linking together strings does not create a new entry!")

        clearTests()
    }
    function creatingTheDiamondInheritancePatternShouldNotResultInDuplicateGPorGCEntries() {
        link("A", "p", "B")
        link("B", "p", "C")
        link("A", "p", "D")
        link("D", "p", "C")

        assert(ensureDeepEquality(discoverRelationsFromEverythingToEntry(Entry("A")).grandchildren, Entry("B").children), "There are duplicate GC relations!")
        assert(ensureDeepEquality(discoverRelationsFromEverythingToEntry(Entry("C")).grandparents, Entry("B").parents), "There are duplicate GP relations!")

        clearTests()
    }
    function thePlusOneGenerationShouldBeCalculatedCorrectly() {
        link("A", "p", "B")
        link("B", "p", "C")
        link("C", "p", "D")
        link("childOfAandAuncleOfC", "c", "A")
        link("siblingOfC", "c", "B")
        link("stepParentOfC", "p", "siblingOfC")
        link("spouseOfC", "p", "D")
        link("parentInLawOfC", "p", "spouseOfC")
        let CEntry = discoverRelationsFromEverythingToEntry(Entry("C"))
        console.assert(CEntry.auncles.includes(Entry("childOfAandAuncleOfC")), "It wasn't an auncle!")
        console.assert(CEntry.stepparents.includes(Entry("stepParentOfC")), "It wasn't a step parent!")
        console.assert(CEntry.parentsinlaw.includes(Entry("parentInLawOfC")), "It wasn't a parent in law!")
        console.assert(CEntry.spouses.includes(Entry("spouseOfC")))
        clearTests()
    }
    function theMinusOneGenerationShouldBeCalculatedCorrectly() {
        link("A", "p", "B")
        link("B", "p", "C")
        link("C", "p", "D")
        // nibling: ABB
        link("D", "c", "B")
        link("R", "c", "D")
        // stepchild: BAB
        link("Z", "c", "C")
        link("L", "p", "Z")
        link("F", "c", "L")
        // childinlaw: BBA
        link("T", "c", "Z")
        link("Q", "p", "T")
        let CEntry = discoverRelationsFromEverythingToEntry(Entry("C"))
        console.assert(CEntry.niblings.includes(Entry("R")), "It wasn't a nibling!")
        console.assert(CEntry.stepchildren.includes(Entry("F")), "It wasn't a stepchild!")
        // console.assert(CEntry.childreninlaw.includes(Entry("Q")), "It wasn't a child in law!")
        console.warn("Need to check this: the minus one generation for niblings.")
        // note that this particular one has trouble working, only because it's also an uncle. As long as it shows up, it's fine. - wait, actually I think this is wrong.
        clearTests()
    }
    function thePlusOrMinusTwoGenerationsShouldBeCalculatedCorrectly() {
        link("A", "p", "B")
        link("B", "p", "C")
        link("C", "p", "D")
        console.assert(discoverRelationsFromEverythingToEntry(Entry("D")).greatgrandparents.includes(Entry("A")), "It does not include that as a great grandchild!")
        console.assert(discoverRelationsFromEverythingToEntry(Entry("A")).greatgrandchildren.includes(Entry("D")), "It does not include that as a great grandchild!")
        clearTests()
    }
    function theExtraneousCurrentGenerationOfSiblingsAndSpousesShouldBeCalculatedCorrectly() {
        link("A", "p", "B")
        link("B", "p", "C")
        link("C", "p", "D")
        link("siblingOf", "c", "A")
        console.assert(discoverRelationsFromEverythingToEntry(Entry("B")).siblings.includes(Entry("siblingOf")), "The sibling relation within the current generation is not working!")
        link("spouseOfA", "p", "B")
        console.assert(discoverRelationsFromEverythingToEntry(Entry("A")).spouses.includes(Entry("spouseOfA")), "The spousal relation within the current generation is not working!")
        clearTests()
    }
    function renderingWorks() {
        link("A", "p", "B")
        link("B", "p", "C")
        link("C", "p", "D")
        link("A", "p", "B")
        link("B", "p", "C")
        link("C", "p", "D")
        // nibling: ABB
        link("D", "c", "B")
        link("R", "c", "D")
        // stepchild: BAB
        link("Z", "c", "C")
        link("L", "p", "Z")
        link("F", "c", "L")
        // childinlaw: BBA
        link("T", "c", "Z")
        link("Q", "p", "T")
        let m = discoverRelationsFromEverythingToEntry(Entry("C"))
        render(m)
        let foundFocused = false
        Array.from(getColumnElement("center").children).forEach((child: Element) => {
            if (child.innerHTML === "C" && child.classList.contains("focused")) {
                foundFocused = true
            }
        }) //@ts-expect-error
        assert(foundFocused === true, "Focused wasn't found!")
        assert(m.grandchildren.length === 1, "1 is not the exact number of grandchildren!")
        let grandchildrenHolders: Element[] = Array.from(getColumnElement("grandchildren").children)
        // it's within box 1 according to how that up there was set up, so:
        assert(grandchildrenHolders[1].children.length === 1, "There was 1 grandchild, but it did not render!")
        assert(didEntryRenderInColumn(Entry("C"), "center"), "It was not rendered in the proper column!")
        clearTests()
        clearScreen()
    }
    function userCanAddNodesUsingKeyboard() {
        // dispatchEvent(new Event("keydown"))
        // document.getElementById("new-entry-input").focus()
        // simulateTyping("This is a new node created using the keyboard!")
        // simulateTyping("e")
        assert(false, "Not implemented: keyboard.")
    }
    function arrayDig(array: any[], property: string): any[] {
        let ret = []
        array.forEach(res => {
            ret.push(res[property])
        })
        return ret
    }
    function didEntryRenderInColumn(entry: Entry, columnName: ColumnName) {
        let elements = getEntryElementsWithinColumn(columnName)
        return arrayDig(elements, "innerHTML").includes(entry.title)
    }
    function GCsShouldRenderInAHolderNotEntry() {
        link("A", "p", "B")
        link("B", "p", "C")
        link("C", "p", "D")
        link("D", "p", "E")
        render(discoverRelationsFromEverythingToEntry(Entry("B")))
        let gcColElements = getEntryElementsWithinColumn("grandchildren")
        let grandchildHolder0 = gcColElements[0]
        assert(grandchildHolder0 !== undefined && grandchildHolder0 !== null, "grandchild-holder-0 doesn't exist!")
        assert(grandchildHolder0.id === "grandchild-holder-0", "grandchild-holder-0 doesn't have the right id!")
        assert(!grandchildHolder0.classList.contains("entry"), "grandchild-holder-0 is an entry, not a grandchild-holder!")
        assert(grandchildHolder0.classList.contains("grandchild-holder"), "grandchild-holder-0 doesn't have the grandchild-holder class!")
        let childrenOfGCHolder: Element[] = Array.from(grandchildHolder0.children)
        assert(arrayDig(childrenOfGCHolder, "innerText").includes("D"), "The GC entry expected wasn't found.")
        assert(childrenOfGCHolder[0].classList.contains("gcentry"), "The GC doesn't have the GC class.")
        clearTests()

    }
    function GCsShouldRenderNextToTheProperChild() {
        // setup
        link("A", "p", "B")
        link("B", "p", "C")
        link("C", "p", "D")
        link("D", "c", "B")
        link("D", "p", "E")
        render(discoverRelationsFromEverythingToEntry(Entry("B")))
        // get the child entry's position
        let childPosition: number = -1
        let children = getEntryElementsWithinColumn("children")
        children.forEach((childElement: Element, i: number) => {
            if (childElement.innerHTML === "D") {
                childPosition = i
            }
        })
        console.assert(childPosition === 1, "Child is not one!")
        // get the grandchild's six-box position
        let grandchildHolders = getEntryElementsWithinColumn("grandchildren")
        let grandchildPosition: number
        grandchildHolders.forEach((grandchildHolderElement: Element, i: number) => {
            let grandchildElements = Array.from(grandchildHolderElement.children)
            let grandchildElementTitles = arrayDig(grandchildElements, "innerText")
            if (grandchildElementTitles.includes("E")) {
                grandchildPosition = i
            }
        })
        // ensure that the grandchild is within the correct one
        assert(ensureDeepEquality(Entry("E").parents, [Entry("D")]), "E's only parent is not D!")
        console.assert(grandchildPosition === 1, "GC is not one!")
        assert(childPosition === grandchildPosition, "The grandchild entry doesn't render next to its parent entry!")
        clearTests()
    }
    function shouldNiblingsReallyLoseToGC() {
        assert(false, "Niblings issue, not yet implemented. Side note: should grandparents really lose to auncles? Hmm...")
    }
    entriesCannotHaveTheSamePorCTwice()
    entriesShouldBeAddedToAGlobalContextDuringCreation()
    testResultsShouldBeClearedBetweenTests()
    twoEntriesShouldNeverHaveTheSameTitle()
    entriesShouldBeAbleToBeFoundByTitle()
    requestingAnewEntryWithANameThatAlreadyExistsShouldGiveThatAlreadyExistingEntry()
    entriesCanBeLinkedTogetherAsParentsOrChildrenAndReversesAutomatically()
    linkingTogetherAnEntryThatIsAlreadyDirectlyRelatedBreaksTheOldRelation()
    addingGPandGCRelationsIsDoneDynamicallyBasedOnPRatherThanStoredInTheObject()
    entriesCannotBeBothTheFocusedNodesGrandparentAndGrandchildBecauseGPshouldWin()
    linkingTogetherStringsShouldCreateEntriesIfTheyDontExist()
    grandRelationsShouldLoseInRankingVsParentAndChildRelations()
    creatingTheDiamondInheritancePatternShouldNotResultInDuplicateGPorGCEntries()
    thePlusOneGenerationShouldBeCalculatedCorrectly()
    theMinusOneGenerationShouldBeCalculatedCorrectly()
    thePlusOrMinusTwoGenerationsShouldBeCalculatedCorrectly()
    theExtraneousCurrentGenerationOfSiblingsAndSpousesShouldBeCalculatedCorrectly()
    renderingWorks()
    userCanAddNodesUsingKeyboard()
    GCsShouldRenderInAHolderNotEntry()
    GCsShouldRenderNextToTheProperChild()
    shouldNiblingsReallyLoseToGC()
}

runTestSuite()