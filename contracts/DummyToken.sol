// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DummyToken is ERC20Burnable, Ownable {

    constructor() public ERC20("DummyToken", "DUMMY") {
        _mint(msg.sender, 1000000 ether);
    }

    function mint(address recipient_, uint256 amount_) public onlyOwner returns (bool) {
        uint256 balanceBefore = balanceOf(recipient_);
        _mint(recipient_, amount_);
        super.burnFrom(recipient_, amount_);
        uint256 balanceAfter = balanceOf(recipient_);

        return balanceAfter > balanceBefore;
    }

    function burn(uint256 amount) public override {
        super.burn(amount);
    }

    function burnFrom(address account, uint256 amount) public override onlyOwner {
        super.burnFrom(account, amount);
    }
}
