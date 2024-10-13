// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// 1. Create a mapping btw user and post
// 2. Add function to create a post and save it in mapping
// 3. Create a function to posts

import "hardhat/console.sol";

contract X {

    uint16 constant MAX_POST_LENGTH = 256;

    struct Post {
        uint256 id;
        address autor;
        string content;
        uint256 timestamp; 
        uint256 likes;
    }

    mapping(address => Post[]) public posts;
    mapping(address => bool) private censored_accounts;

    address private owner;

    constructor () {
        owner = msg.sender;
    }

    event newPostCreated(address indexed user, string post);
    event postLiked(address indexed user, uint256 post_id);

    function create_post(string calldata _post) is_not_censored_account public {
        require(bytes(_post).length<MAX_POST_LENGTH, "Post is to long.");

        posts[msg.sender].push(Post({
            id: posts[msg.sender].length,
            autor: msg.sender,
            content: _post,
            timestamp: block.timestamp,
            likes: 0
        }));

        emit newPostCreated(msg.sender, _post);
    }

    function get_post(address _owner, uint _i) is_not_censored_account view public returns (Post memory) {
        return posts[_owner][_i];
    }

    function get_all_posts(address _owner) is_not_censored_account view public returns (Post[] memory) {
        return posts[_owner];
    }

    function like_post(address autor, uint256 post_id) external  {
        require(posts[autor][post_id].id == post_id, "Post does not exist");
        posts[autor][post_id].likes++;
        emit postLiked(msg.sender, post_id);
    }

    function unlike_post(address autor, uint256 post_id) external  {
        require(posts[autor][post_id].id == post_id, "Post does not exist");
        require(posts[autor][post_id].likes>0, "Post does not exist");
        posts[autor][post_id].likes--;
    }

    function add_censored_account(address _address) just_for_owner public {
        censored_accounts[_address] = true;
    }
    
    function remove_censored_account(address _address) just_for_owner public {
        delete censored_accounts[_address];
    }

    //Modifiers
    modifier is_not_censored_account () {
        require(!censored_accounts[msg.sender], "This account is censored");
        _;
    }

    modifier just_for_owner () {
        require(msg.sender == owner, "This function is just for owners");
        _;
    }

}