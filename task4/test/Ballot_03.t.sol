// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "forge-std/Test.sol";
import "../src/Ballot_03.sol";

contract BallotTest is Test {
    Ballot ballot;
    bytes32[] proposalNames = [bytes32("Proposal 1"), bytes32("Proposal 2")];
    address chairperson = address(0x999);
    address voter1 = address(0x123);
    address voter2 = address(0x456);
    address voter3 = address(0x789);

    function setUp() public {
        // Deploy the Ballot contract
        vm.prank(chairperson);
        ballot = new Ballot(proposalNames, 0, 3600); // Starts immediately, lasts for 1 hour
    }

    function testGiveRightToVote() public {
        // Give voting rights to voter1
        vm.prank(chairperson);
        ballot.giveRightToVote(voter1);

        // Check if the voter1 has voting rights
        (uint256 weight, bool voted, , ) = ballot.voters(voter1);
        assertEq(weight, 1, "Voter should have weight of 1");
        assertEq(voted, false, "Voter should not have voted yet");
    }

    function testSetVoterWeight() public {
        vm.startPrank(chairperson);
        ballot.giveRightToVote(voter1);

        // Set the voter's weight
        ballot.setVoterWeight(voter1, 5);
        vm.stopPrank();

        // Check if the voter's weight has been updated
        (uint256 weight, , , ) = ballot.voters(voter1);
        assertEq(weight, 5, "Voter's weight should be set to 5");
    }

    function testSetVoterWeightOutsideTimeWindow() public {
        vm.startPrank(chairperson);
        ballot.giveRightToVote(voter1);

        // Fast forward time to after the weight setting period ends
        vm.warp(block.timestamp + 3601); // Move time forward by 3601 seconds

        // Try to set the voter's weight and expect it to revert
        vm.expectRevert("Weight setting is not allowed at this time.");
        ballot.setVoterWeight(voter1, 5);
        vm.stopPrank();
    }

    function testVote() public {
        vm.prank(chairperson);
        ballot.giveRightToVote(voter1);

        // Simulate the voter1 voting
        vm.prank(voter1); // Change context to the voter1
        ballot.vote(0); // Vote for Proposal 1

        // Check if the vote was counted
        (, bool voted, , uint256 vote) = ballot.voters(voter1);
        assertEq(voted, true, "Voter should have voted");
        assertEq(vote, 0, "Voter should have voted for Proposal 1");

        // Check the proposal's vote count
        (, uint256 voteCount) = ballot.proposals(0);
        assertEq(voteCount, 1, "Proposal 1 should have 1 vote");
    }

    function testDelegateVote() public {
        vm.startPrank(chairperson);
        ballot.giveRightToVote(voter1);
        ballot.giveRightToVote(voter2);
        vm.stopPrank();

        // Voter 1 delegates their vote to Voter 2
        vm.prank(voter1);
        ballot.delegate(voter2);

        // Voter 2 votes for Proposal 1
        vm.prank(voter2);
        ballot.vote(0);

        // Check the vote counts
        (, uint256 voteCount) = ballot.proposals(0);
        assertEq(
            voteCount,
            2,
            "Proposal 1 should have 1 vote from Voter 2 and 1 vote from Voter 1 delegate to Voter 2"
        );

        // Check if Voter 1's delegation was recorded
        (, , address delegate, ) = ballot.voters(voter1);
        assertEq(delegate, voter2, "Voter 1 should have delegated to Voter 2");
    }

    function testWinningProposal() public {
        vm.startPrank(chairperson);
        ballot.giveRightToVote(voter1);
        ballot.giveRightToVote(voter2);
        ballot.giveRightToVote(voter3);
        vm.stopPrank();

        // Voter 1 votes for Proposal 1
        vm.prank(voter1);
        ballot.vote(0);

        // Voter 2 votes for Proposal 2
        vm.prank(voter2);
        ballot.vote(1);

        // Voter 3 votes for Proposal 1
        vm.prank(voter3);
        ballot.vote(0);

        // Check the winning proposal
        uint256 winningProposalIndex = ballot.winningProposal();
        assertEq(
            winningProposalIndex,
            0,
            "Proposal 1 should be the winning proposal"
        );
    }

    function testWinnerName() public {
        // Set up the same voting scenario as before
        vm.startPrank(chairperson);
        ballot.giveRightToVote(voter1);
        ballot.giveRightToVote(voter2);
        ballot.giveRightToVote(voter3);
        vm.stopPrank();

        // Voter 1 votes for Proposal 1
        vm.prank(voter1);
        ballot.vote(0);

        // Voter 2 votes for Proposal 2
        vm.prank(voter2);
        ballot.vote(1);

        // Voter 3 votes for Proposal 1
        vm.prank(voter3);
        ballot.vote(0);

        // Check the winner's name
        bytes32 winnerName = ballot.winnerName();
        assertEq(
            winnerName,
            bytes32("Proposal 1"),
            "Winner should be Proposal 1"
        );
    }
}
