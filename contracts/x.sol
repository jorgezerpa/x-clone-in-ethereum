// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// 1. Create a mapping btw user and post
// 2. Add function to create a post and save it in mapping
// 3. Create a function to posts

contract X {

    uint16 constant MAX_POST_LENGTH = 256;

    struct Post {
        address autor;
        string content;
        uint256 timestamp; 
        uint256 likes;
    }

    mapping(address => Post[]) public posts;

    function create_post(string calldata _post) public {
        require(bytes(_post).length<MAX_POST_LENGTH, "Post is to long.");

        posts[msg.sender].push(Post({
            autor: msg.sender,
            content: _post,
            timestamp: block.timestamp,
            likes: 0
        }));
    }

    function get_post(address _owner, uint _i) view public returns (Post memory) {
        return posts[_owner][_i];
    }

    function get_all_posts(address _owner) view public returns (Post[] memory) {
        return posts[_owner];
    }
}