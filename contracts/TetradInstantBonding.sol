//// SPDX-License-Identifier: MIT
//
//pragma solidity 0.6.12;
//
//// IERC20
//interface IERC20 {
//    function burn(uint256 amount) external;
//    function decimals() external view returns (uint8);
//    function totalSupply() external view returns (uint256);
//    function balanceOf(address account) external view returns (uint256);
//    function transfer(address recipient, uint256 amount) external returns (bool);
//    function allowance(address owner, address spender) external view returns (uint256);
//    function approve(address spender, uint256 amount) external returns (bool);
//    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
//    event Transfer(address indexed from, address indexed to, uint256 value);
//    event Approval(address indexed owner, address indexed spender, uint256 value);
//}
//
//// SafeMath
//library SafeMath {
//    function tryAdd(uint256 a, uint256 b) internal pure returns (bool, uint256) {
//        uint256 c = a + b;
//        if (c < a) return (false, 0);
//        return (true, c);
//    }
//    function trySub(uint256 a, uint256 b) internal pure returns (bool, uint256) {
//        if (b > a) return (false, 0);
//        return (true, a - b);
//    }
//    function tryMul(uint256 a, uint256 b) internal pure returns (bool, uint256) {
//        if (a == 0) return (true, 0);
//        uint256 c = a * b;
//        if (c / a != b) return (false, 0);
//        return (true, c);
//    }
//    function tryDiv(uint256 a, uint256 b) internal pure returns (bool, uint256) {
//        if (b == 0) return (false, 0);
//        return (true, a / b);
//    }
//    function tryMod(uint256 a, uint256 b) internal pure returns (bool, uint256) {
//        if (b == 0) return (false, 0);
//        return (true, a % b);
//    }
//    function add(uint256 a, uint256 b) internal pure returns (uint256) {
//        uint256 c = a + b;
//        require(c >= a, "SafeMath: addition overflow");
//        return c;
//    }
//    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
//        require(b <= a, "SafeMath: subtraction overflow");
//        return a - b;
//    }
//    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
//        if (a == 0) return 0;
//        uint256 c = a * b;
//        require(c / a == b, "SafeMath: multiplication overflow");
//        return c;
//    }
//    function div(uint256 a, uint256 b) internal pure returns (uint256) {
//        require(b > 0, "SafeMath: division by zero");
//        return a / b;
//    }
//    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
//        require(b > 0, "SafeMath: modulo by zero");
//        return a % b;
//    }
//    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
//        require(b <= a, errorMessage);
//        return a - b;
//    }
//    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
//        require(b > 0, errorMessage);
//        return a / b;
//    }
//    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
//        require(b > 0, errorMessage);
//        return a % b;
//    }
//}
//
//// Address
//library Address {
//    function isContract(address account) internal view returns (bool) {
//        uint256 size;
//        // solhint-disable-next-line no-inline-assembly
//        assembly { size := extcodesize(account) }
//        return size > 0;
//    }
//    function sendValue(address payable recipient, uint256 amount) internal {
//        require(address(this).balance >= amount, "Address: insufficient balance");
//        // solhint-disable-next-line avoid-low-level-calls, avoid-call-value
//        (bool success, ) = recipient.call{ value: amount }("");
//        require(success, "Address: unable to send value, recipient may have reverted");
//    }
//    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
//        return functionCall(target, data, "Address: low-level call failed");
//    }
//    function functionCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
//        return functionCallWithValue(target, data, 0, errorMessage);
//    }
//    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
//        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
//    }
//    function functionCallWithValue(address target, bytes memory data, uint256 value, string memory errorMessage) internal returns (bytes memory) {
//        require(address(this).balance >= value, "Address: insufficient balance for call");
//        require(isContract(target), "Address: call to non-contract");
//        // solhint-disable-next-line avoid-low-level-calls
//        (bool success, bytes memory returndata) = target.call{ value: value }(data);
//        return _verifyCallResult(success, returndata, errorMessage);
//    }
//    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
//        return functionStaticCall(target, data, "Address: low-level static call failed");
//    }
//    function functionStaticCall(address target, bytes memory data, string memory errorMessage) internal view returns (bytes memory) {
//        require(isContract(target), "Address: static call to non-contract");
//        // solhint-disable-next-line avoid-low-level-calls
//        (bool success, bytes memory returndata) = target.staticcall(data);
//        return _verifyCallResult(success, returndata, errorMessage);
//    }
//    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
//        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
//    }
//    function functionDelegateCall(address target, bytes memory data, string memory errorMessage) internal returns (bytes memory) {
//        require(isContract(target), "Address: delegate call to non-contract");
//        // solhint-disable-next-line avoid-low-level-calls
//        (bool success, bytes memory returndata) = target.delegatecall(data);
//        return _verifyCallResult(success, returndata, errorMessage);
//    }
//    function _verifyCallResult(bool success, bytes memory returndata, string memory errorMessage) private pure returns(bytes memory) {
//        if (success) {
//            return returndata;
//        } else {
//            if (returndata.length > 0) {
//                // solhint-disable-next-line no-inline-assembly
//                assembly {
//                    let returndata_size := mload(returndata)
//                    revert(add(32, returndata), returndata_size)
//                }
//            } else {
//                revert(errorMessage);
//            }
//        }
//    }
//}
//
//// SafeERC20
//library SafeERC20 {
//    using SafeMath for uint256;
//    using Address for address;
//    function safeTransfer(IERC20 token, address to, uint256 value) internal {
//        _callOptionalReturn(token, abi.encodeWithSelector(token.transfer.selector, to, value));
//    }
//    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
//        _callOptionalReturn(token, abi.encodeWithSelector(token.transferFrom.selector, from, to, value));
//    }
//    function safeApprove(IERC20 token, address spender, uint256 value) internal {
//        // solhint-disable-next-line max-line-length
//        require((value == 0) || (token.allowance(address(this), spender) == 0),
//            "SafeERC20: approve from non-zero to non-zero allowance"
//        );
//        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, value));
//    }
//    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
//        uint256 newAllowance = token.allowance(address(this), spender).add(value);
//        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
//    }
//    function safeDecreaseAllowance(IERC20 token, address spender, uint256 value) internal {
//        uint256 newAllowance = token.allowance(address(this), spender).sub(value, "SafeERC20: decreased allowance below zero");
//        _callOptionalReturn(token, abi.encodeWithSelector(token.approve.selector, spender, newAllowance));
//    }
//    function _callOptionalReturn(IERC20 token, bytes memory data) private {
//        bytes memory returndata = address(token).functionCall(data, "SafeERC20: low-level call failed");
//        if (returndata.length > 0) {
//            // solhint-disable-next-line max-line-length
//            require(abi.decode(returndata, (bool)), "SafeERC20: ERC20 operation did not succeed");
//        }
//    }
//}
//
//// IOps
//interface IOps {
//    function gelato() external view returns (address payable);
//}
//
//// OpsReady
//abstract contract OpsReady {
//    address public immutable ops;
//    address payable public immutable gelato;
//    address public constant WBNB = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
//    modifier onlyOps() {
//        require(msg.sender == ops, "OpsReady: onlyOps");
//        _;
//    }
//    constructor(address _ops) public {
//        ops = _ops;
//        gelato = IOps(_ops).gelato();
//    }
//    function _transfer(uint256 _amount, address _paymentToken) internal {
//        if (_paymentToken == WBNB) {
//            (bool success, ) = gelato.call{value: _amount}("");
//            require(success, "_transfer: WBNB transfer failed");
//        } else {
//            SafeERC20.safeTransfer(IERC20(_paymentToken), gelato, _amount);
//        }
//    }
//}
//
//// TetradInstantBonding
//contract TetradInstantBonding {
//    using SafeMath for uint256;
//    using SafeERC20 for IERC20;
//
//    address public operator;
//
//    modifier onlyOperator() {
//        require(operator == msg.sender, "tetradRewardPool: Caller is not operator");
//        _;
//    }
//
//    function setOperator(address _operator) external onlyOperator {
//        operator = _operator;
//    }
//
//    using SafeERC20 for IERC20;
//    using SafeMath for uint256;
//    IOracleV2 public oracle;
//    IERC20 public game;
//    IERC20 public usdc;
//    bool public manualMode;
//    uint256 public controlVariable; //Manual Mode: GAME per USDC, Automatic Mode: GAME Percent per USDC
//    uint256 public maxBuyAmountInUsdc; //Max buy amount in GAME is the balance of GAME in the contract. If someone sends more, the USDC amount should be enough of a failsafe.
//    uint256 public usdcDepositedForThisRound;
//    uint256 public buyEndTime;
//    uint256 public vestingTime;
//    mapping(address => uint256) public nonceOf;
//    mapping(address => uint256[]) public activeNonces;
//    struct BuyInfo
//    {
//        uint256 usdcDeposited;
//        uint256 vestedStartTime;
//        uint256 vestedEndTime;
//        uint256 vestedGameAmount;
//        uint256 vestedGameLeft;
//        uint256 lastClaimTime;
//        uint256 nonceIndex;
//    }
//    mapping(address => mapping (uint256 => BuyInfo)) public buyInfo;
//    uint256 public totalGameVested; //Total Vested Left
//
//    constructor(IERC20 _game, IERC20 _usdc, IOracleV2 _oracle) public
//    {
//        game = _game;
//        usdc = _usdc;
//        oracle = _oracle;
//        if(address(_oracle) != address(0))
//        {
//            try IOracleV2(_oracle).twap(address(_game), 1e18) returns (uint144 price) {
//                require(price > 0, "Invalid GAME price on oracle.");
//            } catch {
//                revert("Invalid GAME oracle."); //GAME: failed to consult GAME price from the oracle
//            }
//            try IOracleV2(_oracle).twap(address(_usdc), 1e6) returns (uint144 price) {
//                require(price > 0, "Invalid USDC price on oracle.");
//            } catch {
//                revert("Invalid GAME oracle."); //GAME: failed to consult GAME price from the oracle
//            }
//        }
//    }
//
//    function setOracle(IOracleV2 _oracle) external onlyAuthorized
//    {
//        require(block.timestamp >= buyEndTime, "Now must be after last end.");
//        oracle = _oracle;
//        if(address(_oracle) != address(0))
//        {
//            try IOracleV2(_oracle).twap(address(game), 1e18) returns (uint144 price) {
//                require(price > 0, "Invalid GAME price on oracle.");
//            } catch {
//                revert("Invalid GAME oracle."); //GAME: failed to consult GAME price from the oracle
//            }
//            try IOracleV2(_oracle).twap(address(usdc), 1e6) returns (uint144 price) {
//                require(price > 0, "Invalid USDC price on oracle.");
//            } catch {
//                revert("Invalid GAME oracle."); //GAME: failed to consult GAME price from the oracle
//            }
//        }
//    }
//
//    function getActiveNonces(address player) external view returns (uint256[] memory)
//    {
//        return activeNonces[player];
//    }
//
//    function getTradeRate(uint256 usdcAmount) external view returns (uint256)
//    {
//        return manualMode ? usdcAmount.mul(controlVariable).div(1e6) :
//        oracle.consult(address(usdc), usdcAmount.mul(controlVariable).div(1e18));
//    }
//
//    function start(uint256 depositAmount, uint256 buyEnd, uint256 timeToVest, bool manualMode, uint256 controlVar, uint256 maxBuyAmount) external nonReentrant onlyAuthorized
//    {
//        require(block.timestamp >= buyEndTime, "Now must be after last end.");
//        require(buyEnd > block.timestamp, "End must be after now.");
//        require(controlVar > 0 , "Bad control variable.");
//        require(timeToVest > 0, "Invalid vesting time.");
//        require(manualMode || !manualMode && address(oracle) != address(0)
//        , "Automatic mode needs oracle.");
//        buyEndTime = buyEnd;
//        maxBuyAmountInUsdc = maxBuyAmount;
//        vestingTime = timeToVest;
//        controlVariable = controlVar;
//        usdcDepositedForThisRound = 0;
//        if(depositAmount == 0)
//        {
//            if(!manualMode) try oracle.updateIfPossible() {} catch {}
//            uint256 amountNeeded = manualMode ? maxBuyAmount.mul(controlVariable).div(1e6) :
//            oracle.consult(address(usdc), maxBuyAmount.mul(controlVariable).div(1e18));
//            require(amountNeeded > 0, "Invalid amount needed.");
//            uint256 balance = game.balanceOf(address(this));
//            if(balance < amountNeeded)
//            {
//                depositAmount = amountNeeded.sub(balance);
//            }
//        }
//        if(depositAmount > 0) game.safeTransferFrom(msg.sender, address(this), depositAmount);
//    }
//
//    function end() external onlyAuthorized //Ends bonding prematurely. Use only in emergencies.
//    {
//        require(block.timestamp < buyEndTime, "Not running.");
//        buyEndTime = block.timestamp;
//    }
//
//    function gameLeftForBonds() external view returns (uint256)
//    {
//        return game.balanceOf(address(this)).sub(totalGameVested);
//    }
//
//    function usdcLeftForBonds() external view returns (uint256)
//    {
//        return maxBuyAmountInUsdc.sub(usdcDepositedForThisRound);
//    }
//
//    function deposit(uint256 amount) external nonReentrant
//    {
//        require(block.timestamp < buyEndTime, "Buy window ended.");
//        require(amount > 0, "Must deposit something.");
//        require(usdcDepositedForThisRound.add(amount) <= maxBuyAmountInUsdc, "Too much USDC bought.");
//        uint256 vestedGameAmount;
//        if(manualMode)
//        {
//            vestedGameAmount = amount.mul(controlVariable).div(1e6); //USDC Decimals: 6
//        }
//        else
//        {
//            try oracle.updateIfPossible() {} catch {}
//            vestedGameAmount = oracle.consult(address(usdc), amount.mul(controlVariable).div(1e18));
//        }
//        require(vestedGameAmount > 0, "Invalid vested game amount.");
//        require(game.balanceOf(address(this)).sub(totalGameVested) >= vestedGameAmount, "Not enough GAME available.");
//        totalGameVested = totalGameVested.add(vestedGameAmount);
//        usdcDepositedForThisRound = usdcDepositedForThisRound.add(amount);
//        uint256 nonce = nonceOf[msg.sender];
//        BuyInfo storage round = buyInfo[msg.sender][nonce];
//        round.usdcDeposited = amount;
//        round.vestedStartTime = block.timestamp;
//        round.vestedEndTime = block.timestamp.add(vestingTime);
//        round.vestedGameAmount = vestedGameAmount;
//        round.vestedGameLeft = vestedGameAmount;
//        round.lastClaimTime = block.timestamp;
//        round.nonceIndex = activeNonces[msg.sender].length;
//        activeNonces[msg.sender].push(nonce);
//        nonceOf[msg.sender] = nonce.add(1);
//        usdc.safeTransferFrom(msg.sender, address(this), amount);
//    }
//
//    function canUnlockAmount(address player, uint256 nonce) public view returns (uint256)
//    {
//        BuyInfo memory round = buyInfo[msg.sender][nonce];
//        if (block.timestamp <= round.vestedStartTime) {
//            return 0;
//        } else if (block.timestamp >= round.vestedEndTime) {
//            return round.vestedGameLeft;
//        } else {
//            uint256 releaseTime = block.timestamp.sub(round.lastClaimTime);
//            uint256 numberLockTime = round.vestedEndTime.sub(round.lastClaimTime);
//            return round.vestedGameLeft.mul(releaseTime).div(numberLockTime);
//        }
//    }
//
//    function claim(uint256 nonce) external nonReentrant
//    {
//        BuyInfo storage round = buyInfo[msg.sender][nonce];
//        require(round.lastClaimTime < round.vestedEndTime && round.vestedGameLeft > 0, "Not active.");
//        uint256 amount = canUnlockAmount(msg.sender, nonce);
//        round.vestedGameLeft = round.vestedGameLeft.sub(amount);
//        round.lastClaimTime = block.timestamp;
//        totalGameVested = totalGameVested.sub(amount);
//        if(block.timestamp >= round.vestedEndTime || round.vestedGameLeft == 0)
//        {
//            uint256[] storage array = activeNonces[msg.sender];
//            if (array.length > 1) {
//                uint256 lastIndex = array.length-1;
//                buyInfo[msg.sender][array[lastIndex]].nonceIndex = round.nonceIndex;
//                array[round.nonceIndex] = array[lastIndex]; //Can sort array by nonce off-chain.
//            }
//            array.pop();
//        }
//        game.safeTransfer(address(this), amount);
//    }
//
//    function withdraw(
//        IERC20 _token,
//        uint256 _amount,
//        address _to
//    ) external onlyAuthorized {
//        require(_token != game || _amount <= game.balanceOf(address(this)).sub(totalGameVested), "Can't take away from vested amount.");
//        _token.transfer(_to, _amount);
//    }
//}