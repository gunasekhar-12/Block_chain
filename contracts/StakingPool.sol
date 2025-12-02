// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title StakingPool
 * @dev Allows users to stake tokens and earn rewards over time
 */
contract StakingPool is ReentrancyGuard, Ownable {
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;
    
    uint256 public constant REWARD_RATE = 10; // 10% APY
    uint256 public constant YEAR_IN_SECONDS = 365 days;
    uint256 public constant RATE_DENOMINATOR = 100;
    
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 rewardDebt;
    }
    
    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);
    event RewardClaimed(address indexed user, uint256 reward);
    
    constructor(address _stakingToken, address _rewardToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }
    
    /**
     * @dev Stake tokens
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        
        // Claim any pending rewards first
        if (stakes[msg.sender].amount > 0) {
            _claimReward();
        }
        
        // Transfer tokens from user
        stakingToken.transferFrom(msg.sender, address(this), amount);
        
        // Update stake info
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].startTime = block.timestamp;
        stakes[msg.sender].rewardDebt = 0;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Unstake tokens and claim rewards
     */
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot unstake 0");
        require(stakes[msg.sender].amount >= amount, "Insufficient staked amount");
        
        // Calculate and transfer rewards
        uint256 reward = calculateReward(msg.sender);
        
        // Update stake info
        stakes[msg.sender].amount -= amount;
        totalStaked -= amount;
        
        if (stakes[msg.sender].amount == 0) {
            delete stakes[msg.sender];
        } else {
            stakes[msg.sender].startTime = block.timestamp;
            stakes[msg.sender].rewardDebt = 0;
        }
        
        // Transfer staked tokens back
        stakingToken.transfer(msg.sender, amount);
        
        // Transfer rewards if any
        if (reward > 0) {
            rewardToken.transfer(msg.sender, reward);
        }
        
        emit Unstaked(msg.sender, amount, reward);
    }
    
    /**
     * @dev Claim accumulated rewards without unstaking
     */
    function claimReward() external nonReentrant {
        _claimReward();
    }
    
    function _claimReward() internal {
        uint256 reward = calculateReward(msg.sender);
        require(reward > 0, "No rewards to claim");
        
        // Reset reward tracking
        stakes[msg.sender].startTime = block.timestamp;
        stakes[msg.sender].rewardDebt = 0;
        
        // Transfer rewards
        rewardToken.transfer(msg.sender, reward);
        
        emit RewardClaimed(msg.sender, reward);
    }
    
    /**
     * @dev Calculate pending rewards for a user
     */
    function calculateReward(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        
        if (userStake.amount == 0) {
            return 0;
        }
        
        uint256 stakingDuration = block.timestamp - userStake.startTime;
        
        // Reward = (staked amount * reward rate * time staked) / (year in seconds * 100)
        uint256 reward = (userStake.amount * REWARD_RATE * stakingDuration) / 
                        (YEAR_IN_SECONDS * RATE_DENOMINATOR);
        
        return reward - userStake.rewardDebt;
    }
    
    /**
     * @dev Get staking info for a user
     */
    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 startTime,
        uint256 pendingReward,
        uint256 apy
    ) {
        StakeInfo memory userStake = stakes[user];
        return (
            userStake.amount,
            userStake.startTime,
            calculateReward(user),
            REWARD_RATE
        );
    }
    
    /**
     * @dev Fund the staking pool with reward tokens (only owner)
     */
    function fundRewards(uint256 amount) external onlyOwner {
        rewardToken.transferFrom(msg.sender, address(this), amount);
    }
    
    /**
     * @dev Emergency withdraw for owner (use carefully)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }
}
