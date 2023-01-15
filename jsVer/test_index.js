"use strict";
exports.__esModule = true;
// @ts-expect-error
var index_ts_1 = require("./index.ts");
function assert(mustBeTrue, messageIfNot) {
    console.assert(mustBeTrue, messageIfNot);
}
// A deep-equality check for two arrays. Only the order can be different.
function ensureArrayEquality(values, array, ignoreWarnings) {
    if (ignoreWarnings === void 0) { ignoreWarnings = false; }
    var isEqual = true;
    var matchingValues = [];
    if (array.length !== values.length) {
        isEqual = false;
        if (ignoreWarnings === false)
            console.warn("The arrays are not equal - their lengths are different!!", values, array, ignoreWarnings);
    }
    // first compare V to A
    if (isEqual === true)
        values.forEach(function (value) {
            if (!array.includes(value)) {
                isEqual = false;
                if (ignoreWarnings === false)
                    console.warn("The arrays are not equal - it's missing '" + value + "'!");
            }
            else {
                matchingValues.push(value);
            }
        });
    if (isEqual === true)
        if (matchingValues.length !== array.length) {
            isEqual = false;
        }
    matchingValues.length = 0;
    // compare the reverse just to ensure none were missed
    if (isEqual === true)
        array.forEach(function (arr) {
            if (!values.includes(arr)) {
                isEqual = false;
                if (ignoreWarnings === false)
                    console.warn("The arrays are not equal - it's missing '" + arr + "'!");
            }
            else {
                matchingValues.push(arr);
            }
        });
    if (isEqual === true)
        if (matchingValues.length !== array.length) {
            isEqual = false;
        }
    return isEqual;
}
/**
 * Ensures that the method for testing deep array equality is correct.
 */
function testArrayHelperMethod() {
    var A = ["a", "b", "q"];
    var B = ["f", "a", "b"];
    var ignoreWarnings = true;
    console.assert(!ensureArrayEquality(A, B, ignoreWarnings));
    console.assert(!ensureArrayEquality(B, A, ignoreWarnings));
    var C = ["a", "f", "b"];
    console.assert(ensureArrayEquality(C, B, ignoreWarnings));
    console.assert(!ensureArrayEquality(A, C, ignoreWarnings));
    C.push("q");
    console.assert(!ensureArrayEquality(A, C, ignoreWarnings));
    A.push("q");
    console.assert(!ensureArrayEquality(A, C, ignoreWarnings), "These should be not the same!");
}
testArrayHelperMethod();
/**
 * Resets the tests by erasing all entries; should be called after every test is done.
 */
