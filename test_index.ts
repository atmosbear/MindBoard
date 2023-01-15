// @ts-expect-error
import { Entry, ENTRIES, findEntryByTitle, link, discoverRelationsFromEverythingToEntry, type Entry, render } from "./index.ts"

function assert(mustBeTrue: boolean, messageIfNot: string): void {
    console.assert(mustBeTrue, messageIfNot)
}

// A deep-equality check for two arrays. Only the order can be different.
function ensureArrayEquality<G>(values: G[], array: G[], ignoreWarnings: boolean = false): boolean {
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
    console.assert(!ensureArrayEquality(A, B, ignoreWarnings))
    console.assert(!ensureArrayEquality(B, A, ignoreWarnings))
    let C = ["a", "f", "b"]
    console.assert(ensureArrayEquality(C, B, ignoreWarnings))
    console.assert(!ensureArrayEquality(A, C, ignoreWarnings))
    C.push("q")
    console.assert(!ensureArrayEquality(A, C, ignoreWarnings))
    A.push("q")
    console.assert(!ensureArrayEquality(A, C, ignoreWarnings), "These should be not the same!")
}
testArrayHelperMethod()

/**
 * Resets the tests by erasing all entries; should be called after every test is done.
 */
function clearTests(): void {
    ENTRIES.length = 0
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

        assert(A.p.includes(B) && B.c.includes(A), "The links aren't working.")

        clearTests()
    }
    function entriesCannotHaveTheSamePorCTwice() {
        let A = Entry("A")
        let B = Entry("B")
        link(A, "c", B)
        link(A, "c", B)

        assert(B.c.length === 1 && A.p.length === 1 && A.p[0] === B && B.c[0] === A, "They're present twice!")

        clearTests()
    }
    function linkingTogetherAnEntryThatIsAlreadyDirectlyRelatedBreaksTheOldRelation() {
        let A = Entry("A")
        let B = Entry("B")

        link(A, "c", B)
        ensureArrayEquality([A], B.c)
        ensureArrayEquality([], B.p)
        ensureArrayEquality([B], A.p)
        ensureArrayEquality([], A.c)
        link(A, "p", B)
        ensureArrayEquality([], B.c)
        ensureArrayEquality([A], B.p)
        ensureArrayEquality([], A.p)
        ensureArrayEquality([B], A.c)
        link(A, "c", B)
        ensureArrayEquality([A], B.c)
        ensureArrayEquality([], B.p)
        ensureArrayEquality([B], A.p)
        ensureArrayEquality([], A.c)
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
        assert(ensureArrayEquality(discoverRelationsFromEverythingToEntry(E).gc, [G]), "The grandchild relation isn't being calculated correctly!")
        assert(ensureArrayEquality(discoverRelationsFromEverythingToEntry(G).gp, [E]), "The grandparent relation isn't being calculated correctly!")
        clearTests()
    }
    function entriesCannotBeBothTheFocusedNodesGrandparentAndGrandchildBecauseGPshouldWin() {
        link("A", "p", "B")
        link("B", "p", "C")
        link("C", "p", "D")
        link("D", "p", "A")
        assert(discoverRelationsFromEverythingToEntry(Entry("C")).gc[0] !== discoverRelationsFromEverythingToEntry(Entry("C")).gp[0], "The focused node has the same grandparent and grandchild!")
        clearTests()
    }
    function grandRelationsShouldLoseInRankingVsParentAndChildRelations() {
        link("A", "p", "B")
        link("B", "p", "C")
        link("C", "p", "D")
        link("A", "c", "C")
        let m = discoverRelationsFromEverythingToEntry(Entry("C"))
        console.assert(Entry("C").c.includes(Entry("A")))
        console.assert(!m.gp.includes(Entry("A")), "There should only be a child here!")

        clearTests()
    }
    function linkingTogetherStringsShouldCreateEntriesIfTheyDontExist() {
        link("B", "c", "A")

        assert(Entry("B").p.includes(Entry("A")), "Linking together strings does not create a new entry!")

        clearTests()
    }
    function creatingTheDiamondInheritancePatternShouldNotResultInDuplicateGPorGCEntries() {
        link("A", "p", "B")
        link("B", "p", "C")
        link("A", "p", "D")
        link("D", "p", "C")

        assert(ensureArrayEquality(discoverRelationsFromEverythingToEntry(Entry("A")).gc, Entry("B").c), "There are duplicate GC relations!")
        assert(ensureArrayEquality(discoverRelationsFromEverythingToEntry(Entry("C")).gp, Entry("B").p), "There are duplicate GP relations!")

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
        console.assert(CEntry.sp.includes(Entry("spouseOfC")))
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
        console.assert(CEntry.childreninlaw.includes(Entry("Q")), "It wasn't a child in law!")
        clearTests()
    }
    function thePlusOrMinusTwoGenerationsShouldBeCalculatedCorrectly() {
        link("A", "p", "B")
        link("B", "p", "C")
        link("C", "p", "D")
        console.assert(discoverRelationsFromEverythingToEntry(Entry("D")).ggp.includes(Entry("A")), "It does not include that as a great grandchild!")
        console.assert(discoverRelationsFromEverythingToEntry(Entry("A")).ggc.includes(Entry("D")), "It does not include that as a great grandchild!")
        clearTests()
    }
    function theExtraneousCurrentGenerationOfSiblingsAndSpousesShouldBeCalculatedCorrectly() {
        link("A", "p", "B")
        link("B", "p", "C")
        link("C", "p", "D")
        link("siblingOf", "c", "A")
        console.assert(discoverRelationsFromEverythingToEntry(Entry("B")).sib.includes(Entry("siblingOf")), "The sibling relation within the current generation is not working!")
        link("spouseOfA", "p", "B")
        console.assert(discoverRelationsFromEverythingToEntry(Entry("A")).sp.includes(Entry("spouseOfA")), "The spousal relation within the current generation is not working!")
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
}

runTestSuite()