function clearTests() {
    index_ts_1.ENTRIES.length = 0;
}
function runTestSuite() {
    function entriesShouldBeAddedToAGlobalContextDuringCreation() {
        var A = index_ts_1.Entry("I am an entry.");
        var B = index_ts_1.Entry("I am also an entry!");
        assert(index_ts_1.ENTRIES.includes(A) && index_ts_1.ENTRIES.includes(B), "The entries created were not added to the global context.");
        clearTests();
    }
    function testResultsShouldBeClearedBetweenTests() {
        assert(index_ts_1.ENTRIES.length === 0, "Tests are not independent! Did you clear all previous tests?");
        clearTests();
    }
    function twoEntriesShouldNeverHaveTheSameTitle() {
        index_ts_1.Entry("A");
        index_ts_1.Entry("B");
        index_ts_1.Entry("A");
        index_ts_1.ENTRIES.forEach(function (entry, i) {
            index_ts_1.ENTRIES.forEach(function (entry2, j) {
                if (i !== j)
                    assert(entry.title !== entry2.title, "There are two entries with the same title in the global array!");
            });
        });
        clearTests();
    }
    function entriesShouldBeAbleToBeFoundByTitle() {
        index_ts_1.Entry("A");
        index_ts_1.Entry("B");
        index_ts_1.Entry("A");
        var C = index_ts_1.Entry("C");
        assert(index_ts_1.findEntryByTitle("C") === C, "The entry was not able to be found!");
        clearTests();
    }
    function requestingAnewEntryWithANameThatAlreadyExistsShouldGiveThatAlreadyExistingEntry() {
        index_ts_1.Entry("A");
        index_ts_1.Entry("B");
        index_ts_1.Entry("C");
        var A = index_ts_1.Entry("A");
        assert(A === index_ts_1.findEntryByTitle("A"), "It did not return that same entry!");
        clearTests();
    }
    function entriesCanBeLinkedTogetherAsParentsOrChildrenAndReversesAutomatically() {
        var A = index_ts_1.Entry("A");
        var B = index_ts_1.Entry("B");
        index_ts_1.link(A, "c", B);
        assert(A.p.includes(B) && B.c.includes(A), "The links aren't working.");
        clearTests();
    }
    function entriesCannotHaveTheSamePorCTwice() {
        var A = index_ts_1.Entry("A");
        var B = index_ts_1.Entry("B");
        index_ts_1.link(A, "c", B);
        index_ts_1.link(A, "c", B);
        assert(B.c.length === 1 && A.p.length === 1 && A.p[0] === B && B.c[0] === A, "They're present twice!");
        clearTests();
    }
    function linkingTogetherAnEntryThatIsAlreadyDirectlyRelatedBreaksTheOldRelation() {
        var A = index_ts_1.Entry("A");
        var B = index_ts_1.Entry("B");
        index_ts_1.link(A, "c", B);
        ensureArrayEquality([A], B.c);
        ensureArrayEquality([], B.p);
        ensureArrayEquality([B], A.p);
        ensureArrayEquality([], A.c);
        index_ts_1.link(A, "p", B);
        ensureArrayEquality([], B.c);
        ensureArrayEquality([A], B.p);
        ensureArrayEquality([], A.p);
        ensureArrayEquality([B], A.c);
        index_ts_1.link(A, "c", B);
        ensureArrayEquality([A], B.c);
        ensureArrayEquality([], B.p);
        ensureArrayEquality([B], A.p);
        ensureArrayEquality([], A.c);
        clearTests();
    }
    function addingGPandGCRelationsIsDoneDynamicallyBasedOnPRatherThanStoredInTheObject() {
        var A = index_ts_1.Entry("A");
        var B = index_ts_1.Entry("B");
        var C = index_ts_1.Entry("C");
        var D = index_ts_1.Entry("D");
        var E = index_ts_1.Entry("E");
        var F = index_ts_1.Entry("F");
        var G = index_ts_1.Entry("G");
        index_ts_1.link(F, "c", E);
        index_ts_1.link(G, "c", F);
        assert(ensureArrayEquality(index_ts_1.discoverRelationsFromEverythingToEntry(E).gc, [G]), "The grandchild relation isn't being calculated correctly!");
        assert(ensureArrayEquality(index_ts_1.discoverRelationsFromEverythingToEntry(G).gp, [E]), "The grandparent relation isn't being calculated correctly!");
        clearTests();
    }
    function entriesCannotBeBothTheFocusedNodesGrandparentAndGrandchildBecauseGPshouldWin() {
        index_ts_1.link("A", "p", "B");
        index_ts_1.link("B", "p", "C");
        index_ts_1.link("C", "p", "D");
        index_ts_1.link("D", "p", "A");
        assert(index_ts_1.discoverRelationsFromEverythingToEntry(index_ts_1.Entry("C")).gc[0] !== index_ts_1.discoverRelationsFromEverythingToEntry(index_ts_1.Entry("C")).gp[0], "The focused node has the same grandparent and grandchild!");
        clearTests();
    }
    function grandRelationsShouldLoseInRankingVsParentAndChildRelations() {
        index_ts_1.link("A", "p", "B");
        index_ts_1.link("B", "p", "C");
        index_ts_1.link("C", "p", "D");
        index_ts_1.link("A", "c", "C");
        var m = index_ts_1.discoverRelationsFromEverythingToEntry(index_ts_1.Entry("C"));
        console.assert(index_ts_1.Entry("C").c.includes(index_ts_1.Entry("A")));
        console.assert(!m.gp.includes(index_ts_1.Entry("A")), "There should only be a child here!");
        clearTests();
    }
    function linkingTogetherStringsShouldCreateEntriesIfTheyDontExist() {
        index_ts_1.link("B", "c", "A");
        assert(index_ts_1.Entry("B").p.includes(index_ts_1.Entry("A")), "Linking together strings does not create a new entry!");
        clearTests();
    }
    function creatingTheDiamondInheritancePatternShouldNotResultInDuplicateGPorGCEntries() {
        index_ts_1.link("A", "p", "B");
        index_ts_1.link("B", "p", "C");
        index_ts_1.link("A", "p", "D");
        index_ts_1.link("D", "p", "C");
        assert(ensureArrayEquality(index_ts_1.discoverRelationsFromEverythingToEntry(index_ts_1.Entry("A")).gc, index_ts_1.Entry("B").c), "There are duplicate GC relations!");
        assert(ensureArrayEquality(index_ts_1.discoverRelationsFromEverythingToEntry(index_ts_1.Entry("C")).gp, index_ts_1.Entry("B").p), "There are duplicate GP relations!");
        clearTests();
    }
    function thePlusOneGenerationShouldBeCalculatedCorrectly() {
        index_ts_1.link("A", "p", "B");
        index_ts_1.link("B", "p", "C");
        index_ts_1.link("C", "p", "D");
        index_ts_1.link("childOfAandAuncleOfC", "c", "A");
        index_ts_1.link("siblingOfC", "c", "B");
        index_ts_1.link("stepParentOfC", "p", "siblingOfC");
        index_ts_1.link("spouseOfC", "p", "D");
        index_ts_1.link("parentInLawOfC", "p", "spouseOfC");
        var CEntry = index_ts_1.discoverRelationsFromEverythingToEntry(index_ts_1.Entry("C"));
        console.assert(CEntry.auncles.includes(index_ts_1.Entry("childOfAandAuncleOfC")), "It wasn't an auncle!");
        console.assert(CEntry.stepparents.includes(index_ts_1.Entry("stepParentOfC")), "It wasn't a step parent!");
        console.assert(CEntry.parentsinlaw.includes(index_ts_1.Entry("parentInLawOfC")), "It wasn't a parent in law!");
        console.assert(CEntry.sp.includes(index_ts_1.Entry("spouseOfC")));
        clearTests();
    }
    function theMinusOneGenerationShouldBeCalculatedCorrectly() {
        index_ts_1.link("A", "p", "B");
        index_ts_1.link("B", "p", "C");
        index_ts_1.link("C", "p", "D");
        // nibling: ABB
        index_ts_1.link("D", "c", "B");
        index_ts_1.link("R", "c", "D");
        // stepchild: BAB
        index_ts_1.link("Z", "c", "C");
        index_ts_1.link("L", "p", "Z");
        index_ts_1.link("F", "c", "L");
        // childinlaw: BBA
        index_ts_1.link("T", "c", "Z");
        index_ts_1.link("Q", "p", "T");
        var CEntry = index_ts_1.discoverRelationsFromEverythingToEntry(index_ts_1.Entry("C"));
        console.assert(CEntry.niblings.includes(index_ts_1.Entry("R")), "It wasn't a nibling!");
        console.assert(CEntry.stepchildren.includes(index_ts_1.Entry("F")), "It wasn't a stepchild!");
        console.assert(CEntry.childreninlaw.includes(index_ts_1.Entry("Q")), "It wasn't a child in law!");
        clearTests();
    }
    function thePlusOrMinusTwoGenerationsShouldBeCalculatedCorrectly() {
        index_ts_1.link("A", "p", "B");
        index_ts_1.link("B", "p", "C");
        index_ts_1.link("C", "p", "D");
        console.assert(index_ts_1.discoverRelationsFromEverythingToEntry(index_ts_1.Entry("D")).ggp.includes(index_ts_1.Entry("A")), "It does not include that as a great grandchild!");
        console.assert(index_ts_1.discoverRelationsFromEverythingToEntry(index_ts_1.Entry("A")).ggc.includes(index_ts_1.Entry("D")), "It does not include that as a great grandchild!");
        clearTests();
    }
    function theExtraneousCurrentGenerationOfSiblingsAndSpousesShouldBeCalculatedCorrectly() {
        index_ts_1.link("A", "p", "B");
        index_ts_1.link("B", "p", "C");
        index_ts_1.link("C", "p", "D");
        index_ts_1.link("siblingOf", "c", "A");
        console.assert(index_ts_1.discoverRelationsFromEverythingToEntry(index_ts_1.Entry("B")).sib.includes(index_ts_1.Entry("siblingOf")), "The sibling relation within the current generation is not working!");
        index_ts_1.link("spouseOfA", "p", "B");
        console.assert(index_ts_1.discoverRelationsFromEverythingToEntry(index_ts_1.Entry("A")).sp.includes(index_ts_1.Entry("spouseOfA")), "The spousal relation within the current generation is not working!");
        clearTests();
    }
    function renderingWorks() {
        index_ts_1.link("A", "p", "B");
        index_ts_1.link("B", "p", "C");
        index_ts_1.link("C", "p", "D");
        index_ts_1.link("A", "p", "B");
        index_ts_1.link("B", "p", "C");
        index_ts_1.link("C", "p", "D");
        // nibling: ABB
        index_ts_1.link("D", "c", "B");
        index_ts_1.link("R", "c", "D");
        // stepchild: BAB
        index_ts_1.link("Z", "c", "C");
        index_ts_1.link("L", "p", "Z");
        index_ts_1.link("F", "c", "L");
        // childinlaw: BBA
        index_ts_1.link("T", "c", "Z");
        index_ts_1.link("Q", "p", "T");
        var m = index_ts_1.discoverRelationsFromEverythingToEntry(index_ts_1.Entry("C"));
        index_ts_1.render(m);
    }
    entriesCannotHaveTheSamePorCTwice();
    entriesShouldBeAddedToAGlobalContextDuringCreation();
    testResultsShouldBeClearedBetweenTests();
    twoEntriesShouldNeverHaveTheSameTitle();
    entriesShouldBeAbleToBeFoundByTitle();
    requestingAnewEntryWithANameThatAlreadyExistsShouldGiveThatAlreadyExistingEntry();
    entriesCanBeLinkedTogetherAsParentsOrChildrenAndReversesAutomatically();
    linkingTogetherAnEntryThatIsAlreadyDirectlyRelatedBreaksTheOldRelation();
    addingGPandGCRelationsIsDoneDynamicallyBasedOnPRatherThanStoredInTheObject();
    entriesCannotBeBothTheFocusedNodesGrandparentAndGrandchildBecauseGPshouldWin();
    linkingTogetherStringsShouldCreateEntriesIfTheyDontExist();
    grandRelationsShouldLoseInRankingVsParentAndChildRelations();
    creatingTheDiamondInheritancePatternShouldNotResultInDuplicateGPorGCEntries();
    thePlusOneGenerationShouldBeCalculatedCorrectly();
    theMinusOneGenerationShouldBeCalculatedCorrectly();
    thePlusOrMinusTwoGenerationsShouldBeCalculatedCorrectly();
    theExtraneousCurrentGenerationOfSiblingsAndSpousesShouldBeCalculatedCorrectly();
    renderingWorks();
}
runTestSuite();
